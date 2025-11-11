import { DomainError } from '@shared/errors/base.error';

/**
 * Thrown when an agent is not found in the repository
 */
export class AgentNotFoundError extends DomainError {
  constructor(agentId: string) {
    super(`Agent with ID "${agentId}" not found`, 'AGENT_NOT_FOUND', 404);
  }
}
