import { META, readMetadata, type Type } from './metadata'
import type { Provider } from '../di/injector'
import type { SubZeroPlugin } from './plugin'

export interface ModuleOptions {
  /** Other modules whose providers and plugins this module depends on */
  imports?: ModuleImport[]
  /** Providers registered on the root injector (scope set per provider) */
  providers?: Provider[]
  /** Plugins installed when the server starts */
  plugins?: SubZeroPlugin[]
}

/**
 * A module plus extra configuration, returned by `static forRoot()` style
 * methods (NestJS dynamic modules, Angular `ModuleWithProviders`).
 */
export interface ModuleWithProviders {
  module: Type
  providers?: Provider[]
  plugins?: SubZeroPlugin[]
}

export type ModuleImport = Type | ModuleWithProviders

export interface OnModuleInit { onModuleInit(): void | Promise<void> }
export interface OnModuleDestroy { onModuleDestroy(): void | Promise<void> }

export function Module(options: ModuleOptions = {}) {
  return (_target: Type, context: ClassDecoratorContext) => {
    context.metadata[META.module] = options
  }
}

export interface ResolvedModule {
  type: Type
  providers: Provider[]
  plugins: SubZeroPlugin[]
}

/**
 * Flattens the import graph depth first so that a module always comes after
 * the modules it imports. Each module appears once, even if imported twice.
 */
export function resolveModules(root: ModuleImport): ResolvedModule[] {
  const resolved: ResolvedModule[] = []
  const seen = new Set<Type>()

  const visit = (entry: ModuleImport, path: Type[]) => {
    const type = typeof entry === 'function' ? entry : entry.module
    if (path.includes(type)) {
      throw new Error(`Circular module import: ${[...path, type].map(t => t.name).join(' -> ')}`)
    }
    if (seen.has(type)) return

    const options = readMetadata<ModuleOptions>(type, META.module)
    if (!options) {
      throw new Error(`${type.name} is not decorated with @Module or @Application`)
    }

    for (const child of options.imports ?? []) {
      visit(child, [...path, type])
    }

    seen.add(type)
    const extra: Partial<ModuleWithProviders> = typeof entry === 'function' ? {} : entry
    resolved.push({
      type,
      providers: [...(options.providers ?? []), ...(extra.providers ?? [])],
      plugins: [...(options.plugins ?? []), ...(extra.plugins ?? [])],
    })
  }

  visit(root, [])
  return resolved
}
