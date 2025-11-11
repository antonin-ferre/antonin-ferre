import { BaseMessage } from '@langchain/core/messages';

/**
 * Agent type enumeration
 * - general: General-purpose chatbot, assistant
 * - specialized: Domain-specific task automation
 * - multi-agent: Multi-agent orchestration system
 */
export enum AgentTypeEnum {
  GENERAL = 'general',
  SPECIALIZED = 'specialized',
  MULTI_AGENT = 'multi-agent',
}

/**
 * LLM provider types
 */
export enum LLMProviderEnum {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  AZURE = 'azure',
}

/**
 * Session status enumeration
 */
export enum SessionStatusEnum {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  INTERRUPTED = 'interrupted',
}

/**
 * LLM Model configuration
 */
export interface LLMModelConfig {
  provider: LLMProviderEnum;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

/**
 * Agent configuration interface
 */
export interface AgentConfig {
  type: AgentTypeEnum;
  name: string;
  description?: string;
  llmConfig: LLMModelConfig;
  maxIterations?: number;
  timeoutMs?: number;
  systemPrompt?: string;
  enableMemory?: boolean;
  enableStreaming?: boolean;
  tools?: string[]; // Tool IDs
  metadata?: Record<string, any>;
}

/**
 * Agent state managed during execution
 */
export interface AgentExecutionState {
  messages: BaseMessage[];
  iterations: number;
  lastToolCall?: string;
  error?: string;
  metadata: Record<string, any>;
}

/**
 * Session information
 */
export interface SessionInfo {
  sessionId: string;
  agentId: string;
  status: SessionStatusEnum;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

/**
 * Tool definition
 */
export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  schema: Record<string, any>;
  execute: (input: any) => Promise<any>;
}

/**
 * Agent execution result
 */
export interface AgentExecutionResult {
  sessionId: string;
  success: boolean;
  output: string;
  iterations: number;
  duration: number;
  state: AgentExecutionState;
  error?: string;
}
