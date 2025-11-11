import { Injectable } from '@nestjs/common';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import type { IToolRegistryService } from '../../../core/ports/services/tool-registry.service.interface';
import type { ToolDefinition } from '../../../core/domain/types/agent.types';
import { ToolExecutionError } from '../../../core/domain/errors/tool-execution.error';

interface LLMTool {
  name: string;
  invoke: (input: unknown) => Promise<unknown>;
}

/**
 * Tool Registry Service
 * Manages tool registration and execution for agents
 */
@Injectable()
export class ToolRegistryService implements IToolRegistryService {
  private tools: Map<string, ToolDefinition> = new Map();
  private llmTools: LLMTool[] = [];

  /**
   * Register a new tool
   */
  register(toolDef: ToolDefinition): void {
    this.tools.set(toolDef.id, toolDef);

    // Create LLM-compatible tool
    const llmTool = tool(
      async (input: unknown) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const result = await toolDef.execute(input);
          return JSON.stringify(result);
        } catch (error) {
          throw new ToolExecutionError(
            toolDef.name,
            error instanceof Error ? error.message : String(error),
          );
        }
      },
      {
        name: toolDef.name,
        description: toolDef.description,
        schema: z.object(
          Object.entries(toolDef.schema).reduce(
            (acc, [key]: [string, unknown]) => {
              acc[key] = z.unknown(); // Simplified schema for now
              return acc;
            },
            {} as Record<string, z.ZodType>,
          ),
        ),
      },
    );

    this.llmTools.push(llmTool);
  }

  /**
   * Get tool by ID
   */
  getTool(toolId: string): ToolDefinition | null {
    return this.tools.get(toolId) || null;
  }

  /**
   * Get tool by name
   */
  getToolByName(name: string): ToolDefinition | null {
    for (const tool of this.tools.values()) {
      if (tool.name === name) {
        return tool;
      }
    }
    return null;
  }

  /**
   * Get all registered tools
   */
  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by IDs
   */
  getToolsByIds(toolIds: string[]): ToolDefinition[] {
    return toolIds
      .map((id) => this.tools.get(id))
      .filter((tool): tool is ToolDefinition => tool !== undefined);
  }

  /**
   * Check if tool exists
   */
  toolExists(toolId: string): boolean {
    return this.tools.has(toolId);
  }

  /**
   * Unregister a tool
   */
  unregister(toolId: string): boolean {
    const existed = this.tools.has(toolId);
    if (existed) {
      this.tools.delete(toolId);
      // Also remove from LLM tools
      const toolDef = this.tools.get(toolId);
      if (toolDef) {
        this.llmTools = this.llmTools.filter((t) => t.name !== toolDef.name);
      }
    }
    return existed;
  }

  /**
   * Execute a tool
   * Note: 'any' types used here for flexible tool input/output handling
   * compatible with LangChain tool system
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async execute(toolId: string, input: any): Promise<any> {
    const toolDef = this.getTool(toolId);
    if (!toolDef) {
      throw new ToolExecutionError(toolId, 'Tool not found');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await toolDef.execute(input);
    } catch (error) {
      throw new ToolExecutionError(
        toolDef.name,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /**
   * Get tool schema
   */
  getToolSchema(toolId: string): Record<string, unknown> | null {
    const toolDef = this.getTool(toolId);
    return toolDef ? toolDef.schema : null;
  }

  /**
   * Get all tools as LLM-compatible tools
   */
  getToolsAsLLMTools(): LLMTool[] {
    return [...this.llmTools];
  }
}
