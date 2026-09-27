import {
  App, MessageDlg, ShowMessage, inject,
  TAlign, TButton, TEdit, TForm, TLabel, TMemo, TModalResult, TMsgDlgType, TPanel, TPosition,
} from '../../src'
import { GreetingHistory, GreetingService } from './greeting.module'

export class MainForm extends TForm {
  readonly #greeter = inject(GreetingService)
  readonly #history = inject(GreetingHistory)

  readonly toolbar = TPanel.create(this, { parent: this, align: TAlign.Top, height: 44, bevel: 'none' })
  readonly nameEdit = TEdit.create(this, {
    parent: this.toolbar, name: 'nameEdit', left: 8, top: 8, width: 200, height: 28, textHint: 'Your name',
  })
  readonly greetButton = TButton.create(this, {
    parent: this.toolbar, name: 'greetButton', caption: 'Greet', left: 216, top: 7,
  })
  readonly aboutButton = TButton.create(this, {
    parent: this.toolbar, name: 'aboutButton', caption: 'About…', left: 314, top: 7,
  })
  readonly clearButton = TButton.create(this, {
    parent: this.toolbar, name: 'clearButton', caption: 'Clear log', left: 412, top: 7,
  })
  readonly status = TLabel.create(this, {
    parent: this, name: 'status', align: TAlign.Bottom, height: 24, caption: 'Ready',
  })
  readonly log = TMemo.create(this, { parent: this, name: 'log', align: TAlign.Client, readOnly: true })

  constructor(owner: ConstructorParameters<typeof TForm>[0]) {
    super(owner)
    this.caption = 'SubZero demo'
    this.width = 520
    this.height = 380
    this.position = TPosition.ScreenCenter

    this.greetButton.onClick = () => this.greet()
    this.aboutButton.onClick = async () => {
      const result = await App.createForm(AboutForm).showModal()
      this.log.add(`About closed with ${result}`)
    }
    this.clearButton.onClick = async () => {
      const answer = await MessageDlg('Clear the log?', TMsgDlgType.Confirmation, [TModalResult.Yes, TModalResult.No])
      if (answer === TModalResult.Yes) this.log.clear()
    }
    this.onCloseQuery = async (_sender, canClose) => {
      canClose.value = await MessageDlg('Quit the application?', TMsgDlgType.Confirmation,
        [TModalResult.Yes, TModalResult.No]) === TModalResult.Yes
    }
  }

  private async greet() {
    const name = this.nameEdit.text.trim()
    if (!name) {
      await ShowMessage('Please enter your name first.')
      return
    }
    this.#history.names.push(name)
    this.log.add(this.#greeter.greet(name))
    this.status.caption = `You greeted ${this.#history.names.length} time(s); all sessions: ${this.#greeter.totalGreetings}`
    this.nameEdit.text = ''
  }
}

export class AboutForm extends TForm {
  constructor(owner: ConstructorParameters<typeof TForm>[0]) {
    super(owner)
    this.caption = 'About'
    this.width = 320
    this.height = 170
    this.position = TPosition.ScreenCenter

    TLabel.create(this, {
      parent: this, left: 16, top: 16, width: 288, height: 60, wordWrap: true,
      caption: 'This window is a TForm running on a Bun server, drawn by React<Kitten> in your browser.',
    })
    TButton.create(this, { parent: this, caption: 'OK', left: 214, top: 90, modalResult: TModalResult.Ok })
  }
}
