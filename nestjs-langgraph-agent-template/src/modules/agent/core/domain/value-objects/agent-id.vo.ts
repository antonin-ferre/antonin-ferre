/**
 * Value Object: AgentId
 * Represents a unique identifier for an agent
 * Immutable and strongly-typed
 */
export class AgentId {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('AgentId cannot be empty');
    }
    this.value = value;
  }

  /**
   * Get the ID value
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Check equality with another AgentId
   */
  equals(other: AgentId): boolean {
    return this.value === other.value;
  }

  /**
   * String representation
   */
  toString(): string {
    return this.value;
  }

  /**
   * JSON representation
   */
  toJSON(): string {
    return this.value;
  }
}
