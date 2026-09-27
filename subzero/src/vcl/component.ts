import { META, ownList, readMetadata } from '../core/metadata'
import { currentSession } from '../server/context'
import type { Session } from '../server/session'
import type { PropValue } from '../protocol'

export type TNotifyEvent = (sender: TObject) => void | Promise<void>

export class TObject {
  className(): string {
    return this.constructor.name
  }

  free(): void {
    this.destroy()
  }

  destroy(): void {}
}

let detachedIds = 0

/**
 * Published property. Assigning it marks the owning form for re-render, and
 * its value is sent to the client.
 *
 * ```ts
 * @published accessor caption = 'Button'
 * ```
 */
export function published<This extends TComponent, V>(
  target: ClassAccessorDecoratorTarget<This, V>,
  context: ClassAccessorDecoratorContext<This, V>,
): ClassAccessorDecoratorResult<This, V> {
  ownList<string | symbol>(context.metadata, META.published).push(context.name)
  return {
    get() {
      return target.get.call(this)
    },
    set(value) {
      if (target.get.call(this) === value) return
      target.set.call(this, value)
      this.invalidate()
    },
  }
}

/**
 * Event handler property. The client only reports events that have a handler
 * assigned. `onClick` maps to the client event `click`.
 */
export function event<This extends TComponent, V>(_target: undefined, context: ClassFieldDecoratorContext<This, V>) {
  ownList<string | symbol>(context.metadata, META.events).push(context.name)
}

export function eventName(field: string): string {
  return field.replace(/^on/, '').toLowerCase()
}

export class TComponent extends TObject {
  readonly id: string
  readonly session: Session | null
  name = ''
  tag = 0

  #owner: TComponent | null
  #components: TComponent[] = []
  #destroyed = false
  #silent = 0

  onDestroy: TNotifyEvent | null = null

  constructor(owner: TComponent | null = null) {
    super()
    this.session = owner?.session ?? currentSession()
    this.id = this.session ? this.session.register(this) : `detached-${++detachedIds}`
    this.#owner = owner
    if (owner) owner.#components.push(this)
  }

  get owner(): TComponent | null {
    return this.#owner
  }

  get components(): readonly TComponent[] {
    return this.#components
  }

  get destroyed(): boolean {
    return this.#destroyed
  }

  findComponent(name: string): TComponent | null {
    for (const component of this.#components) {
      if (component.name === name) return component
      const found = component.findComponent(name)
      if (found) return found
    }
    return null
  }

  /** Requests a re-render of the session's forms. Renders are batched per tick. */
  invalidate(): void {
    if (this.#silent === 0) {
      this.session?.scheduleRender()
    }
  }

  /** Runs `fn` without scheduling a render, e.g. to apply state the client already shows */
  silently(fn: () => void): void {
    this.#silent++
    try {
      fn()
    } finally {
      this.#silent--
    }
  }

  /** Handles an event the client reported. Returns false if unhandled. */
  dispatch(name: string, _data: Record<string, PropValue> | undefined): boolean {
    const field = readMetadata<string[]>(this.constructor, META.events)?.find(f => eventName(f) === name)
    const handler = field ? (this as unknown as Record<string, unknown>)[field] : null
    if (typeof handler !== 'function') return false
    this.fire(handler as TNotifyEvent)
    return true
  }

  /**
   * Invokes an event handler. Async handlers are not awaited, so a handler may
   * `await MessageDlg(...)` without blocking the messages that answer it;
   * their errors still reach the application's `onException`.
   */
  protected fire<A extends unknown[]>(handler: ((sender: TObject, ...args: A) => unknown) | null | undefined, ...args: A): void {
    if (!handler) return
    const result = handler.call(this, this, ...args)
    if (result instanceof Promise) {
      this.session?.track(result)
    }
  }

  override destroy(): void {
    if (this.#destroyed) return
    this.onDestroy?.(this)
    for (const child of [...this.#components].reverse()) {
      child.destroy()
    }
    this.#destroyed = true
    if (this.#owner) {
      this.#owner.#components = this.#owner.#components.filter(c => c !== this)
    }
    this.session?.unregister(this)
  }
}
