import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { BaseLanguageModel } from '@langchain/core/language_models/base';
import { HumanMessage, type BaseMessage } from '@langchain/core/messages';
import type { ILLMService } from '../../../core/ports/services/llm.service.interface';
import type { LLMModelConfig } from '../../../core/domain/types/agent.types';
import { LLMProviderEnum } from '../../../core/domain/types/agent.types';

/**
 * OpenAI LLM Service Implementation
 * Provides OpenAI API integration for the agent
 *
 * Based on LangChain best practices: https://docs.langchain.com/oss/javascript/langchain/models
 * - Proper model initialization with ChatOpenAI
 * - Efficient caching of model instances
 * - Type-safe message handling using LangChain message types
 * - Comprehensive error handling and logging
 */
@Injectable()
export class OpenAILLMService implements ILLMService {
  private readonly logger = new Logger(OpenAILLMService.name);
  private readonly llmCache: Map<string, BaseLanguageModel> = new Map();
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    if (!this.apiKey) {
      this.logger.error('OPENAI_API_KEY environment variable is not set');
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    this.logger.log('OpenAI LLM Service initialized');
  }

  /**
   * Get or create LLM instance with caching
   * @param config - LLM model configuration
   * @returns Initialized ChatOpenAI model instance
   */
  async getLLM(config: LLMModelConfig): Promise<BaseLanguageModel> {
    try {
      const cacheKey = this.generateCacheKey(config);

      // Return cached instance if available
      if (this.llmCache.has(cacheKey)) {
        this.logger.debug(`Retrieved cached LLM instance: ${cacheKey}`);
        const cachedLlm = this.llmCache.get(cacheKey);
        if (cachedLlm) {
          return Promise.resolve(cachedLlm);
        }
      }

      // Create new instance with validated configuration
      const validatedConfig = this.validateConfig(config);
      const llm = new ChatOpenAI({
        apiKey: this.apiKey,
        model: validatedConfig.modelName,
        temperature: validatedConfig.temperature ?? 0.7,
        maxTokens: validatedConfig.maxTokens,
        topP: validatedConfig.topP,
        timeout: 60000, // 60 second timeout for API calls
        maxRetries: 3,
      });

      this.llmCache.set(cacheKey, llm);
      this.logger.log(`Created new LLM instance: ${cacheKey}`);

      return Promise.resolve(llm);
    } catch (error) {
      this.logger.error('Failed to get or create LLM instance', error);
      throw new Error(
        `Failed to initialize LLM: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Check if LLM is available and accessible
   * @param config - LLM model configuration
   * @returns True if LLM is available, false otherwise
   */
  async isAvailable(config: LLMModelConfig): Promise<boolean> {
    try {
      this.logger.debug('Testing LLM availability');
      await this.testConnection(config);
      this.logger.log('LLM is available');
      return true;
    } catch (error) {
      this.logger.warn(
        `LLM is not available: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return false;
    }
  }

  /**
   * List available OpenAI models
   * @param _provider - Provider name (unused for OpenAI static list)
   * @returns Array of available model identifiers
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  listModels(_provider: string): Promise<string[]> {
    return Promise.resolve([
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
    ]);
  }

  /**
   * Test connection to OpenAI API
   * Uses LangChain message types for proper type safety
   * @param config - LLM model configuration
   * @returns True if connection successful
   */
  async testConnection(config: LLMModelConfig): Promise<boolean> {
    try {
      const llm = await this.getLLM(config);

      // Use LangChain HumanMessage for type-safe invocation
      // Reference: https://docs.langchain.com/oss/javascript/langchain/models#invoke
      const testMessage = new HumanMessage('test');
      const response = (await llm.invoke([testMessage])) as BaseMessage;

      if (!response) {
        throw new Error('Empty response from LLM');
      }

      this.logger.debug('Connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Connection test failed', error);
      throw new Error(
        `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Clear the LLM cache
   * Useful for memory management or forcing re-initialization
   */
  clearCache(): void {
    const cacheSize = this.llmCache.size;
    this.llmCache.clear();
    this.logger.log(`Cleared LLM cache (${cacheSize} entries removed)`);
  }

  /**
   * Validate model configuration
   * @param config - LLM model configuration
   * @returns Validated configuration
   * @throws Error if configuration is invalid
   */
  private validateConfig(config: LLMModelConfig): LLMModelConfig {
    if (!config.modelName) {
      throw new Error('Model name is required');
    }

    if (config.provider !== LLMProviderEnum.OPENAI) {
      throw new Error(
        `Invalid provider: ${config.provider}. This service only supports OpenAI.`,
      );
    }

    // Validate temperature is within valid range
    if (
      config.temperature !== undefined &&
      (config.temperature < 0 || config.temperature > 2)
    ) {
      throw new Error('Temperature must be between 0 and 2');
    }

    // Validate maxTokens is positive if provided
    if (config.maxTokens !== undefined && config.maxTokens <= 0) {
      throw new Error('maxTokens must be a positive number');
    }

    // Validate topP is within valid range
    if (config.topP !== undefined && (config.topP < 0 || config.topP > 1)) {
      throw new Error('topP must be between 0 and 1');
    }

    return config;
  }

  /**
   * Generate cache key from configuration
   * @param config - LLM model configuration
   * @returns Cache key string
   */
  private generateCacheKey(config: LLMModelConfig): string {
    return `${config.provider}:${config.modelName}:${config.temperature ?? 'default'}:${config.maxTokens ?? 'default'}`;
  }
}
