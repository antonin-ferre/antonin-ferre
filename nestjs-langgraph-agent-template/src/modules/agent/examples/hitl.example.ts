import {
  AgentTypeEnum,
  LLMProviderEnum,
  AgentConfig,
} from '../core/domain/types/agent.types';

/**
 * Human-In-The-Loop Agent Example Configuration
 * Financial transaction approval system
 */
export const hitlAgentConfig: AgentConfig = {
  type: AgentTypeEnum.SPECIALIZED,
  name: 'Financial Approval Agent',
  description:
    'Processes financial transactions with human approval checkpoints',
  llmConfig: {
    provider: LLMProviderEnum.OPENAI,
    modelName: 'gpt-4',
    temperature: 0.3,
    maxTokens: 2048,
  },
  maxIterations: 20,
  timeoutMs: 120000,
  systemPrompt: `You are a financial transaction processor.
Analyze transaction details and create a clear approval plan.
Consider risk factors and compliance requirements.
Present the plan for human review before execution.`,
  enableMemory: true,
  tools: [
    'analyze_transaction',
    'check_compliance',
    'calculate_risk',
    'execute_transaction',
  ],
  metadata: {
    category: 'finance',
    requiresApproval: true,
    complianceLevel: 'high',
    auditTrail: true,
    approvalThreshold: 1000,
  },
};

/**
 * HITL Agent Tools
 */
export const hitlTools = [
  {
    id: 'analyze_transaction',
    name: 'analyze_transaction',
    description: 'Analyze transaction for approval',
    schema: {
      transactionId: { type: 'string' },
      amount: { type: 'number' },
      type: { type: 'string' },
      details: { type: 'object' },
    },
    execute: (input: Record<string, unknown>) => {
      return {
        success: true,
        analysis: {
          transactionId: input.transactionId,
          amount: input.amount,
          type: input.type,
          riskLevel: 'medium',
          recommendedAction: 'approve_with_review',
        },
      };
    },
  },
  {
    id: 'check_compliance',
    name: 'check_compliance',
    description: 'Check transaction compliance',
    schema: {
      transactionId: { type: 'string' },
      amount: { type: 'number' },
    },
    execute: () => {
      return {
        success: true,
        compliance: {
          amlCheck: { passed: true, score: 95 },
          kycCheck: { passed: true, verified: true },
          sanctionCheck: { passed: true, noMatches: true },
          regulatoryCheck: { passed: true, compliant: true },
        },
      };
    },
  },
  {
    id: 'calculate_risk',
    name: 'calculate_risk',
    description: 'Calculate transaction risk score',
    schema: {
      amount: { type: 'number' },
      type: { type: 'string' },
      details: { type: 'object' },
    },
    execute: (input: Record<string, unknown>) => {
      return {
        success: true,
        risk: {
          score: 35,
          level: 'low',
          factors: ['Large amount', 'New beneficiary'],
          requiresApproval: (input.amount as number) > 10000,
        },
      };
    },
  },
  {
    id: 'execute_transaction',
    name: 'execute_transaction',
    description: 'Execute approved transaction',
    schema: {
      transactionId: { type: 'string' },
      approvalToken: { type: 'string' },
    },
    execute: (input: Record<string, unknown>) => {
      return {
        success: true,
        result: {
          transactionId: input.transactionId,
          status: 'executed',
          executedAt: new Date().toISOString(),
          confirmationNumber: 'CONF-' + Math.random().toString(36).substr(2, 9),
        },
      };
    },
  },
];
