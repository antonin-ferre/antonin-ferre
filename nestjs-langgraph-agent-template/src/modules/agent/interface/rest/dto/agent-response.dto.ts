import {
  AgentTypeEnum,
  LLMProviderEnum,
} from '../../../core/domain/types/agent.types';

/**
 * Agent Response DTO
 * Represents agent data in HTTP responses
 */
export class AgentResponseDto {
  id: string;
  name: string;
  description?: string;
  type: AgentTypeEnum;
  isActive: boolean;
  llmProvider: LLMProviderEnum;
  llmModel: string;
  maxIterations?: number;
  timeoutMs?: number;
  systemPrompt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated Agents Response DTO
 */
export class PaginatedAgentsResponseDto {
  data: AgentResponseDto[];
  total: number;
  skip: number;
  take: number;
}
