import { StateGraph, START, END } from '@langchain/langgraph';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { BaseLanguageModel } from '@langchain/core/language_models/base';
import { AgentState, AgentStateAnnotation } from '../agent-state';

interface WorkerAgent {
  run: (query: string) => Promise<unknown>;
}

/**
 * Multi-Agent Supervisor Graph
 * Implements supervisor pattern for agent coordination
 * Features: agent routing, task delegation, result aggregation
 */
export class MultiAgentGraph {
  private workflow: StateGraph<typeof AgentStateAnnotation>;
  private workers: Map<string, WorkerAgent> = new Map();

  constructor(
    private readonly supervisorLLM: BaseLanguageModel,
    private readonly maxIterations: number = 10,
  ) {
    this.workflow = this.buildGraph();
  }

  /**
   * Register worker agent
   */
  registerWorker(name: string, agent: WorkerAgent): void {
    this.workers.set(name, agent);
  }

  /**
   * Build the supervisor workflow
   * Note: Dynamic worker nodes make strict typing impractical,
   * so we use type assertions for the workflow construction
   */
  private buildGraph(): StateGraph<typeof AgentStateAnnotation> {
    // Dynamic worker nodes require `any` type for the workflow builder
    let workflow: any = new StateGraph(AgentStateAnnotation).addNode(
      'supervisor',
      this.supervisorNode.bind(this),
    );

    // Add worker nodes dynamically
    for (const workerName of this.workers.keys()) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      workflow = workflow.addNode(
        workerName,
        this.workerNode.bind(this, workerName),
      );
    }

    // Add edge from START to supervisor
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    workflow = workflow.addEdge(START, 'supervisor');

    // Add conditional edges from supervisor
    // Dynamic routing options require `any` type for dynamic worker names
    const routeOptions: Record<string, any> = { end: END };
    for (const workerName of this.workers.keys()) {
      routeOptions[workerName] = workerName;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    workflow = workflow.addConditionalEdges(
      'supervisor',
      this.routeWork.bind(this),
      routeOptions,
    );

    // Workers route back to supervisor
    for (const workerName of this.workers.keys()) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      workflow = workflow.addEdge(workerName, 'supervisor');
    }

    // Type assertion is necessary due to dynamic worker nodes
    return workflow as StateGraph<typeof AgentStateAnnotation>;
  }

  /**
   * Supervisor node - decides which worker to delegate to
   */
  private async supervisorNode(
    state: AgentState,
  ): Promise<Partial<AgentState>> {
    const workerNames = Array.from(this.workers.keys()).join(', ');
    const supervisorPrompt = `You are a supervisor agent. Based on the query, decide which worker to delegate to: ${workerNames}, or 'end' to finish.
Query: ${state.query}
Previous iterations: ${state.iterations ?? 0}`;

    const messages = [...state.messages, new HumanMessage(supervisorPrompt)];

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await this.supervisorLLM.invoke(messages);

      return {
        messages: [response as AIMessage],
        metadata: {
          ...state.metadata,
          lastNodeRun: 'supervisor',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          supervisorDecision: response.content,
        },
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Supervisor decision failed',
        metadata: {
          ...state.metadata,
          supervisorError: true,
        },
      };
    }
  }

  /**
   * Worker node - executes assigned task
   */
  private async workerNode(
    workerName: string,
    state: AgentState,
  ): Promise<Partial<AgentState>> {
    const worker = this.workers.get(workerName);

    if (!worker) {
      return {
        error: `Worker ${workerName} not found`,
        metadata: {
          ...state.metadata,
          workerError: true,
        },
      };
    }

    try {
      const result = await worker.run(state.query);

      return {
        toolResults: {
          ...state.toolResults,
          [workerName]: result,
        },
        metadata: {
          ...state.metadata,
          lastWorker: workerName,
          workerStatus: 'success',
        },
      };
    } catch (error) {
      return {
        toolResults: {
          ...state.toolResults,
          [workerName]: {
            error:
              error instanceof Error
                ? error.message
                : 'Worker execution failed',
          },
        },
        metadata: {
          ...state.metadata,
          lastWorker: workerName,
          workerStatus: 'failed',
        },
      };
    }
  }

  /**
   * Route work to appropriate worker
   */
  private routeWork(state: AgentState): string {
    const lastMessage = state.messages[state.messages.length - 1];
    const contentValue = lastMessage?.content;
    const content = (
      typeof contentValue === 'string'
        ? contentValue
        : JSON.stringify(contentValue ?? '')
    ).toLowerCase();

    // Check iteration limit
    if ((state.iterations ?? 0) >= this.maxIterations) {
      return 'end';
    }

    // Simple routing based on content
    for (const workerName of this.workers.keys()) {
      if (content.includes(workerName.toLowerCase())) {
        return workerName;
      }
    }

    // Default to end
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
   * Run the multi-agent system
   */
  async run(query: string): Promise<AgentState> {
    const graph = this.getRunnable();

    const result = (await graph.invoke({
      messages: [],
      query,
      iterations: 0,
      error: null,
      output: null,
      toolResults: {},
      metadata: {
        startedAt: new Date().toISOString(),
        agentType: 'multi-agent',
        workers: Array.from(this.workers.keys()),
      },
    })) as AgentState;

    return result;
  }
}
