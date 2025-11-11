import { Injectable } from '@nestjs/common';
import type { ISessionRepository } from '../../core/ports/repositories/session.repository.interface';
import { Session } from '../../core/domain/entities/session.entity';
import { SessionStatusEnum } from '../../core/domain/types/agent.types';
import type { PageCursor, PaginatedResponse } from '@shared/types/common.types';

/**
 * In-Memory Session Repository
 * Implementation for development and testing
 */
@Injectable()
export class InMemorySessionRepository implements ISessionRepository {
  private sessions: Map<string, Session> = new Map();

  /**
   * Find session by ID
   */
  findById(sessionId: string): Promise<Session | null> {
    return Promise.resolve(this.sessions.get(sessionId) || null);
  }

  /**
   * Find sessions by agent ID
   */
  findByAgentId(
    agentId: string,
    cursor?: PageCursor,
  ): Promise<PaginatedResponse<Session>> {
    const sessions = Array.from(this.sessions.values()).filter(
      (s) => s.getAgentId() === agentId,
    );

    const skip = cursor?.skip || 0;
    const take = cursor?.take || 10;
    const paginatedSessions = sessions.slice(skip, skip + take);

    return Promise.resolve({
      data: paginatedSessions,
      total: sessions.length,
      skip,
      take,
    });
  }

  /**
   * Find sessions by status
   */
  findByStatus(
    status: SessionStatusEnum,
    cursor?: PageCursor,
  ): Promise<PaginatedResponse<Session>> {
    const sessions = Array.from(this.sessions.values()).filter(
      (s) => s.getStatus() === status,
    );

    const skip = cursor?.skip || 0;
    const take = cursor?.take || 10;
    const paginatedSessions = sessions.slice(skip, skip + take);

    return Promise.resolve({
      data: paginatedSessions,
      total: sessions.length,
      skip,
      take,
    });
  }

  /**
   * Find active sessions for agent
   */
  findActiveByAgentId(agentId: string): Promise<Session[]> {
    return Promise.resolve(
      Array.from(this.sessions.values()).filter(
        (s) => s.getAgentId() === agentId && s.isActive(),
      ),
    );
  }

  /**
   * Save session
   */
  save(session: Session): Promise<void> {
    this.sessions.set(session.getSessionId(), session);
    return Promise.resolve();
  }

  /**
   * Update session
   */
  update(session: Session): Promise<void> {
    if (!this.sessions.has(session.getSessionId())) {
      throw new Error(`Session with ID ${session.getSessionId()} not found`);
    }
    this.sessions.set(session.getSessionId(), session);
    return Promise.resolve();
  }

  /**
   * Delete session
   */
  delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    return Promise.resolve();
  }

  /**
   * Check if session exists
   */
  exists(sessionId: string): Promise<boolean> {
    return Promise.resolve(this.sessions.has(sessionId));
  }

  /**
   * Delete expired sessions
   */
  deleteExpiredSessions(): Promise<number> {
    let count = 0;
    const now = new Date();

    for (const [sessionId, session] of this.sessions.entries()) {
      const expiresAt = session.getExpiresAt();
      if (expiresAt && expiresAt < now) {
        this.sessions.delete(sessionId);
        count++;
      }
    }

    return Promise.resolve(count);
  }
}
