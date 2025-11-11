import {
  AgentTypeEnum,
  LLMProviderEnum,
  AgentConfig,
} from '../core/domain/types/agent.types';

/**
 * Specialized Agent Example Configuration
 * Code generation and validation agent
 */
export const specializedAgentConfig: AgentConfig = {
  type: AgentTypeEnum.SPECIALIZED,
  name: 'Code Generation Agent',
  description: 'Specialized agent for generating and validating code',
  llmConfig: {
    provider: LLMProviderEnum.OPENAI,
    modelName: 'gpt-4',
    temperature: 0.3,
    maxTokens: 4096,
  },
  maxIterations: 15,
  timeoutMs: 60000,
  systemPrompt: `You are an expert code generation agent. 
Generate clean, well-documented, and tested code.
Follow best practices for the requested language.
Validate your code before returning it.
If validation fails, refactor and try again.`,
  enableMemory: true,
  enableStreaming: true,
  tools: ['generate_code', 'validate_code', 'run_tests', 'format_code'],
  metadata: {
    category: 'development',
    targetAudience: 'developers',
    supportedLanguages: ['typescript', 'python', 'javascript', 'go'],
    maxCodeLength: 10000,
  },
};

/**
 * Specialized Agent Tools
 */
export const specializedTools = [
  {
    id: 'generate_code',
    name: 'generate_code',
    description: 'Generate code based on requirements',
    schema: {
      language: { type: 'string', description: 'Programming language' },
      requirements: { type: 'string', description: 'Code requirements' },
      style: { type: 'string', description: 'Code style preference' },
    },
    execute: (input: Record<string, unknown>) => {
      return {
        success: true,
        code: `// Generated ${input.language as string} code\nfunction example() {\n  return "Generated code";\n}`,
        language: input.language,
      };
    },
  },
  {
    id: 'validate_code',
    name: 'validate_code',
    description: 'Validate generated code for syntax and best practices',
    schema: {
      code: { type: 'string' },
      language: { type: 'string' },
    },
    execute: () => {
      return {
        success: true,
        isValid: true,
        errors: [],
        warnings: [],
        score: 95,
      };
    },
  },
  {
    id: 'run_tests',
    name: 'run_tests',
    description: 'Run tests on generated code',
    schema: {
      code: { type: 'string' },
      testCases: { type: 'array' },
    },
    execute: () => {
      return {
        success: true,
        testsRun: 5,
        testsPassed: 5,
        testsFailed: 0,
        coverage: 95,
      };
    },
  },
  {
    id: 'format_code',
    name: 'format_code',
    description: 'Format code according to standards',
    schema: {
      code: { type: 'string' },
      language: { type: 'string' },
      formatter: { type: 'string' },
    },
    execute: (input: Record<string, unknown>) => {
      return {
        success: true,
        formattedCode: input.code,
        formatter: (input.formatter as string) || 'default',
      };
    },
  },
];
