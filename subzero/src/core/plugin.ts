import type { Injector, Provider } from '../di/injector'
import type { Logger } from './logger'
import type { ClientMessage } from '../protocol'
import type { Session } from '../server/session'

/**
 * Wraps every message a client sends. Call `next()` to continue down the
 * chain; skip it to swallow the message.
 */
export type MessageInterceptor = (message: ClientMessage, session: Session, next: () => Promise<void>) => Promise<void>

export type RouteHandler = (request: Request) => Response | Promise<Response>

export interface PluginContext {
  readonly injector: Injector
  readonly logger: Logger
  /** Registers providers on the root injector */
  provide(...providers: Provider[]): void
  /** Adds a message interceptor, run in installation order */
  intercept(interceptor: MessageInterceptor): void
  /** Serves an HTTP route on every HTTP-capable transport */
  route(path: string, handler: RouteHandler): void
}

export interface SubZeroPlugin {
  readonly name: string
  setup?(context: PluginContext): void | Promise<void>
  onSessionStart?(session: Session): void | Promise<void>
  onSessionEnd?(session: Session): void | Promise<void>
  onStop?(): void | Promise<void>
}

/**
 * Declares a configurable plugin:
 *
 * ```ts
 * export const healthCheck = definePlugin((options: { path?: string }) => ({
 *   name: 'health',
 *   setup(ctx) { ctx.route(options.path ?? '/health', () => new Response('ok')) },
 * }))
 *
 * @Application({ plugins: [healthCheck({ path: '/status' })] })
 * ```
 */
export function definePlugin<O extends object = Record<string, never>>(factory: (options: O) => SubZeroPlugin) {
  return (options: O = {} as O): SubZeroPlugin => factory(options)
}
