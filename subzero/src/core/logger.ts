import { Injectable } from '../di/injector'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

const ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 }

@Injectable()
export class Logger {
  level: LogLevel = (process.env.SUBZERO_LOG_LEVEL as LogLevel | undefined) ?? 'info'

  debug(...args: unknown[]) { this.write('debug', args) }
  info(...args: unknown[]) { this.write('info', args) }
  warn(...args: unknown[]) { this.write('warn', args) }
  error(...args: unknown[]) { this.write('error', args) }

  private write(level: Exclude<LogLevel, 'silent'>, args: unknown[]) {
    if (ORDER[level] < ORDER[this.level]) return
    console[level](`[subzero] ${level.toUpperCase().padEnd(5)}`, ...args)
  }
}
