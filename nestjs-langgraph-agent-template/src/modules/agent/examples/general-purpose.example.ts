import {
  AgentTypeEnum,
  LLMProviderEnum,
  AgentConfig,
} from '../core/domain/types/agent.types';

/**
 * General-Purpose Agent Example Configuration
 * Chatbot with RAG capabilities for customer support
 */
export const generalPurposeAgentConfig: AgentConfig = {
  type: AgentTypeEnum.GENERAL,
  name: 'Customer Support Assistant',
  description:
    'General-purpose chatbot for customer support with knowledge base',
  llmConfig: {
    provider: LLMProviderEnum.OPENAI,
    modelName: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
  },
  maxIterations: 10,
  timeoutMs: 30000,
  systemPrompt: `You are a helpful customer support assistant. Answer questions based on the provided knowledge base. 
If you don't know the answer, say so and suggest contacting support.
Be friendly and professional.`,
  enableMemory: true,
  enableStreaming: true,
  tools: ['search_knowledge_base', 'create_ticket', 'get_faq'],
  metadata: {
    category: 'customer_support',
    targetAudience: 'end_users',
    responseStyle: 'helpful_and_friendly',
  },
};

/**
 * General-Purpose Agent Tools
 */
export const generalPurposeTools = [
  {
    id: 'search_knowledge_base',
    name: 'search_knowledge_base',
    description: 'Search the knowledge base for relevant articles',
    schema: {
      query: { type: 'string', description: 'Search query' },
      limit: { type: 'number', description: 'Max results to return' },
    },
    execute: () => {
      // Mock implementation
      return {
        success: true,
        results: [
          {
            title: 'How to reset password',
            content: 'To reset your password...',
            relevance: 0.95,
          },
        ],
      };
    },
  },
  {
    id: 'create_ticket',
    name: 'create_ticket',
    description: 'Create a support ticket for unresolved issues',
    schema: {
      subject: { type: 'string' },
      description: { type: 'string' },
      priority: { type: 'string' },
    },
    execute: () => {
      return {
        success: true,
        ticketId: 'TKT-' + Math.random().toString(36).substr(2, 9),
        message: 'Ticket created successfully',
      };
    },
  },
  {
    id: 'get_faq',
    name: 'get_faq',
    description: 'Get frequently asked questions',
    schema: {
      category: { type: 'string', description: 'FAQ category' },
    },
    execute: () => {
      return {
        success: true,
        faqs: [
          { question: 'What are your hours?', answer: 'We are open 24/7' },
          {
            question: 'How do I contact support?',
            answer: 'Visit support.example.com',
          },
        ],
      };
    },
  },
];
