import { TControl } from './control'
import { event, published, type TNotifyEvent } from './component'
import { TForm } from './form'
import { TModalResult } from './types'
import type { PropValue } from '../protocol'

export class TLabel extends TControl {
  static override readonly kind: string = 'TLabel'

  @published accessor caption = ''
  @published accessor alignment: 'left' | 'center' | 'right' = 'left'
  @published accessor wordWrap = false
}

export class TButton extends TControl {
  static override readonly kind: string = 'TButton'

  @published accessor caption = 'Button'
  @published override accessor width = 90
  @published override accessor height = 30
  /** Clicking assigns this to the parent form's `modalResult`, closing it */
  modalResult: TModalResult = TModalResult.None

  override dispatch(name: string, data: Record<string, PropValue> | undefined): boolean {
    if (name !== 'click' || !this.enabled) {
      return super.dispatch(name, data)
    }
    this.fire(this.onClick)
    if (this.modalResult !== TModalResult.None) {
      const form = findForm(this)
      if (form) form.modalResult = this.modalResult
    }
    return true
  }
}

export class TEdit extends TControl {
  static override readonly kind: string = 'TEdit'

  override acceptsEvent(name: string): boolean {
    return super.acceptsEvent(name) && !(name === 'change' && this.readOnly)
  }

  @published accessor text = ''
  @published accessor textHint = ''
  @published accessor readOnly = false
  @published accessor passwordChar = ''
  @published accessor maxLength = 0
  @published override accessor width = 160

  @event onChange: TNotifyEvent | null = null

  override dispatch(name: string, data: Record<string, PropValue> | undefined): boolean {
    if (name !== 'change') return super.dispatch(name, data)
    this.silently(() => { this.text = String(data?.text ?? '') })
    this.fire(this.onChange)
    return true
  }
}

export class TMemo extends TControl {
  static override readonly kind: string = 'TMemo'

  override acceptsEvent(name: string): boolean {
    return super.acceptsEvent(name) && !(name === 'change' && this.readOnly)
  }

  @published accessor lines: string[] = []
  @published accessor readOnly = false
  @published accessor wordWrap = true
  @published override accessor width = 240
  @published override accessor height = 120

  @event onChange: TNotifyEvent | null = null

  get text(): string {
    return this.lines.join('\n')
  }

  set text(value: string) {
    this.lines = value.split('\n')
  }

  /** Appends a line. `lines` is replaced rather than mutated so the change renders. */
  add(line: string): void {
    this.lines = [...this.lines, line]
  }

  clear(): void {
    this.lines = []
  }

  override dispatch(name: string, data: Record<string, PropValue> | undefined): boolean {
    if (name !== 'change') return super.dispatch(name, data)
    this.silently(() => { this.text = String(data?.text ?? '') })
    this.fire(this.onChange)
    return true
  }
}

export class TCheckBox extends TControl {
  static override readonly kind: string = 'TCheckBox'

  @published accessor caption = ''
  @published accessor checked = false
  @published override accessor width = 160

  override dispatch(name: string, data: Record<string, PropValue> | undefined): boolean {
    if (name !== 'change') return super.dispatch(name, data)
    this.silently(() => { this.checked = Boolean(data?.checked) })
    this.fire(this.onClick)
    return true
  }
}

export class TListBox extends TControl {
  static override readonly kind: string = 'TListBox'

  @published accessor items: string[] = []
  @published accessor itemIndex = -1
  @published override accessor width = 200
  @published override accessor height = 120

  get selected(): string | null {
    return this.items[this.itemIndex] ?? null
  }

  override dispatch(name: string, data: Record<string, PropValue> | undefined): boolean {
    if (name !== 'change') return super.dispatch(name, data)
    this.silently(() => { this.itemIndex = Number(data?.itemIndex ?? -1) })
    this.fire(this.onClick)
    return true
  }
}

export class TPanel extends TControl {
  static override readonly kind: string = 'TPanel'

  @published accessor caption = ''
  @published accessor bevel: 'none' | 'raised' | 'lowered' = 'raised'
  @published override accessor width = 200
  @published override accessor height = 120
}

export class TGroupBox extends TControl {
  static override readonly kind: string = 'TGroupBox'

  @published accessor caption = ''
  @published override accessor width = 200
  @published override accessor height = 120
}

function findForm(control: TControl): TForm | null {
  let current: TControl | null = control
  while (current && !(current instanceof TForm)) {
    current = current.parent
  }
  return current
}
