import { Injectable } from '@nestjs/common';
import type { IAgentRepository } from '../../ports/repositories/agent.repository.interface';
import { Agent } from '../../domain/entities/agent.entity';
import { AgentNotFoundError } from '../../domain/errors/agent-not-found.error';

/**
 * Get Agent Use Case
 * Retrieves an agent by ID
 */
@Injectable()
export class GetAgentUseCase {
  constructor(private readonly agentRepository: IAgentRepository) {}

  /**
   * Execute the get agent use case
   */
  async execute(agentId: string): Promise<Agent> {
    const agent = await this.agentRepository.findById(agentId);

    if (!agent) {
      throw new AgentNotFoundError(agentId);
    }

    return agent;
  }
}
