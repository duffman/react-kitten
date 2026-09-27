import { TComponent, published } from './component'
import { TForm } from './form'
import { requireSession } from '../server/context'

/**
 * Delphi's `Application` object. There is one per session: every connected
 * client gets its own, plus the invisible host instance.
 */
export class TApplication extends TComponent {
  @published accessor title = ''

  #mainForm: TForm | null = null
  #forms: TForm[] = []
  #terminated = false

  get mainForm(): TForm | null {
    return this.#mainForm
  }

  set mainForm(form: TForm | null) {
    this.#mainForm = form
    if (form && !this.#forms.includes(form)) {
      this.#forms.push(form)
    }
  }

  get forms(): readonly TForm[] {
    return this.#forms.filter(form => !form.destroyed)
  }

  get terminated(): boolean {
    return this.#terminated
  }

  /**
   * Creates a form owned by the application. Field initializers of the form
   * may use `inject()`. The first form created becomes the main form.
   */
  createForm<T extends TForm>(formClass: new (owner: TComponent | null) => T): T {
    const session = requireSession()
    const form = session.injector.construct(formClass, this)
    this.#forms.push(form)
    this.#mainForm ??= form
    form.doCreate()
    return form
  }

  /** Called by forms when they close. Closing the main form terminates the application. */
  formClosed(form: TForm): void {
    if (form === this.#mainForm) {
      this.terminate()
    }
  }

  terminate(): void {
    if (this.#terminated) return
    this.#terminated = true
    void this.session?.close('terminated')
  }

  override destroy(): void {
    for (const form of this.#forms) {
      form.destroy()
    }
    this.#forms = []
    this.#mainForm = null
    super.destroy()
  }
}

/**
 * The current session's `TApplication`, like Delphi's global `Application`.
 * Resolves to the connected client's instance inside event handlers and
 * `onCreate`, and to the invisible host instance everywhere else.
 */
export const App: TApplication = new Proxy({} as TApplication, {
  get(_, key) {
    const app = requireSession().application
    const value = Reflect.get(app, key, app)
    return typeof value === 'function' ? value.bind(app) : value
  },
  set(_, key, value) {
    const app = requireSession().application
    return Reflect.set(app, key, value, app)
  },
})
