import { META, readMetadata, type Type, type AbstractType } from '../core/metadata'

/**
 * Lifetime of a provider:
 * - `root`      one instance per server (Angular `providedIn: 'root'`)
 * - `session`   one instance per connected client session
 * - `transient` a new instance on every injection
 */
export type Scope = 'root' | 'session' | 'transient'

export class InjectionToken<T> {
  declare readonly __type?: T
  constructor(readonly description: string, readonly options?: { factory?: () => T, scope?: Scope }) {}
  toString() {
    return `InjectionToken(${this.description})`
  }
}

export type ProviderToken<T> = Type<T> | AbstractType<T> | InjectionToken<T>

interface BaseProvider<T> {
  provide: ProviderToken<T>
  scope?: Scope
  multi?: boolean
}
export interface ClassProvider<T> extends BaseProvider<T> { useClass: Type<T> }
export interface ValueProvider<T> extends BaseProvider<T> { useValue: T }
export interface FactoryProvider<T> extends BaseProvider<T> { useFactory: () => T }
export interface ExistingProvider<T> extends BaseProvider<T> { useExisting: ProviderToken<T> }

export type Provider<T = unknown> =
  | Type<T>
  | ClassProvider<T>
  | ValueProvider<T>
  | FactoryProvider<T>
  | ExistingProvider<T>

export interface InjectableOptions {
  scope?: Scope
}

/**
 * Marks a class as injectable. Injectable classes resolve without being listed
 * in any `providers` array, like Angular's `providedIn: 'root'`.
 */
export function Injectable(options: InjectableOptions = {}) {
  return (_target: Type, context: ClassDecoratorContext) => {
    context.metadata[META.injectable] = { scope: options.scope ?? 'root' }
  }
}

export interface OnInit { onInit(): void | Promise<void> }
export interface OnDestroy { onDestroy(): void | Promise<void> }

interface Record {
  factory: (injector: Injector) => unknown
  scope: Scope
  multi: boolean
}

function tokenName(token: ProviderToken<unknown>): string {
  return typeof token === 'function' ? token.name : String(token)
}

export class DependencyError extends Error {}

/**
 * The currently constructing injector. `inject()` reads it, which lets field
 * initializers pull dependencies without constructor parameter metadata.
 */
let current: Injector | null = null

export function inject<T>(token: ProviderToken<T>): T
export function inject<T>(token: ProviderToken<T>, options: { optional: true }): T | null
export function inject<T>(token: ProviderToken<T>, options?: { optional?: boolean }): T | null {
  if (!current) {
    throw new DependencyError(`inject(${tokenName(token)}) must be called while an injector is constructing an object`)
  }
  return options?.optional ? current.get(token, { optional: true }) : current.get(token)
}

export function runInInjectionContext<R>(injector: Injector, fn: () => R): R {
  const previous = current
  current = injector
  try {
    return fn()
  } finally {
    current = previous
  }
}

/**
 * Hierarchical injector. The root injector owns the provider registry; session
 * injectors are children that instantiate `session` scoped providers locally
 * and delegate `root` scoped ones to the root.
 */
export class Injector {
  private readonly records = new Map<ProviderToken<unknown>, Record[]>()
  private readonly instances = new Map<ProviderToken<unknown>, unknown>()
  private readonly resolving = new Set<ProviderToken<unknown>>()
  private readonly created: unknown[] = []
  private destroyed = false

  constructor(readonly parent: Injector | null = null, readonly scope: 'root' | 'session' = parent ? 'session' : 'root') {}

  get root(): Injector {
    return this.parent ? this.parent.root : this
  }

  provide(...providers: Provider[]): this {
    for (const provider of providers) {
      this.register(provider)
    }
    return this
  }

  has(token: ProviderToken<unknown>): boolean {
    return this.records.has(token) || (this.parent?.has(token) ?? false)
  }

