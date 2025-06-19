/* eslint-disable no-console */
import { debug, error, info, warn } from '@tauri-apps/plugin-log'

class Logger {
  private static instance: Logger
  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  async log(...args: any[]) {
    const message = this.formatMessage(args)
    console.log(message)
    await info(message)
  }

  async debug(...args: any[]) {
    const message = this.formatMessage(args)
    console.debug(message)
    await debug(message)
  }

  async warn(...args: any[]) {
    const message = this.formatMessage(args)
    console.warn(message)
    await warn(message)
  }

  async error(...args: any[]) {
    const message = this.formatMessage(args)
    console.error(message)
    await error(message)
  }

  private formatMessage(args: any[]): string {
    const timestamp = new Date().toISOString()
    const message = args.map(arg =>
      typeof arg === 'string' ? arg : JSON.stringify(arg),
    ).join(' ')

    return `[${timestamp}] ${message}`
  }
}

const logger = Logger.getInstance()

export { logger }
