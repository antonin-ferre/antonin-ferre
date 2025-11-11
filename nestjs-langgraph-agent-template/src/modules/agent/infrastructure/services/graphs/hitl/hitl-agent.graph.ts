import { StateGraph, END } from '@langchain/langgraph';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { BaseLanguageModel } from '@langchain/core/language_models/base';
import { AgentState, AgentStateAnnotation } from '../agent-state';

/**
 * Human-In-The-Loop Agent Graph
 * Implements breakpoints for human approval
 * Features: execution planning, human review, approval/rejection handling
 */
export class HITLAgentGraph {
  private workflow: any;
  private approvalThreshold: number = 1; // Require approval for certain actions

  constructor(
    private readonly llm: BaseLanguageModel,
    private readonly maxIterations: number = 10,
  ) {
    this.workflow = this.buildGraph();
  }

  /**
   * Build the HITL workflow
   */
  private buildGraph(): any {
    const workflow = new StateGraph(AgentStateAnnotation);

    // Add nodes
    workflow.addNode('plan', this.planNode.bind(this));
    workflow.addNode('human_review', this.humanReviewNode.bind(this));
    workflow.addNode('execute', this.executeNode.bind(this));

    // Set entry point
    (workflow as any).setEntryPoint('plan');

    // Add edges
    (workflow as any).addEdge('plan', 'human_review');

    (workflow as any).addConditionalEdges(
      'human_review',
      this.processApproval.bind(this),
      {
        approved: 'execute',
        rejected: END,
        needs_revision: 'plan',
      },
    );

    (workflow as any).addEdge('execute', END);

    return workflow;
  }

  /**
   * Plan node - LLM generates action plan
   */
  private async planNode(state: AgentState) {
    const messages = [
      ...state.messages,
      new HumanMessage(
        `Create a detailed action plan for: ${state.query}\n\nBe specific about each step.`,
      ),
    ];

    try {
      const response = await this.llm.invoke(messages);

      return {
        messages: [response],
        metadata: {
          ...state.metadata,
          lastNodeRun: 'plan',
          planGenerated: true,
          plan: response.content,
        },
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Plan generation failed',
        metadata: {
          ...state.metadata,
          planError: true,
        },
      };
    }
  }

  /**
   * Human review node - creates interrupt for approval
   */
  private async humanReviewNode(state: AgentState) {
    const plan = state.metadata?.plan || 'No plan generated';

    // This node would trigger an interrupt in production
    // The system would wait for human feedback

    return {
      metadata: {
        ...state.metadata,
        lastNodeRun: 'human_review',
        requiresApproval: true,
        pendingPlan: plan,
        // In production, this would be set by human feedback
        humanApproval: 'pending',
      },
    };
  }

  /**
   * Execute node - performs the approved plan
   */
  private async executeNode(state: AgentState) {
    const plan = state.metadata?.pendingPlan || '';

    try {
      // Execute the plan (simplified)
      const executionMessages = [
        ...state.messages,
        new HumanMessage(`Execute this plan step by step: ${plan}`),
      ];

      const response = await this.llm.invoke(executionMessages);

      return {
        messages: [response],
        output: response.content,
        metadata: {
          ...state.metadata,
          lastNodeRun: 'execute',
          executionStatus: 'completed',
          executionResult: response.content,
        },
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Execution failed',
        metadata: {
          ...state.metadata,
          executionStatus: 'failed',
          executionError: true,
        },
      };
    }
  }

  /**
   * Process human approval/feedback
   */
  private processApproval(state: AgentState): string {
    const approval = state.metadata?.humanApproval;

    switch (approval) {
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      case 'needs_revision':
        return 'needs_revision';
      default:
        // In production, this would pause and wait for human input
        return 'needs_revision';
    }
  }

  /**
   * Process human feedback (to be called externally)
   */
  processHumanFeedback(
    state: AgentState,
    feedback: 'approved' | 'rejected' | 'needs_revision',
    notes?: string,
  ): AgentState {
    return {
      ...state,
      metadata: {
        ...state.metadata,
        humanApproval: feedback,
        humanFeedbackNotes: notes,
        feedbackReceivedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Get the compiled runnable graph
   */
  getRunnable() {
    return this.workflow.compile();
  }

  /**
   * Run the HITL agent
   */
  async run(query: string) {
    const graph = this.getRunnable();

    return graph.invoke({
      messages: [],
      query,
      iterations: 0,
      error: null,
      output: null,
      toolResults: {},
      metadata: {
        startedAt: new Date().toISOString(),
        agentType: 'hitl',
      },
    });
  }
}