  get<T>(token: ProviderToken<T>): T
  get<T>(token: ProviderToken<T>, options: { optional: true }): T | null
  get<T>(token: ProviderToken<T>, options?: { optional?: boolean }): T | null {
    if (this.destroyed) {
      throw new DependencyError(`Injector is destroyed, cannot resolve ${tokenName(token)}`)
    }

    const records = this.lookup(token)
    if (!records) {
      if (options?.optional) return null
      throw new DependencyError(`No provider for ${tokenName(token)}`)
    }

    // Root singletons live on the injector that registered them. Session and
    // transient providers are built by the requesting injector so they can
    // depend on session state.
    if (records.owner !== this && records.scope === 'root') {
      return records.owner.get(token)
    }

    if (records.scope === 'session' && this.scope !== 'session') {
      throw new DependencyError(`${tokenName(token)} is session scoped and can only be injected inside a session`)
    }

    if (records.scope !== 'transient' && this.instances.has(token)) {
      return this.instances.get(token) as T
    }

    if (this.resolving.has(token)) {
      throw new DependencyError(`Circular dependency while resolving ${tokenName(token)}`)
    }

    this.resolving.add(token)
    try {
      const value = records.multi
        ? records.list.map(record => this.instantiate(record))
        : this.instantiate(records.list[records.list.length - 1])
      if (records.scope !== 'transient') {
        this.instances.set(token, value)
      }
      return value as T
    } finally {
      this.resolving.delete(token)
    }
  }

  /**
   * Instantiates a class in this injector's context without registering it.
   * Field initializers of the class may call `inject()`.
   */
  construct<T>(type: Type<T>, ...args: unknown[]): T {
    const instance = runInInjectionContext(this, () => new type(...args))
    this.created.push(instance)
    return instance
  }

  async destroy(): Promise<void> {
    if (this.destroyed) return
    this.destroyed = true
    for (const instance of [...this.created].reverse()) {
      const hook = (instance as Partial<OnDestroy>)?.onDestroy
      if (typeof hook === 'function') {
        await hook.call(instance)
      }
    }
    this.instances.clear()
    this.created.length = 0
  }

  private register(provider: Provider) {
    if (typeof provider === 'function') {
      const scope = readMetadata<InjectableOptions>(provider, META.injectable)?.scope ?? 'root'
      this.addRecord(provider, { factory: injector => injector.construct(provider), scope, multi: false })
      return
    }

    const scope = provider.scope ?? 'root'
    const multi = provider.multi ?? false
    let factory: Record['factory']
    if ('useValue' in provider) {
      factory = () => provider.useValue
    } else if ('useClass' in provider) {
      factory = injector => injector.construct(provider.useClass)
    } else if ('useFactory' in provider) {
      factory = injector => runInInjectionContext(injector, provider.useFactory)
    } else {
      factory = injector => injector.get(provider.useExisting)
    }
    this.addRecord(provider.provide, { factory, scope, multi })
  }

  private addRecord(token: ProviderToken<unknown>, record: Record) {
    const list = this.records.get(token)
    if (record.multi && list) {
      list.push(record)
    } else {
      this.records.set(token, [record])
    }
  }

  /**
   * Finds provider records for a token, walking up to the root. `@Injectable`
   * classes and tokens with a factory register themselves lazily on the root.
   */
  private lookup(token: ProviderToken<unknown>): { owner: Injector, list: Record[], scope: Scope, multi: boolean } | null {
    const list = this.records.get(token)
    if (list) {
      return { owner: this, list, scope: list[0].scope, multi: list[0].multi }
    }
    if (this.parent) {
      return this.parent.lookup(token)
    }

    if (token instanceof InjectionToken && token.options?.factory) {
      this.register({ provide: token, useFactory: token.options.factory, scope: token.options.scope })
      return this.lookup(token)
    }
    if (typeof token === 'function' && readMetadata(token, META.injectable)) {
      this.register(token as Type)
      return this.lookup(token)
    }
    return null
  }

  private instantiate(record: Record): unknown {
    return record.factory(this)
  }
}
