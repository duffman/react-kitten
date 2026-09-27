import { AsyncLocalStorage } from 'node:async_hooks'
import type { Session } from './session'

/**
 * Tracks which session the running code belongs to. Event handlers, timers and
 * awaited continuations started inside a session keep its context, which is
 * what makes the global `App` and `ShowMessage()` session aware.
 */
const storage = new AsyncLocalStorage<Session>()

/**
 * The invisible host instance of the application. Code outside any client
 * session (root services, plugins, server timers) falls back to it.
 */
let host: Session | null = null

export function setHostSession(session: Session | null) {
  host = session
}

export function currentSession(): Session | null {
  return storage.getStore() ?? host
}

export function requireSession(): Session {
  const session = currentSession()
  if (!session) {
    throw new Error('No SubZero session is active. Start a server with SubZero.createServer() first.')
  }
  return session
}

export function runInSession<R>(session: Session, fn: () => R): R {
  return storage.run(session, fn)
}
