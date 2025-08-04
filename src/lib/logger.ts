import fs from 'fs'
import path from 'path'

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private logFile: string
  private logLevel: LogLevel

  constructor() {
    this.logFile = path.join(process.cwd(), 'logs', 'app.log')
    this.logLevel = LogLevel.DEBUG // Set to DEBUG for detailed logging
  }

  private formatMessage(level: string, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString()
    const dataStr = data ? ` | ${JSON.stringify(data, null, 2)}` : ''
    return `[${timestamp}] ${level}: ${message}${dataStr}\n`
  }

  private writeToFile(message: string) {
    try {
      // Ensure logs directory exists
      const logsDir = path.dirname(this.logFile)
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true })
      }

      fs.appendFileSync(this.logFile, message)
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  }

  private log(level: LogLevel, levelName: string, message: string, data?: unknown) {
    if (level >= this.logLevel) {
      const formattedMessage = this.formatMessage(levelName, message, data)
      console.log(formattedMessage.trim())
      this.writeToFile(formattedMessage)
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