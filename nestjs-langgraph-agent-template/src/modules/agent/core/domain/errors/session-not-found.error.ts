import { DomainError } from '@shared/errors/base.error';

/**
 * Thrown when a session is not found
 */
export class SessionNotFoundError extends DomainError {
  constructor(sessionId: string) {
    super(`Session with ID "${sessionId}" not found`, 'SESSION_NOT_FOUND', 404);
  }
}
