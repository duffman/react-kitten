import { useEffect, useRef, useState } from 'react'
import {
  Manager, Spaces, Space, Window, TitleBar, Title, Buttons, CloseButton, StageButton, Content, useKittenId,
} from './kitten'
import type { DialogRequest, ViewNode } from '../protocol'
import { useSubZero } from './connection'
import { Children, type Send } from './controls'

const BOUNDS_DEBOUNCE_MS = 300

/**
 * Renders a SubZero application: every visible server form becomes a
 * react-kitten window, and server dialogs become small modal windows.
 */
export function SubZeroClient({ url }: { url: string }) {
  const connection = useSubZero(url)
  const [size, setSize] = useState<[number, number]>([window.innerWidth, window.innerHeight])
  const [space, setSpace] = useState(0)

  useEffect(() => {
    const resize = () => setSize([window.innerWidth, window.innerHeight])
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return <Manager size={size}>
    <Spaces space={space} onSpaceChange={setSpace}>
      <Space snap>
        {connection.forms.map(form => <FormWindow key={form.id} form={form} send={connection.send} />)}
        {connection.dialogs.map(dialog =>
          <DialogWindow key={dialog.id} dialog={dialog} onAnswer={button => connection.answer(dialog, button)} />)}
        <StatusBar
          status={connection.status}
          closeReason={connection.closeReason}
          error={connection.error}
          onDismiss={connection.dismissError}
        />
      </Space>
    </Spaces>
  </Manager>
}

function initialPosition(props: ViewNode['props'], width: number, height: number): [number, number] {
  if (props.position === 'screenCenter') {
    return [Math.max(0, (window.innerWidth - width) / 2), Math.max(0, (window.innerHeight - height) / 2)]
  }
  if (props.position === 'designed') {
    return [Number(props.left), Number(props.top)]
  }
  return [40 + Math.random() * 200, 40 + Math.random() * 120]
}

function FormWindow({ form, send }: { form: ViewNode, send: Send }) {
  const { props } = form
  const [kittenId] = useKittenId()
  const [size, setSize] = useState<[number, number]>([Number(props.width), Number(props.height)])
  const [position, setPosition] = useState<[number, number]>(() => initialPosition(props, size[0], size[1]))
  const [staged, setStaged] = useState(false)
  const report = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Server-side changes to the size win over the local state
  useEffect(() => setSize([Number(props.width), Number(props.height)]), [props.width, props.height])

  // Tell the server where the user left the window, once they stop dragging
  useEffect(() => {
    clearTimeout(report.current)
    report.current = setTimeout(() => send({
      t: 'event',
      id: form.id,
      name: 'bounds',
      data: { left: Math.round(position[0]), top: Math.round(position[1]), width: size[0], height: size[1] },
    }), BOUNDS_DEBOUNCE_MS)
    return () => clearTimeout(report.current)
  }, [form.id, position, size, send])

  return <Window
    kittenId={kittenId}
    size={size}
    position={position}
    staged={staged}
    alwaysOnTop={Boolean(props.modal)}
    onSizeChange={setSize}
    onPositionChange={setPosition}
    onStagedChange={setStaged}
  >
    <TitleBar onMove={setPosition}>
      <Buttons>
        <CloseButton onClick={() => send({ t: 'event', id: form.id, name: 'close' })} />
        <StageButton onClick={() => setStaged(true)} />
      </Buttons>
      <Title>{String(props.caption)}</Title>
    </TitleBar>
    <Content>
      <div style={{ position: 'relative', height: '100%', background: props.color ? String(props.color) : '#f7f8f9' }}>
        <Children nodes={form.children} send={send} />
      </div>
    </Content>
  </Window>
}

function DialogWindow({ dialog, onAnswer }: { dialog: DialogRequest, onAnswer: (button: string) => void }) {
  const [kittenId] = useKittenId()
  const size: [number, number] = [380, 170]
  const [position, setPosition] = useState<[number, number]>(
    [(window.innerWidth - size[0]) / 2, (window.innerHeight - size[1]) / 2])
  const icon = { information: 'ℹ️', warning: '⚠️', error: '⛔', confirmation: '❓', custom: '' }[dialog.kind]

  return <Window
    kittenId={kittenId}
    size={size}
    position={position}
    resizable={false}
    alwaysOnTop
    onSizeChange={() => {}}
    onPositionChange={setPosition}
    onStagedChange={() => {}}
  >
    <TitleBar onMove={setPosition}>
      <Buttons>
        <CloseButton onClick={() => onAnswer('cancel')} />
      </Buttons>
      <Title>{dialog.title}</Title>
    </TitleBar>
    <Content>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 16, boxSizing: 'border-box', font: '13px system-ui, sans-serif' }}>
        <div style={{ flex: 1, display: 'flex', gap: 12 }}>
          {icon ? <span style={{ fontSize: 24 }}>{icon}</span> : null}
          <span style={{ whiteSpace: 'pre-wrap' }}>{dialog.text}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {dialog.buttons.map(button =>
            <button key={button} onClick={() => onAnswer(button)} style={{ minWidth: 72, height: 28, textTransform: 'capitalize' }}>
              {button}
            </button>)}
        </div>
      </div>
    </Content>
  </Window>
}

function StatusBar({ status, closeReason, error, onDismiss }: {
  status: string
  closeReason: string | null
  error: string | null
  onDismiss: () => void
}) {
  const message = error
    ?? (status === 'connecting' ? 'Connecting…' : null)
    ?? (status === 'closed' ? `Disconnected${closeReason ? ` (${closeReason})` : ''}. Reload to start a new session.` : null)
  if (!message) return null

  return <div
    onClick={error ? onDismiss : undefined}
    style={{
      position: 'fixed', left: 16, bottom: 16, padding: '8px 12px', borderRadius: 6,
      background: error ? '#b3261e' : '#333', color: '#fff', font: '13px system-ui, sans-serif',
      cursor: error ? 'pointer' : 'default', zIndex: 1_000_000,
    }}
  >{message}</div>
}
