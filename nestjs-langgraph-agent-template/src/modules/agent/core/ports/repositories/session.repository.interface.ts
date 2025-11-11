import type { Session } from '../../domain/entities/session.entity';
import type { SessionStatusEnum } from '../../domain/types/agent.types';
import type { PageCursor, PaginatedResponse } from '@shared/types/common.types';

/**
 * Session Repository Port
 * Abstracts data persistence for agent sessions
 */
export interface ISessionRepository {
  /**
   * Find session by ID
   */
  findById(sessionId: string): Promise<Session | null>;

  /**
   * Find all sessions for an agent
   */
  findByAgentId(
    agentId: string,
    cursor?: PageCursor,
  ): Promise<PaginatedResponse<Session>>;

  /**
   * Find sessions with specific status
   */
  findByStatus(
    status: SessionStatusEnum,
    cursor?: PageCursor,
  ): Promise<PaginatedResponse<Session>>;

  /**
   * Find active sessions for an agent
   */
  findActiveByAgentId(agentId: string): Promise<Session[]>;

  /**
   * Save new session
   */
  save(session: Session): Promise<void>;

  /**
   * Update existing session
   */
  update(session: Session): Promise<void>;

  /**
   * Delete session
   */
  delete(sessionId: string): Promise<void>;

  /**
   * Check if session exists
   */
  exists(sessionId: string): Promise<boolean>;

  /**
   * Clean up expired sessions
   */
  deleteExpiredSessions(): Promise<number>;
}
