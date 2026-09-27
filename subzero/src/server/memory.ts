import type { ClientMessage, PropValue, ServerMessage, ViewNode } from '../protocol'
import type { ConnectionHandler, Transport, TransportHost } from './transport'

/**
 * A client connected through `memoryTransport`. Records every server message
 * and offers helpers to act like a user.
 */
export class MemoryClient {
  closed = false

  constructor(private readonly handler: ConnectionHandler, readonly messages: ServerMessage[]) {}

  send(message: ClientMessage): void {
    this.handler.message(JSON.stringify(message))
  }

  /** Raises a client event on a control, found by id or by its `name` */
  fire(target: string, name: string, data?: Record<string, PropValue>): void {
    this.send({ t: 'event', id: this.find(target)?.id ?? target, name, data })
  }

  click(target: string): void {
    this.fire(target, 'click')
  }

  answer(button: string): void {
    const dialog = this.last('dialog')
    if (!dialog) throw new Error('No dialog is open')
    this.send({ t: 'dialogResult', id: dialog.dialog.id, button })
  }

  last<T extends ServerMessage['t']>(type: T): Extract<ServerMessage, { t: T }> | undefined {
    return this.messages.findLast(m => m.t === type) as Extract<ServerMessage, { t: T }> | undefined
  }

  /** Forms of the most recent render */
  get forms(): ViewNode[] {
    return this.last('render')?.forms ?? []
  }

  /** Finds a node in the latest render by id, or by the control's `name` prop */
  find(target: string): ViewNode | undefined {
    const search = (nodes: ViewNode[]): ViewNode | undefined => {
      for (const node of nodes) {
        if (node.id === target || node.props.name === target) return node
        const found = search(node.children)
        if (found) return found
      }
    }
    return search(this.forms)
  }

  /** Waits for queued messages, renders and async handlers to settle */
  async settle(): Promise<void> {
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }

  disconnect(): void {
    this.handler.closed()
  }
}

export interface MemoryTransport extends Transport {
  connect(params?: Record<string, string>): Promise<MemoryClient>
}

/** In-process transport for tests and server-side rendering experiments */
export function memoryTransport(): MemoryTransport {
  let host: TransportHost | null = null
  const clients = new Set<MemoryClient>()

  return {
    name: 'memory',
    listen(transportHost) {
      host = transportHost
    },
    close() {
      for (const client of clients) client.disconnect()
      clients.clear()
      host = null
    },
    async connect(params = {}) {
      if (!host) throw new Error('memoryTransport is not listening; pass it to SubZero.createServer first')
      // The session starts sending while connect() is still running
      const messages: ServerMessage[] = []
      let client: MemoryClient | null = null
      let closed = false
      const handler = host.connect({
        params,
        send: data => { messages.push(JSON.parse(data) as ServerMessage) },
        close: () => {
          closed = true
          if (client) {
            client.closed = true
            clients.delete(client)
          }
        },
      })
      client = new MemoryClient(handler, messages)
      client.closed = closed
      clients.add(client)
      await client.settle()
      return client
    },
  }
}
