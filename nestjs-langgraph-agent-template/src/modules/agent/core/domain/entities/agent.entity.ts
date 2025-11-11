import { AgentConfig, AgentTypeEnum } from '../types/agent.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a new UUID v4
 */
function generateId(): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return uuidv4() as string;
}

/**
 * Agent Domain Entity
 * Represents an AI agent configuration and core business logic
 * Follows Clean Architecture - no framework dependencies
 */
export class Agent {
  private readonly id: string;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private config: AgentConfig;
  private isActive: boolean;

  constructor(
    config: AgentConfig,
    id?: string,
    isActive?: boolean,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.validateConfig(config);
    this.id = id ?? generateId();
    this.config = config;
    this.isActive = isActive ?? true;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }

  /**
   * Get agent ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }

  /**
   * Get agent name
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Get agent type
   */
  getType(): AgentTypeEnum {
    return this.config.type;
  }

  /**
   * Check if agent is active
   */
  isAgentActive(): boolean {
    return this.isActive;
  }

  /**
   * Activate agent
   */
  activate(): void {
    if (!this.isActive) {
      this.isActive = true;
      this.updatedAt = new Date();
    }
  }

  /**
   * Deactivate agent
   */
  deactivate(): void {
    if (this.isActive) {
      this.isActive = false;
      this.updatedAt = new Date();
    }
  }

  /**
   * Update agent configuration
   * @param newConfig Partial configuration to update
   */
  updateConfig(newConfig: Partial<AgentConfig>): void {
    const mergedConfig = { ...this.config, ...newConfig };
    this.validateConfig(mergedConfig);
    this.config = mergedConfig;
    this.updatedAt = new Date();
  }

  /**
   * Get creation date
   */
  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  /**
   * Get last update date
   */
  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  /**
   * Convert to JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      config: this.config,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Validate agent configuration
   * Business rule: Agent must have valid config
   */
  private validateConfig(config: AgentConfig): void {
    if (!config.name || config.name.trim().length === 0) {
      throw new Error('Agent name cannot be empty');
    }

    if (!config.type) {
      throw new Error('Agent type is required');
    }

    if (!config.llmConfig || !config.llmConfig.modelName) {
      throw new Error('LLM configuration with model name is required');
    }

    if (
      config.maxIterations &&
      config.maxIterations > 0 &&
      config.maxIterations < 1
    ) {
      throw new Error('Max iterations must be greater than 0');
    }

    if (config.timeoutMs && config.timeoutMs <= 0) {
      throw new Error('Timeout must be greater than 0');
    }
  }
}
