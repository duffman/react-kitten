import React, { useEffect, useRef, useState } from 'react'
import type { ClientMessage, PropValue, ViewNode } from '../protocol'

export type Send = (message: ClientMessage) => void

interface NodeProps {
  node: ViewNode
  send: Send
  style: React.CSSProperties
}

const FONT = '13px system-ui, -apple-system, "Segoe UI", sans-serif'

/**
 * Lays out children the way VCL `Align` does: top and bottom controls take
 * full-width strips in order, left and right take the remaining height, the
 * client control fills what is left, and unaligned controls are positioned
 * absolutely by `left` / `top`.
 */
export function Children({ nodes, send }: { nodes: ViewNode[], send: Send }) {
  const visible = nodes.filter(n => n.props.visible !== false)
  const aligned = (align: string) => visible.filter(n => (n.props.align ?? 'none') === align)
  const size = (n: ViewNode, key: 'width' | 'height') => Number(n.props[key]) || 0

  return <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
    {aligned('top').map(n =>
      <Node key={n.id} node={n} send={send} style={{ position: 'relative', flex: 'none', height: size(n, 'height') }} />)}
    <div style={{ position: 'relative', flex: 1, display: 'flex', minHeight: 0 }}>
      {aligned('left').map(n =>
        <Node key={n.id} node={n} send={send} style={{ position: 'relative', flex: 'none', width: size(n, 'width') }} />)}
      <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
        {aligned('client').map(n =>
          <Node key={n.id} node={n} send={send} style={{ position: 'absolute', inset: 0 }} />)}
        {aligned('none').map(n =>
          <Node key={n.id} node={n} send={send} style={{
            position: 'absolute',
            left: Number(n.props.left),
            top: Number(n.props.top),
            width: size(n, 'width'),
            height: size(n, 'height'),
          }} />)}
      </div>
      {/* The first right-aligned control is the outermost one */}
      {aligned('right').reverse().map(n =>
        <Node key={n.id} node={n} send={send} style={{ position: 'relative', flex: 'none', width: size(n, 'width') }} />)}
    </div>
    {aligned('bottom').reverse().map(n =>
      <Node key={n.id} node={n} send={send} style={{ position: 'relative', flex: 'none', height: size(n, 'height') }} />)}
  </div>
}

