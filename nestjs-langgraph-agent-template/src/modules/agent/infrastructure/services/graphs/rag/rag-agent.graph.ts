import { StateGraph, START, END } from '@langchain/langgraph';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { BaseLanguageModel } from '@langchain/core/language_models/base';
import { AgentState, AgentStateAnnotation } from '../agent-state';

interface Document {
  pageContent: string;
  metadata?: Record<string, unknown>;
}

interface Retriever {
  getRelevantDocuments: (query: string) => Promise<Document[]>;
}

/**
 * RAG Agent Graph
 * Implements Retrieval-Augmented Generation pattern
 * Features: document retrieval, relevance grading, query rewriting
 */
export class RAGAgentGraph {
  private workflow: StateGraph<typeof AgentStateAnnotation>;

  constructor(
    private readonly llm: BaseLanguageModel,
    private readonly retriever: Retriever | null,
    private readonly maxIterations: number = 10,
  ) {
    this.workflow = this.buildGraph();
  }

  /**
   * Build the RAG workflow
   */
  private buildGraph(): StateGraph<typeof AgentStateAnnotation> {
    const workflow = new StateGraph(AgentStateAnnotation)
      .addNode('retrieve', this.retrieveNode.bind(this))
      .addNode('grade_documents', this.gradeDocumentsNode.bind(this))
      .addNode('generate', this.generateNode.bind(this))
      .addNode('rewrite_query', this.rewriteQueryNode.bind(this))
      .addEdge(START, 'retrieve')
      .addEdge('retrieve', 'grade_documents')
      .addConditionalEdges(
        'grade_documents',
        this.shouldRewriteQuery.bind(this),
        {
          generate: 'generate',
          rewrite: 'rewrite_query',
        },
      )
      .addEdge('generate', END)
      .addEdge('rewrite_query', 'retrieve');

    // Type assertion is necessary due to LangGraph's complex type inference with chained methods
    return workflow as unknown as StateGraph<typeof AgentStateAnnotation>;
  }

  /**
   * Retrieve relevant documents
   */
  private async retrieveNode(state: AgentState): Promise<Partial<AgentState>> {
    const query = state.query ?? '';

    if (!this.retriever) {
      return {
        metadata: {
          ...state.metadata,
          retrieverStatus: 'not_configured',
        },
      };
    }

    try {
      const docs = await this.retriever.getRelevantDocuments(query);

      return {
        toolResults: {
          retrieved_docs: docs.map((doc) => ({
            content: doc.pageContent,
            metadata: doc.metadata,
          })),
        },
        metadata: {
          ...state.metadata,
          retrievalMethod: 'vector_search',
          docsRetrieved: docs.length,
        },
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Retrieval failed',
        metadata: {
          ...state.metadata,
          retrievalError: true,
        },
      };
    }
  }

  /**
   * Grade retrieved documents for relevance
   */
  private gradeDocumentsNode(state: AgentState): Partial<AgentState> {
    const docs = (state.toolResults?.retrieved_docs as unknown[]) ?? [];

    if (docs.length === 0) {
      return {
        metadata: {
          ...state.metadata,
          documentGrading: 'no_documents',
        },
      };
    }

    // Simple grading: check if docs contain key terms from query
    const queryTerms = state.query?.toLowerCase().split(' ') ?? [];
    const gradedDocs = docs.filter((doc) => {
      const docRecord = doc as Record<string, unknown>;
      const content = ((docRecord.content as string) ?? '').toLowerCase();
      return queryTerms.some((term) => content.includes(term));
    });

    return {
      toolResults: {
        ...state.toolResults,
        graded_docs: gradedDocs,
      },
      metadata: {
        ...state.metadata,
        relevantDocsCount: gradedDocs.length,
        documentGradePass: gradedDocs.length > 0,
      },
    };
  }

  /**
   * Generate response based on retrieved documents
   */
  private async generateNode(state: AgentState): Promise<Partial<AgentState>> {
    const docs = (state.toolResults?.graded_docs as unknown[]) ?? [];
    const docContext = docs
      .map((doc) => (doc as Record<string, unknown>).content as string)
      .join('\n---\n');

    const messages = [
      ...state.messages,
      new HumanMessage(
        `Use the following documents to answer the question:\n${docContext}\n\nQuestion: ${state.query}`,
      ),
    ];

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await this.llm.invoke(messages);

      return {
        messages: [response as AIMessage],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        output: response.content as string,
        metadata: {
          ...state.metadata,
          lastNodeRun: 'generate',
          generationStatus: 'success',
        },
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Generation failed',
        metadata: {
          ...state.metadata,
          generationError: true,
        },
      };
    }
  }

  /**
   * Rewrite query for better retrieval
   */
  private async rewriteQueryNode(
    state: AgentState,
  ): Promise<Partial<AgentState>> {
    const messages = [
      ...state.messages,
      new HumanMessage(
        `Rewrite the following query to be more specific and retrieval-friendly: ${state.query}`,
      ),
    ];

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await this.llm.invoke(messages);

      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        query: response.content as string,
        metadata: {
          ...state.metadata,
          lastNodeRun: 'rewrite_query',
          queryRewriteCount:
            ((state.metadata?.queryRewriteCount as number) ?? 0) + 1,
        },
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Query rewrite failed',
        metadata: {
          ...state.metadata,
          rewriteError: true,
        },
      };
    }
  }

  /**
   * Determine if query needs rewriting
   */
  private shouldRewriteQuery(state: AgentState): string {
    const relevantDocsCount =
      (state.metadata?.relevantDocsCount as number) ?? 0;
    const rewriteCount = (state.metadata?.queryRewriteCount as number) ?? 0;

    // If no relevant docs and haven't tried rewriting yet, rewrite
    if (relevantDocsCount === 0 && rewriteCount < 2) {
      return 'rewrite';
    }

    return 'generate';
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
   * Run the RAG agent
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
      metadata: { startedAt: new Date().toISOString(), agentType: 'rag' },
    })) as AgentState;

    return result;
  }
}
