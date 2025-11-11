import { Injectable } from '@nestjs/common';
import { BaseMessage } from '@langchain/core/messages';
import type { IMemoryService } from '../../../core/ports/services/memory.service.interface';

/**
 * In-Memory Memory Service
 * Stores conversation memory in memory
 * Data is lost when application restarts
 */
@Injectable()
export class InMemoryMemoryService implements IMemoryService {
  private memory: Map<string, BaseMessage[]> = new Map();

  /**
   * Get memory for session
   */
  getMemory(sessionId: string): Promise<BaseMessage[]> {
    return Promise.resolve(this.memory.get(sessionId) ?? []);
  }

  /**
   * Save messages to memory
   */
  saveMessages(sessionId: string, messages: BaseMessage[]): Promise<void> {
    this.memory.set(sessionId, messages);
    return Promise.resolve();
  }

  /**
   * Add single message
   */
  addMessage(sessionId: string, message: BaseMessage): Promise<void> {
    const messages = this.memory.get(sessionId) ?? [];
    messages.push(message);
    this.memory.set(sessionId, messages);
    return Promise.resolve();
  }

  /**
   * Clear session memory
   */
  clearMemory(sessionId: string): Promise<void> {
    this.memory.delete(sessionId);
    return Promise.resolve();
  }

  /**
   * Get memory summary
   */
  getMemorySummary(sessionId: string): Promise<string> {
    const messages = this.memory.get(sessionId) ?? [];
    const summary = messages
      .map((msg) => {
        const content =
          typeof msg.content === 'string'
            ? msg.content
            : JSON.stringify(msg.content);
        return `${msg._getType()}: ${content}`;
      })
      .join('\n');
    return Promise.resolve(summary);
  }

  /**
   * Check if memory exists
   */
  hasMemory(sessionId: string): Promise<boolean> {
    return Promise.resolve(this.memory.has(sessionId));
  }

  /**
   * Get memory size
   */
  getMemorySize(sessionId: string): Promise<number> {
    return Promise.resolve((this.memory.get(sessionId) ?? []).length);
  }

  /**
   * Trim memory to max messages
   */
  trimMemory(sessionId: string, maxMessages: number): Promise<void> {
    const messages = this.memory.get(sessionId) ?? [];
    if (messages.length > maxMessages) {
      this.memory.set(sessionId, messages.slice(-maxMessages));
    }
    return Promise.resolve();
  }
}