export function Node({ node, send, style }: NodeProps) {
  const { props } = node
  const font = (props.font ?? {}) as Record<string, PropValue>
  const box: React.CSSProperties = {
    boxSizing: 'border-box',
    font: FONT,
    fontFamily: typeof font.name === 'string' ? font.name : undefined,
    fontSize: typeof font.size === 'number' ? font.size : undefined,
    color: typeof font.color === 'string' ? font.color : undefined,
    fontWeight: font.bold ? 700 : undefined,
    fontStyle: font.italic ? 'italic' : undefined,
    textDecoration: font.underline ? 'underline' : undefined,
    background: props.color ? String(props.color) : undefined,
    opacity: props.enabled === false ? 0.55 : undefined,
    ...style,
  }
  const title = props.hint ? String(props.hint) : undefined
  const fire = (name: string, data?: Record<string, PropValue>) => send({ t: 'event', id: node.id, name, data })
  const listens = (name: string) => node.events.includes(name)
  const pointer = {
    onClick: listens('click') ? () => fire('click') : undefined,
    onDoubleClick: listens('dblclick') ? () => fire('dblclick') : undefined,
  }

  switch (node.kind) {
    case 'TLabel':
      return <div title={title} {...pointer} style={{
        ...box,
        textAlign: props.alignment as React.CSSProperties['textAlign'],
        whiteSpace: props.wordWrap ? 'normal' : 'nowrap',
        overflow: 'hidden',
      }}>{String(props.caption)}</div>

    case 'TButton':
      return <button title={title} disabled={props.enabled === false} onClick={() => fire('click')}
        style={{ ...box, cursor: 'pointer' }}>{String(props.caption)}</button>

    case 'TEdit':
      return <TextInput node={node} fire={fire} style={box} title={title} />

    case 'TMemo':
      return <TextInput node={node} fire={fire} style={box} title={title} multiline />

    case 'TCheckBox':
      return <label title={title} style={{ ...box, display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="checkbox" checked={Boolean(props.checked)} disabled={props.enabled === false}
          onChange={e => fire('change', { checked: e.target.checked })} />
        {String(props.caption)}
      </label>

    case 'TListBox': {
      const items = (props.items ?? []) as string[]
      return <div title={title} style={{ ...box, border: '1px solid #9aa0a6', background: box.background ?? '#fff', overflowY: 'auto' }}>
        {items.map((item, index) =>
          <div key={index}
            onClick={() => props.enabled !== false && fire('change', { itemIndex: index })}
            style={{
              padding: '2px 6px',
              cursor: 'default',
              background: index === props.itemIndex ? '#0a64d8' : undefined,
              color: index === props.itemIndex ? '#fff' : undefined,
            }}>{item}</div>)}
      </div>
    }

    case 'TPanel':
    case 'TGroupBox': {
      const group = node.kind === 'TGroupBox'
      const border = group
        ? '1px solid #b5b9be'
        : props.bevel === 'lowered' ? '1px inset #d0d3d6' : props.bevel === 'raised' ? '1px outset #eceef0' : 'none'
      return <div title={title} {...pointer} style={{ ...box, border, borderRadius: group ? 4 : 0, background: box.background ?? (group ? undefined : '#eef0f2') }}>
        {props.caption ? <div style={{
          position: 'absolute',
          ...(group ? { top: -9, left: 8, padding: '0 4px', background: '#f7f8f9' } : { inset: 0, display: 'grid', placeItems: 'center' }),
        }}>{String(props.caption)}</div> : null}
        <div style={{ position: 'absolute', inset: group ? '10px 4px 4px' : 0 }}>
          <Children nodes={node.children} send={send} />
        </div>
      </div>
    }

    default:
      return <div title={title} {...pointer} style={box}>
        <Children nodes={node.children} send={send} />
      </div>
  }
}

/**
 * Text controls keep local state so typing is never interrupted by a render
 * that still carries an older value. A server value replaces local text only
 * if it is not one the client itself sent, i.e. the server changed it.
 */
function TextInput({ node, fire, style, title, multiline = false }: {
  node: ViewNode
  fire: (name: string, data?: Record<string, PropValue>) => void
  style: React.CSSProperties
  title?: string
  multiline?: boolean
}) {
  const { props } = node
  const server = multiline ? ((props.lines ?? []) as string[]).join('\n') : String(props.text ?? '')
  const [value, setValue] = useState(server)
  const sent = useRef<string[]>([])

  useEffect(() => {
    const index = sent.current.indexOf(server)
    if (index === -1) {
      sent.current = []
      setValue(server)
    } else {
      sent.current = sent.current.slice(index + 1)
    }
  }, [server])

  const change = (text: string) => {
    setValue(text)
    sent.current.push(text)
    fire('change', { text })
  }

  const common = {
    title,
    value,
    readOnly: Boolean(props.readOnly),
    disabled: props.enabled === false,
    style: { ...style, border: '1px solid #9aa0a6', padding: '3px 6px', background: style.background ?? '#fff', resize: 'none' as const },
  }

  return multiline
    ? <textarea {...common} wrap={props.wordWrap === false ? 'off' : 'soft'} onChange={e => change(e.target.value)} />
    : <input {...common}
      type={props.passwordChar ? 'password' : 'text'}
      placeholder={props.textHint ? String(props.textHint) : undefined}
      maxLength={Number(props.maxLength) > 0 ? Number(props.maxLength) : undefined}
      onChange={e => change(e.target.value)} />
}
