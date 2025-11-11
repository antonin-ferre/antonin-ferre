import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import {
  AgentTypeEnum,
  LLMProviderEnum,
} from '../../../core/domain/types/agent.types';

/**
 * Create Agent DTO
 * Validates and transforms HTTP request data
 */
export class CreateAgentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(AgentTypeEnum)
  type: AgentTypeEnum;

  @IsEnum(LLMProviderEnum)
  llmProvider: LLMProviderEnum;

  @IsString()
  llmModel: string;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  maxTokens?: number;

  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @IsOptional()
  @IsNumber()
  maxIterations?: number;

  @IsOptional()
  @IsNumber()
  timeoutMs?: number;
}
