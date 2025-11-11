import { Injectable, Logger } from '@nestjs/common';

/**
 * Application-wide logger service
 * Provides consistent logging across all modules
 */
@Injectable()
export class LoggerService extends Logger {
  debug(message: string, context?: string) {
    super.debug(`[DEBUG] ${message}`, context);
  }

  log(message: string, context?: string) {
    super.log(`[LOG] ${message}`, context);
  }

  error(message: string, trace?: string, context?: string) {
    super.error(`[ERROR] ${message}`, trace, context);
  }

  warn(message: string, context?: string) {
    super.warn(`[WARN] ${message}`, context);
  }

  verbose(message: string, context?: string) {
    super.verbose(`[VERBOSE] ${message}`, context);
  }
}
