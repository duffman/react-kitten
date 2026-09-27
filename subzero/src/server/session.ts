import { Injector } from '../di/injector'
import { TApplication } from '../vcl/application'
import { TControl } from '../vcl/control'
import type { TComponent } from '../vcl/component'
import type { ApplicationHooks } from '../core/application'
import type { TRunArgs } from '../vcl/types'
import type { ClientMessage, DialogRequest, ServerMessage } from '../protocol'
import type { Connection } from './transport'
import type { SubZeroServer } from './server'
import { runInSession } from './context'

/**
 * One running instance of the application. Every client connection gets a
 * session with its own injector, `TApplication` and forms. The headless host
 * instance is a session without a connection.
 */
export class Session {
  readonly id = crypto.randomUUID()
  readonly injector: Injector
  application!: TApplication
  instance!: ApplicationHooks

  #components = new Map<string, TComponent>()
  #nextId = 0
  #renderQueued = false
  #dialogs = new Map<string, (button: string) => void>()
  #ready: Promise<void> = Promise.resolve()
  #queue: Promise<void> = Promise.resolve()
  #closed = false

  constructor(readonly server: SubZeroServer, readonly connection: Connection | null) {
    this.injector = new Injector(server.injector)
    this.injector.provide(
      { provide: Session, useValue: this },
      { provide: TApplication, useFactory: () => this.application },
    )
  }

  get headless(): boolean {
    return this.connection === null
  }

  get closed(): boolean {
    return this.#closed
  }

  /** Looks up a component by the id the client knows it as */
  component(id: string): TComponent | undefined {
    return this.#components.get(id)
  }

  start(): Promise<void> {
    this.#ready = runInSession(this, () => this.boot()).catch(async error => {
      await this.handleError(error)
      await this.close('startup failed')
    })
    return this.#ready
  }

  private async boot() {
    const { appClass, options } = this.server
    this.application = new TApplication()
    this.application.title = options.title ?? appClass.name
    this.instance = this.injector.construct(appClass)

    this.send({ t: 'hello', sessionId: this.id, title: this.application.title })

    for (const plugin of this.server.plugins) {
      await plugin.onSessionStart?.(this)
    }

    const runArgs: TRunArgs = {
      args: Bun.argv.slice(2),
      env: process.env,
      params: this.connection?.params ?? {},
      sessionId: this.id,
      headless: this.headless,
    }
    await this.instance.onCreate?.(runArgs)

    // Delphi's Application.Run shows the main form once initialization is done
    if (!this.headless) {
      this.application.mainForm?.show()
    }
    this.scheduleRender()
  }

  register(component: TComponent): string {
    const id = `c${++this.#nextId}`
    this.#components.set(id, component)
    return id
  }

  unregister(component: TComponent): void {
    this.#components.delete(component.id)
  }

  /** Coalesces every change made in the current tick into one render */
  scheduleRender(): void {
    if (this.#renderQueued || this.#closed || this.headless) return
    this.#renderQueued = true
    queueMicrotask(() => {
      this.#renderQueued = false
      if (!this.#closed && this.application) this.render()
    })
  }

  render(): void {
    this.send({
      t: 'render',
      title: this.application.title,
      forms: this.application.forms.filter(form => form.visible).map(form => form.toView()),
    })
  }

  send(message: ServerMessage): void {
    if (this.#closed && message.t !== 'bye') return
    this.connection?.send(JSON.stringify(message))
  }

  /** Entry point for raw messages from the transport */
  receive(raw: string): void {
    let message: ClientMessage
    try {
      message = parseClientMessage(raw)
    } catch (error) {
      this.server.logger.warn(`Session ${this.id}: dropped malformed message`, error)
      return
    }

    // Dialog answers bypass the queue: the code awaiting them may be what is
    // holding the queue (or startup) up.
    if (message.t === 'dialogResult') {
      this.#dialogs.get(message.id)?.(message.button)
      this.#dialogs.delete(message.id)
      return
    }

    this.#queue = this.#queue
      .then(() => this.#ready)
      .then(() => runInSession(this, () => this.process(message)))
      .catch(error => this.handleError(error))
  }

  private async process(message: ClientMessage) {
    if (this.#closed) return
    await this.server.intercept(message, this, async () => {
      if (message.t !== 'event') return

      const component = this.#components.get(message.id)
      if (!component || (component instanceof TControl && !component.acceptsEvent(message.name))) {
        this.server.logger.debug(`Session ${this.id}: ignored ${message.name} on ${message.id}`)
        return
      }

      if (component.dispatch(message.name, message.data)) {
        const result = this.instance.onEvent?.({
          sender: component,
          name: message.name,
          data: message.data,
          timestamp: Date.now(),
        })
        if (result instanceof Promise) this.track(result)
      }
    })
  }

  /** Shows a dialog on the client and resolves with the chosen button */
  dialog(request: Omit<DialogRequest, 'id'>): Promise<string> {
    if (this.headless || this.#closed) {
      this.server.logger.info(`[${request.kind}] ${request.text}`)
      return Promise.resolve(request.buttons[0] ?? 'cancel')
    }
    const id = crypto.randomUUID()
    return new Promise(resolve => {
      this.#dialogs.set(id, resolve)
      this.send({ t: 'dialog', dialog: { id, ...request } })
    })
  }

  /** Routes errors of a floating promise (async handler) to `handleError` */
  track(promise: Promise<unknown>): void {
    promise.catch(error => runInSession(this, () => this.handleError(error)))
  }

  async handleError(error: unknown): Promise<void> {
    if (this.instance?.onException) {
      try {
        await this.instance.onException(error)
        return
      } catch (nested) {
        error = nested
      }
    }
    this.server.logger.error(`Session ${this.id}:`, error)
    this.send({ t: 'error', message: error instanceof Error ? error.message : String(error) })
  }

  async close(reason: string): Promise<void> {
    if (this.#closed) return
    this.#closed = true

    for (const resolve of this.#dialogs.values()) resolve('cancel')
    this.#dialogs.clear()

    await runInSession(this, async () => {
      try {
        await this.instance?.onDestroy?.(this.application)
      } catch (error) {
        this.server.logger.error(`Session ${this.id}: onDestroy failed`, error)
      }
      this.application?.destroy()
      for (const plugin of this.server.plugins) {
        await plugin.onSessionEnd?.(this)
      }
      await this.injector.destroy()
    })

    this.send({ t: 'bye', reason })
    this.connection?.close()
    this.server.sessionClosed(this)
  }
}

function parseClientMessage(raw: string): ClientMessage {
  const message = JSON.parse(raw) as Partial<ClientMessage>
  if (message.t === 'event' && typeof message.id === 'string' && typeof message.name === 'string') {
    const data = message.data
    if (data !== undefined && (typeof data !== 'object' || data === null || Array.isArray(data))) {
      throw new Error('event data must be an object')
    }
    return message as ClientMessage
  }
  if (message.t === 'dialogResult' && typeof message.id === 'string' && typeof message.button === 'string') {
    return message as ClientMessage
  }
  throw new Error(`unknown message ${JSON.stringify(message).slice(0, 100)}`)
}
