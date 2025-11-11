import { ToolDefinition } from '../../domain/types/agent.types';

/**
 * Tool Registry Service Port
 * Manages tool registration and execution
 * Allows agents to dynamically register and use tools
 */
export interface IToolRegistryService {
  /**
   * Register a new tool
   */
  register(tool: ToolDefinition): void;

  /**
   * Get tool by ID
   */
  getTool(toolId: string): ToolDefinition | null;

  /**
   * Get tool by name
   */
  getToolByName(name: string): ToolDefinition | null;

  /**
   * Get all registered tools
   */
  getAllTools(): ToolDefinition[];

  /**
   * Get tools by IDs
   */
  getToolsByIds(toolIds: string[]): ToolDefinition[];

  /**
   * Check if tool exists
   */
  toolExists(toolId: string): boolean;

  /**
   * Unregister a tool
   */
  unregister(toolId: string): boolean;

  /**
   * Execute a tool
   */
  execute(toolId: string, input: any): Promise<any>;

  /**
   * Get tool schema (for LLM)
   */
  getToolSchema(toolId: string): Record<string, any> | null;

  /**
   * Get all tools as LLM-compatible tools
   */
  getToolsAsLLMTools(): any[];
}
