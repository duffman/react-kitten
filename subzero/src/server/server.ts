import { Injector, type Provider } from '../di/injector'
import { applicationOptions, type ApplicationHooks, type ApplicationOptions } from '../core/application'
import { resolveModules } from '../core/module'
import { Logger, type LogLevel } from '../core/logger'
import type { MessageInterceptor, PluginContext, RouteHandler, SubZeroPlugin } from '../core/plugin'
import type { Type } from '../core/metadata'
import type { ClientMessage } from '../protocol'
import type { Connection, ConnectionHandler, Transport, TransportHost } from './transport'
import { Session } from './session'
import { setHostSession, currentSession } from './context'

export interface ServerOptions {
  /** Extra plugins, installed after those declared by modules */
  plugins?: SubZeroPlugin[]
  /** Extra root providers, registered after those declared by modules */
  providers?: Provider[]
  logLevel?: LogLevel
  /** Run the invisible host instance of the application (default true) */
  headless?: boolean
}

export class SubZeroServer implements TransportHost {
  readonly injector = new Injector()
  readonly logger: Logger
  readonly routes = new Map<string, RouteHandler>()
  readonly sessions = new Set<Session>()
  readonly plugins: SubZeroPlugin[] = []
  readonly options: ApplicationOptions
  host: Session | null = null

  #interceptors: MessageInterceptor[] = []
  #modules: unknown[] = []
  #started = false

  constructor(
    readonly appClass: Type<ApplicationHooks>,
    readonly transports: Transport[],
    readonly serverOptions: ServerOptions = {},
  ) {
    this.options = applicationOptions(appClass)
    this.logger = this.injector.get(Logger)
    if (serverOptions.logLevel) this.logger.level = serverOptions.logLevel
  }

  async start(): Promise<this> {
    if (this.#started) return this
    this.#started = true

    this.injector.provide({ provide: SubZeroServer, useValue: this })
    const modules = resolveModules(this.appClass)
    for (const module of modules) {
      this.injector.provide(...module.providers)
    }
    this.injector.provide(...(this.serverOptions.providers ?? []))

    // Module classes are singletons (the application class is per session)
    for (const module of modules) {
      if (module.type === this.appClass) continue
      const instance = this.injector.construct(module.type)
      this.#modules.push(instance)
      await (instance as { onModuleInit?(): unknown }).onModuleInit?.()
    }

    const context: PluginContext = {
      injector: this.injector,
      logger: this.logger,
      provide: (...providers) => { this.injector.provide(...providers) },
      intercept: interceptor => { this.#interceptors.push(interceptor) },
      route: (path, handler) => { this.routes.set(path, handler) },
    }
    const plugins = [...modules.flatMap(m => m.plugins), ...(this.serverOptions.plugins ?? [])]
    for (const plugin of plugins) {
      await plugin.setup?.(context)
      this.plugins.push(plugin)
      this.logger.debug(`Plugin ${plugin.name} installed`)
    }

    if (this.serverOptions.headless ?? true) {
      this.host = new Session(this, null)
      setHostSession(this.host)
      await this.host.start()
    }

    for (const transport of this.transports) {
      await transport.listen(this)
      this.logger.info(`${this.options.title ?? this.appClass.name}: ${transport.name} transport listening`)
    }
    return this
  }

  connect(connection: Connection): ConnectionHandler {
    const session = new Session(this, connection)
    this.sessions.add(session)
    void session.start()
    return {
      message: data => session.receive(data),
      closed: () => { void session.close('disconnected') },
    }
  }

  sessionClosed(session: Session): void {
    this.sessions.delete(session)
  }

  /** Runs a client message through the plugin interceptors, then `handler` */
  async intercept(message: ClientMessage, session: Session, handler: () => Promise<void>): Promise<void> {
    const run = async (index: number): Promise<void> => {
      const interceptor = this.#interceptors[index]
      if (!interceptor) return handler()
      await interceptor(message, session, () => run(index + 1))
    }
    await run(0)
  }

  async stop(): Promise<void> {
    for (const transport of this.transports) {
      await transport.close()
    }
    await Promise.all([...this.sessions].map(session => session.close('server stopped')))
    if (this.host) {
      await this.host.close('server stopped')
      if (currentSession() === this.host) setHostSession(null)
      this.host = null
    }
    for (const plugin of [...this.plugins].reverse()) {
      await plugin.onStop?.()
    }
    for (const module of [...this.#modules].reverse()) {
      await (module as { onModuleDestroy?(): unknown }).onModuleDestroy?.()
    }
    await this.injector.destroy()
  }
}

function isTransport(value: unknown): value is Transport {
  return typeof (value as Transport | undefined)?.listen === 'function'
}

export const SubZero = {
  /**
   * Bootstraps an `@Application` class, installs its modules and plugins,
   * starts the headless host instance and opens the transports.
   *
   * ```ts
   * const server = await SubZero.createServer(MyApp, transport({ port: 3000, client: true }))
   * ```
   */
  async createServer(appClass: Type<ApplicationHooks>, ...args: (Transport | ServerOptions)[]): Promise<SubZeroServer> {
    const transports = args.filter(isTransport)
    const options = Object.assign({}, ...args.filter(arg => !isTransport(arg))) as ServerOptions
    return new SubZeroServer(appClass, transports, options).start()
  },
}
