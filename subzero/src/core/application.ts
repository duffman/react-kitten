import { META, readMetadata, type Type } from './metadata'
import type { ModuleOptions } from './module'
import type { TComponent, TObject } from '../vcl/component'
import type { TRunArgs } from '../vcl/types'
import type { PropValue } from '../protocol'

export interface ApplicationOptions extends ModuleOptions {
  title?: string
}

export interface TAppEvent {
  sender: TComponent
  name: string
  data?: Record<string, PropValue>
  timestamp: number
}

/**
 * Optional hooks an `@Application` class may implement. The class is
 * instantiated once per client session and once for the headless host.
 */
export interface ApplicationHooks {
  onCreate?(runArgs: TRunArgs): void | Promise<void>
  onDestroy?(sender: TObject): void | Promise<void>
  /** Every client event, after the control's own handler ran */
  onEvent?(event: TAppEvent): void | Promise<void>
  /** Errors thrown by handlers. Without this hook, the client is shown the message. */
  onException?(error: unknown): void | Promise<void>
}

/**
 * Marks the application class. It doubles as the root module, so it accepts
 * `imports`, `providers` and `plugins` like `@Module`.
 */
export function Application(options: ApplicationOptions = {}) {
  return (_target: Type<ApplicationHooks>, context: ClassDecoratorContext) => {
    context.metadata[META.module] = options
    context.metadata[META.application] = options
  }
}

export function applicationOptions(type: Type): ApplicationOptions {
  const options = readMetadata<ApplicationOptions>(type, META.application)
  if (!options) {
    throw new Error(`${type.name} is not decorated with @Application`)
  }
  return options
}
