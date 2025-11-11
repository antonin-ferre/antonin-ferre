import { BaseLanguageModel } from '@langchain/core/language_models/base';
import { LLMModelConfig } from '../../domain/types/agent.types';

/**
 * LLM Service Port
 * Abstracts interaction with LLM providers
 * Supports multiple providers (OpenAI, Anthropic, etc.)
 */
export interface ILLMService {
  /**
   * Get or create LLM instance based on configuration
   */
  getLLM(config: LLMModelConfig): Promise<BaseLanguageModel>;

  /**
   * Check if LLM is available
   */
  isAvailable(config: LLMModelConfig): Promise<boolean>;

  /**
   * List available models for a provider
   */
  listModels(provider: string): Promise<string[]>;

  /**
   * Test LLM connection and configuration
   */
  testConnection(config: LLMModelConfig): Promise<boolean>;
}
