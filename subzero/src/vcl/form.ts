import { TControl } from './control'
import { published, type TNotifyEvent, type TObject } from './component'
import { TCloseAction, TModalResult, TPosition } from './types'
import type { PropValue } from '../protocol'

export type TCloseEvent = (sender: TObject, action: { value: TCloseAction }) => void
export type TCloseQueryEvent = (sender: TObject, canClose: { value: boolean }) => void | Promise<void>

/**
 * A window. Forms are created with `App.createForm(MyForm)`, rendered by the
 * client as react-kitten windows, and hidden until `show()` is called (the
 * main form is shown automatically once `onCreate` finishes).
 */
export class TForm extends TControl {
  static override readonly kind: string = 'TForm'

  @published accessor caption = ''
  @published accessor position: TPosition = TPosition.Default
  @published accessor modal = false
  @published override accessor visible = false
  @published override accessor width = 480
  @published override accessor height = 360

  // Lifecycle events are raised by the server, never directly by the client,
  // so they are plain fields rather than `@event`s.
  onCreate: TNotifyEvent | null = null
  onShow: TNotifyEvent | null = null
  onHide: TNotifyEvent | null = null
  onClose: TCloseEvent | null = null
  onCloseQuery: TCloseQueryEvent | null = null

  #modalResult: TModalResult = TModalResult.None
  #modalWaiters: ((result: TModalResult) => void)[] = []

  /** Setting a modal result closes the form, like in Delphi */
  get modalResult(): TModalResult {
    return this.#modalResult
  }

  set modalResult(value: TModalResult) {
    this.#modalResult = value
    if (value !== TModalResult.None) {
      this.session?.track(this.close())
    }
  }

  /** Called by `TApplication.createForm` once the constructor has finished */
  doCreate(): void {
    this.fire(this.onCreate)
  }

  override show(): void {
    if (this.visible) return
    this.visible = true
    this.fire(this.onShow)
  }

  override hide(): void {
    if (!this.visible) return
    this.visible = false
    this.modal = false
    this.fire(this.onHide)
  }

  /** Shows the form above the others and resolves when it closes */
  showModal(): Promise<TModalResult> {
    this.#modalResult = TModalResult.None
    this.modal = true
    this.show()
    return new Promise(resolve => this.#modalWaiters.push(resolve))
  }

  async close(): Promise<void> {
    const canClose = { value: true }
    await this.onCloseQuery?.(this, canClose)
    if (!canClose.value) return

    const action = { value: TCloseAction.Hide }
    this.onClose?.(this, action)
    if (action.value === TCloseAction.None) return

    this.hide()
    const result = this.#modalResult === TModalResult.None ? TModalResult.Cancel : this.#modalResult
    for (const resolve of this.#modalWaiters.splice(0)) {
      resolve(result)
    }

    if (action.value === TCloseAction.Free) {
      this.destroy()
    }
    this.session?.application.formClosed(this)
  }

  centerScreen(): void {
    this.position = TPosition.ScreenCenter
  }

  override dispatch(name: string, data: Record<string, PropValue> | undefined): boolean {
    switch (name) {
      case 'close':
        this.session?.track(this.close())
        return true
      case 'bounds':
        // The client already moved the window; record it without echoing a render
        this.silently(() => {
          if (typeof data?.left === 'number') this.left = data.left
          if (typeof data?.top === 'number') this.top = data.top
          if (typeof data?.width === 'number') this.width = data.width
          if (typeof data?.height === 'number') this.height = data.height
        })
        return true
      default:
        return super.dispatch(name, data)
    }
  }

  override destroy(): void {
    for (const resolve of this.#modalWaiters.splice(0)) {
      resolve(TModalResult.Cancel)
    }
    super.destroy()
  }
}
