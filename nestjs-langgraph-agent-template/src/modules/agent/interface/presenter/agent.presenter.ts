import { Agent } from '../../core/domain/entities/agent.entity';
import { AgentResponseDto } from '../rest/dto/agent-response.dto';

/**
 * Agent Presenter
 * Transforms domain entities to DTOs for API responses
 */
export class AgentPresenter {
  /**
   * Convert Agent entity to response DTO
   */
  static toResponseDto(agent: Agent): AgentResponseDto {
    const config = agent.getConfig();

    return {
      id: agent.getId(),
      name: agent.getName(),
      description: config.description,
      type: config.type,
      isActive: agent.isAgentActive(),
      llmProvider: config.llmConfig.provider,
      llmModel: config.llmConfig.modelName,
      maxIterations: config.maxIterations,
      timeoutMs: config.timeoutMs,
      systemPrompt: config.systemPrompt,
      createdAt: agent.getCreatedAt().toISOString(),
      updatedAt: agent.getUpdatedAt().toISOString(),
    };
  }

  /**
   * Convert multiple agents to response DTOs
   */
  static toResponseDtos(agents: Agent[]): AgentResponseDto[] {
    return agents.map((agent) => this.toResponseDto(agent));
  }
}
