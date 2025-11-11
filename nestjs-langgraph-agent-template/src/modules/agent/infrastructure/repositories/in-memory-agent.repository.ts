import { Injectable } from '@nestjs/common';
import type { IAgentRepository } from '../../core/ports/repositories/agent.repository.interface';
import { Agent } from '../../core/domain/entities/agent.entity';
import type { PageCursor, PaginatedResponse } from '@shared/types/common.types';

/**
 * In-Memory Agent Repository
 * Implementation for development and testing
 * All data is stored in memory and lost on restart
 */
@Injectable()
export class InMemoryAgentRepository implements IAgentRepository {
  private agents: Map<string, Agent> = new Map();

  /**
   * Find agent by ID
   */
  findById(agentId: string): Promise<Agent | null> {
    return Promise.resolve(this.agents.get(agentId) || null);
  }

  /**
   * Find agent by name
   */
  findByName(name: string): Promise<Agent | null> {
    for (const agent of this.agents.values()) {
      if (agent.getName() === name) {
        return Promise.resolve(agent);
      }
    }
    return Promise.resolve(null);
  }

  /**
   * Get all agents
   */
  findAll(cursor?: PageCursor): Promise<PaginatedResponse<Agent>> {
    const agents = Array.from(this.agents.values());
    const skip = cursor?.skip || 0;
    const take = cursor?.take || 10;

    const paginatedAgents = agents.slice(skip, skip + take);

    return Promise.resolve({
      data: paginatedAgents,
      total: agents.length,
      skip,
      take,
    });
  }

  /**
   * Save new agent
   */
  save(agent: Agent): Promise<void> {
    this.agents.set(agent.getId(), agent);
    return Promise.resolve();
  }

  /**
   * Update existing agent
   */
  update(agent: Agent): Promise<void> {
    if (!this.agents.has(agent.getId())) {
      throw new Error(`Agent with ID ${agent.getId()} not found`);
    }
    this.agents.set(agent.getId(), agent);
    return Promise.resolve();
  }

  /**
   * Delete agent
   */
  delete(agentId: string): Promise<void> {
    this.agents.delete(agentId);
    return Promise.resolve();
  }

  /**
   * Check if agent exists
   */
  exists(agentId: string): Promise<boolean> {
    return Promise.resolve(this.agents.has(agentId));
  }

  /**
   * Get agent count
   */
  count(): Promise<number> {
    return Promise.resolve(this.agents.size);
  }
}
