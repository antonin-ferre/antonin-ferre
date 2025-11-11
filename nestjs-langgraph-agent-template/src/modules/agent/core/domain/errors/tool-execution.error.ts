import { DomainError } from '@shared/errors/base.error';

/**
 * Thrown when a tool execution fails
 */
export class ToolExecutionError extends DomainError {
  constructor(toolName: string, reason: string) {
    super(
      `Tool "${toolName}" execution failed: ${reason}`,
      'TOOL_EXECUTION_ERROR',
      400,
    );
  }
}
