import type { RouteHandler } from '../core/plugin'
import type { Logger } from '../core/logger'

/** One client connection, as seen by the server */
export interface Connection {
  /** Query parameters the client connected with, handed to `onCreate` */
  readonly params: Record<string, string>
  send(data: string): void
  close(): void
}

/** What a transport calls back into for a connection */
export interface ConnectionHandler {
  message(data: string): void
  closed(): void
}

/** The server as seen by a transport */
export interface TransportHost {
  readonly logger: Logger
  readonly routes: ReadonlyMap<string, RouteHandler>
  connect(connection: Connection): ConnectionHandler
}

export interface Transport {
  readonly name: string
  listen(host: TransportHost): void | Promise<void>
  close(): void | Promise<void>
}
