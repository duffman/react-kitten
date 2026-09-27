/**
 * Wire protocol between a SubZero server and its browser client. Everything
 * here is plain JSON so any transport can carry it.
 */

export type PropValue = string | number | boolean | null | string[] | { [key: string]: PropValue }

export interface ViewNode {
  id: string
  /** VCL class the client renders, e.g. `TButton`. User subclasses report their built-in base. */
  kind: string
  props: Record<string, PropValue>
  /** Client events the server has handlers for, e.g. `click` */
  events: string[]
  children: ViewNode[]
}

export interface DialogRequest {
  id: string
  kind: 'information' | 'warning' | 'error' | 'confirmation' | 'custom'
  title: string
  text: string
  buttons: string[]
}

export type ServerMessage =
  | { t: 'hello', sessionId: string, title: string }
  | { t: 'render', title: string, forms: ViewNode[] }
  | { t: 'dialog', dialog: DialogRequest }
  | { t: 'error', message: string }
  | { t: 'bye', reason: string }

export type ClientMessage =
  | { t: 'event', id: string, name: string, data?: Record<string, PropValue> }
  | { t: 'dialogResult', id: string, button: string }
