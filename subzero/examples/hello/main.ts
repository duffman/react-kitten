import {
  App, Application, SubZero, healthCheck, rateLimit, sessionLogger, transport,
  type ApplicationHooks, type TObject, type TRunArgs,
} from '../../src'
import { GreetingModule } from './greeting.module'
import { MainForm } from './forms'

@Application({
  title: 'SubZero Demo',
  imports: [GreetingModule.forRoot({ greeting: 'Hello' })],
  plugins: [healthCheck(), sessionLogger(), rateLimit({ perSecond: 30 })],
})
class MyApp implements ApplicationHooks {
  #mainWindow!: MainForm

  onCreate(runArgs: TRunArgs) {
    // The invisible host instance has no screen; use it for server-wide work
    if (runArgs.headless) return

    this.#mainWindow = App.createForm(MainForm)
    App.mainForm = this.#mainWindow
    if (runArgs.params.name) {
      this.#mainWindow.nameEdit.text = runArgs.params.name
    }
  }

  onDestroy(_sender: TObject) {
    // Per-session cleanup goes here
  }
}

const port = Number(process.env.PORT ?? 3000)
await SubZero.createServer(MyApp, transport({ port, client: true }))
console.log(`Open http://localhost:${port}/?name=Delphi`)
