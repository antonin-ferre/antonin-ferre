import type { Agent } from '../../domain/entities/agent.entity';
import type { PageCursor, PaginatedResponse } from '@shared/types/common.types';

/**
 * Agent Repository Port
 * Abstracts data persistence for agents
 * Implementation can use any database
 */
export interface IAgentRepository {
  /**
   * Find agent by ID
   */
  findById(agentId: string): Promise<Agent | null>;

  /**
   * Find agent by name
   */
  findByName(name: string): Promise<Agent | null>;

  /**
   * Get all agents
   */
  findAll(cursor?: PageCursor): Promise<PaginatedResponse<Agent>>;

  /**
   * Save new agent
   */
  save(agent: Agent): Promise<void>;

  /**
   * Update existing agent
   */
  update(agent: Agent): Promise<void>;

  /**
   * Delete agent by ID
   */
  delete(agentId: string): Promise<void>;

  /**
   * Check if agent exists
   */
  exists(agentId: string): Promise<boolean>;

  /**
   * Get agent count
   */
  count(): Promise<number>;
}
