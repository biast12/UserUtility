/**
 * Advanced logging system with colored console output and structured logging
 * Based on the design from ClearTimerBot with TypeScript implementation
 */

import { LogLevel, LogArea, LoggerConfig } from '../types/logger';

export class BotLogger {
  private static instance: BotLogger;
  private initialized = false;
  private consoleEnabled = true;
  private minLevel = LogLevel.INFO;

  private constructor() {
    if (!this.initialized) {
      this.initialized = true;
    }
  }

  public static getInstance(): BotLogger {
    if (!BotLogger.instance) {
      BotLogger.instance = new BotLogger();
    }
    return BotLogger.instance;
  }

  private getColor(level: LogLevel): string {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[90m',     // Gray
      [LogLevel.INFO]: '\x1b[92m',      // Green
      [LogLevel.WARNING]: '\x1b[93m',   // Yellow
      [LogLevel.ERROR]: '\x1b[91m',     // Red
      [LogLevel.CRITICAL]: '\x1b[95m',  // Magenta
      [LogLevel.NONE]: '\x1b[37m'       // White/default
    };
    return colors[level] || '';
  }

  private resetColor(): string {
    return '\x1b[0m';
  }

  private shouldLog(level: LogLevel): boolean {
    if (level === LogLevel.NONE) {
      return true;
    }

    const levelOrder = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARNING,
      LogLevel.ERROR,
      LogLevel.CRITICAL
    ];

    return levelOrder.indexOf(level) >= levelOrder.indexOf(this.minLevel);
  }

  private formatMessage(level: LogLevel, area: LogArea, message: string): string {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      timeZone: 'UTC'
    });
    const color = this.getColor(level);
    const reset = this.resetColor();

    if (level === LogLevel.NONE && area === LogArea.NONE) {
      return `${color}[${timestamp}] ${message}${reset}`;
    } else if (level === LogLevel.NONE) {
      return `${color}[${timestamp}] [${area.padEnd(10)}] ${message}${reset}`;
    } else if (area === LogArea.NONE) {
      return `${color}[${timestamp}] [${level.padEnd(8)}] ${message}${reset}`;
    } else {
      return `${color}[${timestamp}] [${level.padEnd(8)}] [${area.padEnd(10)}] ${message}${reset}`;
    }
  }


  public configure(config: Partial<LoggerConfig>): void {
    if (config.consoleEnabled !== undefined) {
      this.consoleEnabled = config.consoleEnabled;
    }
    if (config.minLevel !== undefined) {
      this.minLevel = config.minLevel;
    }
  }

  public log(level: LogLevel, area: LogArea, message: string): void {
    if (!this.shouldLog(level)) {
      return;
    }

    if (this.consoleEnabled) {
      const formatted = this.formatMessage(level, area, message);
      try {
        console.log(formatted);
      } catch (error) {
        // Fallback for encoding issues
        const safeFormatted = formatted.replace(/[\u0000-\u001F\u007F-\u009F]/g, '?');
        console.log(safeFormatted);
      }
    }
  }


  // Convenience methods for different log levels
  public debug(area: LogArea, message: string): void {
    this.log(LogLevel.DEBUG, area, message);
  }

  public info(area: LogArea, message: string): void {
    this.log(LogLevel.INFO, area, message);
  }

  public warning(area: LogArea, message: string): void {
    this.log(LogLevel.WARNING, area, message);
  }

  public error(area: LogArea, message: string): void {
    this.log(LogLevel.ERROR, area, message);
  }

  public critical(area: LogArea, message: string): void {
    this.log(LogLevel.CRITICAL, area, message);
  }

  public print(message: string): void {
    this.log(LogLevel.NONE, LogArea.NONE, message);
  }

  public spacer(char: string = '=', length?: number, color?: LogLevel): void {
    let terminalWidth = length;
    
    if (!terminalWidth) {
      try {
        // Try to get terminal width, fallback to 100
        terminalWidth = process.stdout.columns || 100;
      } catch {
        terminalWidth = 100;
      }
    }

    const colorCode = color ? this.getColor(color) : '\x1b[36m'; // Cyan by default
    const reset = this.resetColor();
    const output = `${colorCode}${char.repeat(terminalWidth)}${reset}`;
    
    try {
      console.log(output);
    } catch {
      const safeOutput = output.replace(/[\u0000-\u001F\u007F-\u009F]/g, '?');
      console.log(safeOutput);
    }
  }

  // Getters for configuration
  public get isDebugEnabled(): boolean {
    return this.minLevel === LogLevel.DEBUG;
  }

  public get currentLogLevel(): LogLevel {
    return this.minLevel;
  }

  public setLogLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  public enableConsole(): void {
    this.consoleEnabled = true;
  }

  public disableConsole(): void {
    this.consoleEnabled = false;
  }
}

// Export singleton instance
export const logger = BotLogger.getInstance();
