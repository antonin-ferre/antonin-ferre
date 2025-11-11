import { SessionStatusEnum, SessionInfo } from '../types/agent.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a new UUID v4
 */
function generateSessionId(): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return uuidv4() as string;
}

/**
 * Session Domain Entity
 * Manages conversation/execution sessions for agents
 */
export class Session {
  private readonly sessionId: string;
  private readonly agentId: string;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private expiresAt?: Date;
  private status: SessionStatusEnum;
  private metadata: Record<string, any>;

  constructor(
    agentId: string,
    sessionId?: string,
    status?: SessionStatusEnum,
    createdAt?: Date,
    updatedAt?: Date,
    metadata?: Record<string, any>,
    expiresAt?: Date,
  ) {
    if (!agentId || agentId.trim().length === 0) {
      throw new Error('Agent ID cannot be empty');
    }

    this.sessionId = sessionId ?? generateSessionId();
    this.agentId = agentId;
    this.status = status ?? SessionStatusEnum.ACTIVE;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
    this.expiresAt = expiresAt;
    this.metadata = metadata ?? {};
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get agent ID
   */
  getAgentId(): string {
    return this.agentId;
  }

  /**
   * Get session status
   */
  getStatus(): SessionStatusEnum {
    return this.status;
  }

  /**
   * Check if session is active
   */
  isActive(): boolean {
    if (this.expiresAt && new Date() > this.expiresAt) {
      return false;
    }
    return this.status === SessionStatusEnum.ACTIVE;
  }

  /**
   * Pause session
   */
  pause(): void {
    if (this.status === SessionStatusEnum.ACTIVE) {
      this.status = SessionStatusEnum.PAUSED;
      this.updatedAt = new Date();
    }
  }

  /**
   * Resume paused session
   */
  resume(): void {
    if (this.status === SessionStatusEnum.PAUSED) {
      this.status = SessionStatusEnum.ACTIVE;
      this.updatedAt = new Date();
    }
  }

  /**
   * Complete session
   */
  complete(): void {
    if (
      this.status === SessionStatusEnum.ACTIVE ||
      this.status === SessionStatusEnum.PAUSED
    ) {
      this.status = SessionStatusEnum.COMPLETED;
      this.updatedAt = new Date();
    }
  }

  /**
   * Mark session as failed
   */
  fail(reason?: string): void {
    this.status = SessionStatusEnum.FAILED;
    this.updatedAt = new Date();
    if (reason) {
      this.metadata.failureReason = reason;
    }
  }

  /**
   * Mark session as interrupted
   */
  interrupt(reason?: string): void {
    this.status = SessionStatusEnum.INTERRUPTED;
    this.updatedAt = new Date();
    if (reason) {
      this.metadata.interruptReason = reason;
    }
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
   * Get expiration date
   */
  getExpiresAt(): Date | undefined {
    return this.expiresAt ? new Date(this.expiresAt) : undefined;
  }

  /**
   * Set session expiration
   */
  setExpiration(expiresAt: Date): void {
    this.expiresAt = expiresAt;
    this.updatedAt = new Date();
  }

  /**
   * Get session metadata
   */
  getMetadata(): Record<string, any> {
    return { ...this.metadata };
  }

  /**
   * Update metadata
   */
  updateMetadata(newMetadata: Record<string, any>): void {
    this.metadata = { ...this.metadata, ...newMetadata };
    this.updatedAt = new Date();
  }

  /**
   * Get session info
   */
  getInfo(): SessionInfo {
    return {
      sessionId: this.sessionId,
      agentId: this.agentId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      expiresAt: this.expiresAt,
    };
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      sessionId: this.sessionId,
      agentId: this.agentId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      expiresAt: this.expiresAt,
      metadata: this.metadata,
    };
  }
}
