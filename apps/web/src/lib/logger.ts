export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private logLevel: LogLevel

  constructor() {
    this.logLevel = LogLevel.DEBUG // Set to DEBUG for detailed logging
  }

  private formatMessage(level: string, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString()
    const dataStr = data ? ` | ${JSON.stringify(data, null, 2)}` : ''
    return `[${timestamp}] ${level}: ${message}${dataStr}`
  }

  private log(level: LogLevel, levelName: string, message: string, data?: unknown) {
    if (level >= this.logLevel) {
      const formattedMessage = this.formatMessage(levelName, message, data)

      // Use appropriate console method based on level
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage)
          break
        case LogLevel.INFO:
          console.info(formattedMessage)
          break
        case LogLevel.WARN:
          console.warn(formattedMessage)
          break
        case LogLevel.ERROR:
          console.error(formattedMessage)
          break
        default:
          console.log(formattedMessage)
      }
    }
  }

  debug(message: string, data?: unknown) {
    this.log(LogLevel.DEBUG, 'DEBUG', message, data)
  }

  info(message: string, data?: unknown) {
    this.log(LogLevel.INFO, 'INFO', message, data)
  }

  warn(message: string, data?: unknown) {
    this.log(LogLevel.WARN, 'WARN', message, data)
  }

  error(message: string, data?: unknown) {
    this.log(LogLevel.ERROR, 'ERROR', message, data)
  }
}

export const logger = new Logger()