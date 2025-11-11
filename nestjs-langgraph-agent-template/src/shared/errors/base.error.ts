/**
 * Base Error class for domain layer errors
 * All domain-specific errors should extend this class
 */
export abstract class DomainError extends Error {
  public readonly timestamp = new Date();

  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
    };
  }
}
