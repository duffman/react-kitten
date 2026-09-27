import { Injectable, InjectionToken, Module, inject, type ModuleWithProviders, type OnModuleInit } from '../../src'

export interface GreetingConfig {
  greeting: string
}

export const GREETING_CONFIG = new InjectionToken<GreetingConfig>('GREETING_CONFIG')

/** Root scoped: one instance shared by every session */
@Injectable()
export class GreetingService {
  readonly #config = inject(GREETING_CONFIG)
  #greeted = 0

  greet(name: string): string {
    this.#greeted++
    return `${this.#config.greeting}, ${name}!`
  }

  get totalGreetings(): number {
    return this.#greeted
  }
}

/** Session scoped: every connected client gets its own history */
@Injectable({ scope: 'session' })
export class GreetingHistory {
  readonly names: string[] = []
}

@Module({
  providers: [GreetingService, GreetingHistory],
})
export class GreetingModule implements OnModuleInit {
  static forRoot(config: GreetingConfig): ModuleWithProviders {
    return {
      module: GreetingModule,
      providers: [{ provide: GREETING_CONFIG, useValue: config }],
    }
  }

  onModuleInit() {
    console.log('[example] GreetingModule ready')
  }
}
