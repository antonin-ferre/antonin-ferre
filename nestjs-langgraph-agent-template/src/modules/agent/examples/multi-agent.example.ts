import {
  AgentTypeEnum,
  LLMProviderEnum,
  AgentConfig,
} from '../core/domain/types/agent.types';

/**
 * Multi-Agent System Example Configuration
 * Research and writing system with multiple specialized agents
 */

export const researchAgentConfig: AgentConfig = {
  type: AgentTypeEnum.SPECIALIZED,
  name: 'Research Agent',
  description: 'Conducts research and gathers information',
  llmConfig: {
    provider: LLMProviderEnum.OPENAI,
    modelName: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
  },
  maxIterations: 10,
  timeoutMs: 45000,
  systemPrompt: `You are a research specialist. 
Gather comprehensive information on the given topic.
Find sources and cite them.
Organize findings clearly.`,
  enableMemory: true,
  tools: ['search_web', 'fetch_article', 'extract_facts'],
  metadata: {
    role: 'researcher',
    multiAgent: true,
  },
};

export const writerAgentConfig: AgentConfig = {
  type: AgentTypeEnum.SPECIALIZED,
  name: 'Writer Agent',
  description: 'Writes content based on research',
  llmConfig: {
    provider: LLMProviderEnum.OPENAI,
    modelName: 'gpt-4',
    temperature: 0.8,
    maxTokens: 3000,
  },
  maxIterations: 8,
  timeoutMs: 60000,
  systemPrompt: `You are a professional writer.
Create engaging, well-structured content.
Use proper grammar and style.
Incorporate research findings naturally.`,
  enableMemory: true,
  tools: ['format_text', 'add_citations', 'check_grammar'],
  metadata: {
    role: 'writer',
    multiAgent: true,
  },
};

export const editorAgentConfig: AgentConfig = {
  type: AgentTypeEnum.SPECIALIZED,
  name: 'Editor Agent',
  description: 'Reviews and edits written content',
  llmConfig: {
    provider: LLMProviderEnum.OPENAI,
    modelName: 'gpt-4',
    temperature: 0.5,
    maxTokens: 2048,
  },
  maxIterations: 5,
  timeoutMs: 30000,
  systemPrompt: `You are a professional editor.
Review content for clarity, accuracy, and flow.
Suggest improvements.
Ensure consistency and quality.`,
  enableMemory: true,
  tools: ['highlight_issues', 'suggest_improvements', 'validate_facts'],
  metadata: {
    role: 'editor',
    multiAgent: true,
  },
};

/**
 * Multi-Agent Tools
 */
export const multiAgentTools = [
  {
    id: 'search_web',
    name: 'search_web',
    description: 'Search the web for information',
    schema: {
      query: { type: 'string' },
      resultCount: { type: 'number' },
    },
    execute: () => {
      return {
        success: true,
        results: [
          {
            title: 'Article 1',
            url: 'https://example.com/1',
            snippet: 'Content...',
          },
        ],
      };
    },
  },
  {
    id: 'fetch_article',
    name: 'fetch_article',
    description: 'Fetch full article content',
    schema: {
      url: { type: 'string' },
    },
    execute: (input: Record<string, unknown>) => {
      return {
        success: true,
        content: 'Full article content...',
        source: input.url,
      };
    },
  },
  {
    id: 'extract_facts',
    name: 'extract_facts',
    description: 'Extract key facts from content',
    schema: {
      content: { type: 'string' },
      topicFilter: { type: 'string' },
    },
    execute: () => {
      return {
        success: true,
        facts: ['Fact 1', 'Fact 2', 'Fact 3'],
      };
    },
  },
  {
    id: 'format_text',
    name: 'format_text',
    description: 'Format text with proper structure',
    schema: {
      text: { type: 'string' },
      format: { type: 'string' },
    },
    execute: (input: Record<string, unknown>) => {
      return {
        success: true,
        formattedText: input.text,
      };
    },
  },
  {
    id: 'add_citations',
    name: 'add_citations',
    description: 'Add citations to text',
    schema: {
      text: { type: 'string' },
      sources: { type: 'array' },
    },
    execute: (input: Record<string, unknown>) => {
      return {
        success: true,
        textWithCitations: (input.text as string) + '\n[Citations added]',
      };
    },
  },
  {
    id: 'check_grammar',
    name: 'check_grammar',
    description: 'Check grammar and style',
    schema: {
      text: { type: 'string' },
    },
    execute: () => {
      return {
        success: true,
        errors: [],
        suggestions: [],
        score: 98,
      };
    },
  },
  {
    id: 'highlight_issues',
    name: 'highlight_issues',
    description: 'Highlight content issues',
    schema: {
      content: { type: 'string' },
    },
    execute: () => {
      return {
        success: true,
        issues: [],
        severity: 'low',
      };
    },
  },
  {
    id: 'suggest_improvements',
    name: 'suggest_improvements',
    description: 'Suggest improvements to content',
    schema: {
      content: { type: 'string' },
    },
    execute: () => {
      return {
        success: true,
        suggestions: ['Suggestion 1', 'Suggestion 2'],
      };
    },
  },
  {
    id: 'validate_facts',
    name: 'validate_facts',
    description: 'Validate facts in content',
    schema: {
      content: { type: 'string' },
    },
    execute: () => {
      return {
        success: true,
        factCheckResults: [{ fact: 'Fact 1', status: 'verified' }],
      };
    },
  },
];
