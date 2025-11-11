import { BaseMessage } from '@langchain/core/messages';
import { Annotation } from '@langchain/langgraph';

/**
 * Agent State Annotation
 * Defines the state structure for LangGraph agent execution
 * Using LangGraph's Annotation API for type-safe state management
 */
export const AgentStateAnnotation = Annotation.Root({
  // Conversation messages
  messages: Annotation<BaseMessage[]>({
    reducer: (x = [], y) => x.concat(y),
    default: () => [],
  }),

  // Current query/input
  query: Annotation<string>({
    reducer: (x, y) => y || x,
    default: () => '',
  }),

  // Tool results
  toolResults: Annotation<Record<string, any>>({
    reducer: (x = {}, y = {}) => ({ ...x, ...y }),
    default: () => ({}),
  }),

  // Execution metadata
  metadata: Annotation<Record<string, any>>({
    reducer: (x = {}, y = {}) => ({ ...x, ...y }),
    default: () => ({}),
  }),

  // Current iteration count
  iterations: Annotation<number>({
    reducer: (x = 0, y) => (y !== undefined ? y : x),
    default: () => 0,
  }),

  // Error tracking
  error: Annotation<string | null>({
    reducer: (x, y) => (y !== undefined ? y : x),
    default: () => null,
  }),

  // Final output
  output: Annotation<string | null>({
    reducer: (x, y) => (y !== undefined ? y : x),
    default: () => null,
  }),
});

/**
 * Agent State Type
 * Inferred from the annotation for type safety
 */
export type AgentState = typeof AgentStateAnnotation.State;
