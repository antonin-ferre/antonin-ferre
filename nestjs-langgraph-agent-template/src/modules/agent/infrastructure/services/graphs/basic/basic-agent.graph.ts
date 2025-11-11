import { StateGraph, START, END } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { BaseLanguageModel } from '@langchain/core/language_models/base';
import { AgentState, AgentStateAnnotation } from '../agent-state';

interface ToolDefinition {
  name: string;
  invoke: (args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Basic ReAct Agent Graph
 * Implements a simple agent loop with tool calling
 * Supports: message processing, tool execution, and iteration tracking
 */
export class BasicAgentGraph {
  private workflow: StateGraph<typeof AgentStateAnnotation>;

  constructor(
    private readonly llm: BaseLanguageModel,
    private readonly tools: ToolDefinition[] = [],
    private readonly maxIterations: number = 10,
  ) {
    this.workflow = this.buildGraph();
  }

  /**
   * Build the LangGraph workflow
   */
  private buildGraph(): StateGraph<typeof AgentStateAnnotation> {
    const workflow = new StateGraph(AgentStateAnnotation)
      .addNode('agent', this.agentNode.bind(this))
      .addNode('tools', this.toolsNode.bind(this))
      .addEdge(START, 'agent')
      .addConditionalEdges('agent', this.shouldUseTool.bind(this), {
        tools: 'tools',
        end: END,
      })
      .addEdge('tools', 'agent');

    // Type assertion is necessary due to LangGraph's complex type inference with chained methods
    return workflow as unknown as StateGraph<typeof AgentStateAnnotation>;
  }

  /**
   * Agent node - LLM inference
   */
  private async agentNode(state: AgentState): Promise<Partial<AgentState>> {
    const messages = state.messages;

    // Call LLM
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = await this.llm.invoke(messages);

    // Increment iteration counter
    const iterations = (state.iterations ?? 0) + 1;

    return {
      messages: [response as BaseMessage],
      iterations,
      metadata: {
        ...state.metadata,
        lastNodeRun: 'agent',
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Tools node - Execute tool calls
   */
  private async toolsNode(state: AgentState): Promise<Partial<AgentState>> {
    const lastMessage = state.messages[state.messages.length - 1];

    if (!(lastMessage instanceof AIMessage)) {
      return {};
    }

    const toolResults: Record<string, unknown> = {};

    // Process tool calls if present
    if (lastMessage.tool_calls && Array.isArray(lastMessage.tool_calls)) {
      for (const toolCall of lastMessage.tool_calls) {
        try {
          const tool = this.tools.find((t) => t.name === toolCall.name);
          const toolCallRecord = toolCall as unknown as Record<string, unknown>;
          const toolId = (toolCallRecord.id as string) ?? toolCall.name;

          if (!tool) {
            toolResults[toolId] = {
              error: `Tool ${toolCall.name} not found`,
            };
            continue;
          }

          const result = await tool.invoke(
            (toolCallRecord.args as Record<string, unknown>) ?? {},
          );
          toolResults[toolId] = result;
        } catch (error) {
          const toolCallRecord = toolCall as unknown as Record<string, unknown>;
          const toolId = (toolCallRecord.id as string) ?? toolCall.name;
          toolResults[toolId] = {
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }
    }

    return {
      toolResults,
      metadata: {
        ...state.metadata,
        lastNodeRun: 'tools',
        toolCalls: lastMessage.tool_calls?.length ?? 0,
      },
    };
  }

  /**
   * Determine if we should use tools or end
   */
  private shouldUseTool(state: AgentState): string {
    const lastMessage = state.messages[state.messages.length - 1];

    // Check iteration limit
    if ((state.iterations ?? 0) >= this.maxIterations) {
      return 'end';
    }

    // If last message is from AI and has tool calls, use tools
    if (
      lastMessage instanceof AIMessage &&
      lastMessage.tool_calls &&
      Array.isArray(lastMessage.tool_calls) &&
      lastMessage.tool_calls.length > 0
    ) {
      return 'tools';
    }

    return 'end';
  }

  /**
   * Get the compiled runnable graph
   */
  getRunnable(): ReturnType<
    StateGraph<typeof AgentStateAnnotation>['compile']
  > {
    return this.workflow.compile();
  }

  /**
   * Run the agent with input
   */
  async run(query: string, systemPrompt?: string): Promise<AgentState> {
    const messages: BaseMessage[] = [];

    // Add system message if provided
    if (systemPrompt) {
      messages.push(new HumanMessage(systemPrompt));
    }

    // Add query
    messages.push(new HumanMessage(query));

    const graph = this.getRunnable();

    const result = (await graph.invoke({
      messages,
      query,
      iterations: 0,
      error: null,
      output: null,
      toolResults: {},
      metadata: { startedAt: new Date().toISOString() },
    })) as AgentState;

    return result;
  }

  /**
   * Stream the agent execution
   */
  async stream(
    query: string,
    systemPrompt?: string,
  ): Promise<AsyncGenerator<Record<string, unknown>, void, unknown>> {
    const messages: BaseMessage[] = [];

    if (systemPrompt) {
      messages.push(new HumanMessage(systemPrompt));
    }

    messages.push(new HumanMessage(query));

    const graph = this.getRunnable();

    const stream = (await graph.stream(
      {
        messages,
        query,
        iterations: 0,
        error: null,
        output: null,
        toolResults: {},
        metadata: { startedAt: new Date().toISOString() },
      },
      { streamMode: 'updates' },
    )) as AsyncGenerator<Record<string, unknown>, void, unknown>;

    return stream;
  }
}
