import { definePlugin } from './core/plugin'

/** Answers `GET /health` (or `path`) with the number of live sessions */
export const healthCheck = definePlugin((options: { path?: string }) => {
  let sessions = 0
  return {
    name: 'health-check',
    setup(ctx) {
      ctx.route(options.path ?? '/health', () => Response.json({ status: 'ok', sessions }))
    },
    onSessionStart(session) {
      if (!session.headless) sessions++
    },
    onSessionEnd(session) {
      if (!session.headless) sessions--
    },
  }
})

/** Logs session starts and ends, and every client message at debug level */
export const sessionLogger = definePlugin(() => {
  let logger: import('./core/logger').Logger
  return {
    name: 'session-logger',
    setup(ctx) {
      logger = ctx.logger
      ctx.intercept(async (message, session, next) => {
        logger.debug(`${session.id} ->`, message)
        await next()
      })
    },
    onSessionStart(session) {
      logger.info(`Session ${session.id} started${session.headless ? ' (headless host)' : ''}`)
    },
    onSessionEnd(session) {
      logger.info(`Session ${session.id} ended`)
    },
  }
})

/**
 * Drops client messages above `perSecond` for a session, and closes sessions
 * that keep flooding. Dialog answers are never limited.
 */
export const rateLimit = definePlugin((options: { perSecond?: number, disconnectAfter?: number }) => {
  const perSecond = options.perSecond ?? 50
  const disconnectAfter = options.disconnectAfter ?? perSecond * 5
  const windows = new WeakMap<object, { start: number, count: number, dropped: number }>()

  return {
    name: 'rate-limit',
    setup(ctx) {
      ctx.intercept(async (_message, session, next) => {
        const now = Date.now()
        let window = windows.get(session)
        if (!window || now - window.start >= 1000) {
          window = { start: now, count: 0, dropped: window?.dropped ?? 0 }
          windows.set(session, window)
        }
        if (++window.count <= perSecond) {
          await next()
          return
        }
        if (++window.dropped >= disconnectAfter) {
          ctx.logger.warn(`Session ${session.id} closed for flooding`)
          await session.close('rate limited')
        }
      })
    },
  }
})
