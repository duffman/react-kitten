import type { Server, ServerWebSocket } from 'bun'
import type { ConnectionHandler, Transport, TransportHost } from './transport'
import { buildClient, type ClientBundle } from './client-bundle'

export interface TransportOptions {
  port?: number
  hostname?: string
  /** WebSocket endpoint path */
  path?: string
  /**
   * Serves the bundled React / react-kitten client at `/`, so a browser can
   * open the application without a separate frontend build.
   */
  client?: boolean
  /** Allowed `Origin` headers for WebSocket upgrades. Defaults to same-origin only. */
  origins?: string[]
  /** Largest accepted client message in bytes */
  maxPayloadLength?: number
}

interface SocketData {
  params: Record<string, string>
  handler: ConnectionHandler | null
}

export interface WebSocketTransport extends Transport {
  readonly url: string
  readonly port: number
}

/**
 * HTTP + WebSocket transport on `Bun.serve`. Each WebSocket connection is a
 * session; plugin routes and the optional client are served over HTTP.
 */
export function transport(options: TransportOptions = {}): WebSocketTransport {
  const path = options.path ?? '/subzero'
  let server: Server<SocketData> | null = null
  let bundle: ClientBundle | null = null

  const allowedOrigin = (request: Request, url: URL) => {
    const origin = request.headers.get('origin')
    if (!origin) return true
    return options.origins ? options.origins.includes(origin) : origin === url.origin
  }

  return {
    name: 'websocket',

    get url() {
      if (!server) throw new Error('transport is not listening')
      return `ws://${server.hostname}:${server.port}${path}`
    },

    get port() {
      if (!server) throw new Error('transport is not listening')
      return server.port ?? 0
    },

    async listen(host: TransportHost) {
      if (options.client) {
        bundle = await buildClient()
      }

      server = Bun.serve<SocketData>({
        port: options.port ?? 3000,
        hostname: options.hostname,

        async fetch(request, srv) {
          const url = new URL(request.url)

          if (url.pathname === path) {
            if (!allowedOrigin(request, url)) {
              return new Response('Origin not allowed', { status: 403 })
            }
            const params = Object.fromEntries(url.searchParams)
            if (srv.upgrade(request, { data: { params, handler: null } })) return undefined
            return new Response('Expected a WebSocket upgrade', { status: 426 })
          }

          const route = host.routes.get(url.pathname)
          if (route) return route(request)

          if (bundle) {
            if (url.pathname === '/') {
              return new Response(bundle.html(path), { headers: { 'content-type': 'text/html; charset=utf-8' } })
            }
            const asset = bundle.assets.get(url.pathname)
            if (asset) return new Response(asset.body, { headers: { 'content-type': asset.type } })
          }

          return new Response('Not found', { status: 404 })
        },

        websocket: {
          maxPayloadLength: options.maxPayloadLength ?? 64 * 1024,
          open(ws: ServerWebSocket<SocketData>) {
            ws.data.handler = host.connect({
              params: ws.data.params,
              send: data => { ws.send(data) },
              close: () => ws.close(),
            })
          },
          message(ws, message) {
            ws.data.handler?.message(typeof message === 'string' ? message : new TextDecoder().decode(message))
          },
          close(ws) {
            ws.data.handler?.closed()
            ws.data.handler = null
          },
        },
      })
    },

    async close() {
      await server?.stop(true)
      server = null
    },
  }
}

/** Alias of `transport()` */
export const websocket = transport
