import { useCallback, useEffect, useRef, useState } from 'react'
import type { ClientMessage, DialogRequest, ServerMessage, ViewNode } from '../protocol'

export type ConnectionStatus = 'connecting' | 'open' | 'closed'

export interface SubZeroState {
  status: ConnectionStatus
  title: string
  forms: ViewNode[]
  dialogs: DialogRequest[]
  error: string | null
  closeReason: string | null
}

export interface SubZeroConnection extends SubZeroState {
  send(message: ClientMessage): void
  answer(dialog: DialogRequest, button: string): void
  dismissError(): void
}

/** Holds the WebSocket to a SubZero server and the latest state it sent */
export function useSubZero(url: string): SubZeroConnection {
  const socket = useRef<WebSocket | null>(null)
  const [state, setState] = useState<SubZeroState>({
    status: 'connecting',
    title: '',
    forms: [],
    dialogs: [],
    error: null,
    closeReason: null,
  })

  useEffect(() => {
    const ws = new WebSocket(url)
    socket.current = ws

    ws.onopen = () => setState(s => ({ ...s, status: 'open' }))
    ws.onclose = () => setState(s => ({ ...s, status: 'closed' }))
    ws.onmessage = event => {
      const message = JSON.parse(String(event.data)) as ServerMessage
      setState(s => reduce(s, message))
    }

    return () => {
      ws.onclose = null
      ws.close()
      socket.current = null
    }
  }, [url])

  useEffect(() => {
    if (state.title) document.title = state.title
  }, [state.title])

  const send = useCallback((message: ClientMessage) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message))
    }
  }, [])

  const answer = useCallback((dialog: DialogRequest, button: string) => {
    send({ t: 'dialogResult', id: dialog.id, button })
    setState(s => ({ ...s, dialogs: s.dialogs.filter(d => d.id !== dialog.id) }))
  }, [send])

  const dismissError = useCallback(() => setState(s => ({ ...s, error: null })), [])

  return { ...state, send, answer, dismissError }
}

function reduce(state: SubZeroState, message: ServerMessage): SubZeroState {
  switch (message.t) {
    case 'hello':
      return { ...state, title: message.title }
    case 'render':
      return { ...state, title: message.title, forms: message.forms }
    case 'dialog':
      return { ...state, dialogs: [...state.dialogs, message.dialog] }
    case 'error':
      return { ...state, error: message.message }
    case 'bye':
      return { ...state, forms: [], dialogs: [], closeReason: message.reason }
  }
}
