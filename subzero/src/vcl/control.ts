import { META, readMetadata } from '../core/metadata'
import { TComponent, event, eventName, published, type TNotifyEvent } from './component'
import { TAlign, type TColor, type TFont } from './types'
import type { PropValue, ViewNode } from '../protocol'

type Assignable<T> = Partial<{ [K in keyof T as T[K] extends (...args: never[]) => unknown ? never : K]: T[K] }>
  & Partial<{ [K in keyof T as K extends `on${string}` ? K : never]: T[K] }>

/**
 * Base class of visual controls. Controls sit inside a parent control and are
 * rendered by the client as the VCL class named in `kind`.
 */
export class TControl extends TComponent {
  static readonly kind: string = 'TControl'

  @published accessor left = 0
  @published accessor top = 0
  @published accessor width = 100
  @published accessor height = 25
  @published accessor align: TAlign = TAlign.None
  @published accessor visible = true
  @published accessor enabled = true
  @published accessor color: TColor = ''
  @published accessor hint = ''
  @published accessor font: TFont = {}

  @event onClick: TNotifyEvent | null = null
  @event onDblClick: TNotifyEvent | null = null

  #parent: TControl | null = null
  #controls: TControl[] = []

  /**
   * Delphi style constructor with an initial property set:
   *
   * ```ts
   * TButton.create(this, { parent: panel, caption: 'OK', onClick: () => this.close() })
   * ```
   */
  static create<T extends TControl>(
    this: new (owner: TComponent | null) => T,
    owner: TComponent | null,
    props: Assignable<T> & { parent?: TControl | null } = {},
  ): T {
    const control = new this(owner)
    Object.assign(control, props)
    return control
  }

  get parent(): TControl | null {
    return this.#parent
  }

  set parent(value: TControl | null) {
    if (this.#parent === value) return
    if (this.#parent) {
      this.#parent.#controls = this.#parent.#controls.filter(c => c !== this)
      this.#parent.invalidate()
    }
    this.#parent = value
    if (value) {
      value.#controls.push(this)
      value.invalidate()
    }
  }

  get controls(): readonly TControl[] {
    return this.#controls
  }

  insertControl(control: TControl): void {
    control.parent = this
  }

  removeControl(control: TControl): void {
    if (control.parent === this) {
      control.parent = null
    }
  }

  setBounds(left: number, top: number, width: number, height: number): void {
    this.left = left
    this.top = top
    this.width = width
    this.height = height
  }

  show(): void {
    this.visible = true
  }

  hide(): void {
    this.visible = false
  }

  bringToFront(): void {
    const parent = this.#parent
    if (!parent) return
    parent.#controls = [...parent.#controls.filter(c => c !== this), this]
    parent.invalidate()
  }

  sendToBack(): void {
    const parent = this.#parent
    if (!parent) return
    parent.#controls = [this, ...parent.#controls.filter(c => c !== this)]
    parent.invalidate()
  }

  /**
   * Whether the client may raise `name` on this control. Clients are not
   * trusted: disabled or hidden controls, or controls inside them, ignore input.
   */
  acceptsEvent(_name: string): boolean {
    for (let control: TControl | null = this; control; control = control.parent) {
      if (!control.enabled || !control.visible || control.destroyed) return false
    }
    return true
  }

  toView(): ViewNode {
    const self = this as unknown as Record<string | symbol, PropValue>
    const props: Record<string, PropValue> = { name: this.name }
    for (const key of readMetadata<(string | symbol)[]>(this.constructor, META.published) ?? []) {
      if (typeof key === 'string') {
        props[key] = self[key]
      }
    }

    const events = (readMetadata<string[]>(this.constructor, META.events) ?? [])
      .filter(field => typeof self[field] === 'function')
      .map(eventName)

    return {
      id: this.id,
      kind: (this.constructor as typeof TControl).kind,
      props,
      events,
      children: this.#controls.filter(c => !c.destroyed).map(c => c.toView()),
    }
  }

  override destroy(): void {
    this.parent = null
    super.destroy()
  }
}
