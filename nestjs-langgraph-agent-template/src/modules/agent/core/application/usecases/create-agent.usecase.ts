import { Injectable } from '@nestjs/common';
import type { IAgentRepository } from '../../ports/repositories/agent.repository.interface';
import { Agent } from '../../domain/entities/agent.entity';
import type { AgentConfig } from '../../domain/types/agent.types';
import { InvalidAgentConfigError } from '../../domain/errors/invalid-agent-config.error';

/**
 * Create Agent Use Case
 * Application layer use case for creating agents
 * Orchestrates domain entities and repositories
 */
@Injectable()
export class CreateAgentUseCase {
  constructor(private readonly agentRepository: IAgentRepository) {}

  /**
   * Execute the create agent use case
   */
  async execute(config: AgentConfig): Promise<Agent> {
    // Validate configuration
    this.validateConfig(config);

    // Check if agent with same name already exists
    const existingAgent = await this.agentRepository.findByName(config.name);
    if (existingAgent) {
      throw new InvalidAgentConfigError(
        `Agent with name "${config.name}" already exists`,
      );
    }

    // Create domain entity
    try {
      const agent = new Agent(config);

      // Persist to repository
      await this.agentRepository.save(agent);

      return agent;
    } catch (error) {
      if (error instanceof Error) {
        throw new InvalidAgentConfigError(error.message);
      }
      throw error;
    }
  }

  /**
   * Validate agent configuration
   */
  private validateConfig(config: AgentConfig): void {
    if (!config || typeof config !== 'object') {
      throw new InvalidAgentConfigError('Configuration must be an object');
    }

    if (!config.name || config.name.trim().length === 0) {
      throw new InvalidAgentConfigError('Agent name is required');
    }

    if (!config.type) {
      throw new InvalidAgentConfigError('Agent type is required');
    }

    if (!config.llmConfig) {
      throw new InvalidAgentConfigError('LLM configuration is required');
    }

    if (!config.llmConfig.modelName) {
      throw new InvalidAgentConfigError('LLM model name is required');
    }
  }
}
