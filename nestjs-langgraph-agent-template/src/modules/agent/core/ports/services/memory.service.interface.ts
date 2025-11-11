import { BaseMessage } from '@langchain/core/messages';

/**
 * Memory Service Port
 * Manages agent conversation memory
 * Supports different memory backends and strategies
 */
export interface IMemoryService {
  /**
   * Get memory for a session
   */
  getMemory(sessionId: string): Promise<BaseMessage[]>;

  /**
   * Save messages to memory
   */
  saveMessages(sessionId: string, messages: BaseMessage[]): Promise<void>;

  /**
   * Add single message to memory
   */
  addMessage(sessionId: string, message: BaseMessage): Promise<void>;

  /**
   * Clear session memory
   */
  clearMemory(sessionId: string): Promise<void>;

  /**
   * Get memory summary (condensed)
   */
  getMemorySummary(sessionId: string, maxTokens?: number): Promise<string>;

  /**
   * Check if memory exists for session
   */
  hasMemory(sessionId: string): Promise<boolean>;

  /**
   * Get memory size (message count or tokens)
   */
  getMemorySize(sessionId: string): Promise<number>;

  /**
   * Trim memory to last N messages
   */
  trimMemory(sessionId: string, maxMessages: number): Promise<void>;
}
