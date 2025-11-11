import { DomainError } from '@shared/errors/base.error';

/**
 * Thrown when an agent configuration is invalid
 */
export class InvalidAgentConfigError extends DomainError {
  constructor(reason: string) {
    super(
      `Invalid agent configuration: ${reason}`,
      'INVALID_AGENT_CONFIG',
      400,
    );
  }
}
