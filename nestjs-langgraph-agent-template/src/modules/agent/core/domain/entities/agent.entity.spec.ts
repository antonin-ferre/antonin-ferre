import { Agent } from './agent.entity';
import {
  AgentConfig,
  AgentTypeEnum,
  LLMProviderEnum,
} from '../types/agent.types';

describe('Agent Entity', () => {
  let agentConfig: AgentConfig;

  beforeEach(() => {
    agentConfig = {
      type: AgentTypeEnum.GENERAL,
      name: 'Test Agent',
      llmConfig: {
        provider: LLMProviderEnum.OPENAI,
        modelName: 'gpt-4',
      },
    };
  });

  describe('constructor', () => {
    it('should create an agent with valid config', () => {
      const agent = new Agent(agentConfig);

      expect(agent.getName()).toBe('Test Agent');
      expect(agent.getType()).toBe(AgentTypeEnum.GENERAL);
      expect(agent.isAgentActive()).toBe(true);
    });

    it('should throw error if name is empty', () => {
      agentConfig.name = '';

      expect(() => new Agent(agentConfig)).toThrow(
        'Agent name cannot be empty',
      );
    });

    it('should throw error if type is missing', () => {
      const invalidConfig = {
        ...agentConfig,
        type: undefined,
      } as unknown as AgentConfig;

      expect(() => new Agent(invalidConfig)).toThrow('Agent type is required');
    });

    it('should throw error if llmConfig is missing', () => {
      const invalidConfig = {
        ...agentConfig,
        llmConfig: undefined,
      } as unknown as AgentConfig;

      expect(() => new Agent(invalidConfig)).toThrow('LLM configuration');
    });
  });

  describe('activate/deactivate', () => {
    it('should activate deactivated agent', () => {
      const agent = new Agent(agentConfig, undefined, false);
      expect(agent.isAgentActive()).toBe(false);

      agent.activate();
      expect(agent.isAgentActive()).toBe(true);
    });

    it('should deactivate active agent', () => {
      const agent = new Agent(agentConfig);
      expect(agent.isAgentActive()).toBe(true);

      agent.deactivate();
      expect(agent.isAgentActive()).toBe(false);
    });
  });

  describe('updateConfig', () => {
    it('should update agent configuration', () => {
      const agent = new Agent(agentConfig);

      agent.updateConfig({ maxIterations: 20 });
      expect(agent.getConfig().maxIterations).toBe(20);
    });

    it('should throw error on invalid config update', () => {
      const agent = new Agent(agentConfig);

      expect(() => agent.updateConfig({ name: '' })).toThrow();
    });
  });

  describe('getters', () => {
    it('should return agent id', () => {
      const agent = new Agent(agentConfig, 'test-id');
      expect(agent.getId()).toBe('test-id');
    });

    it('should return config', () => {
      const agent = new Agent(agentConfig);
      const config = agent.getConfig();

      expect(config.name).toBe('Test Agent');
      expect(config.type).toBe(AgentTypeEnum.GENERAL);
    });

    it('should return creation and update dates', () => {
      const agent = new Agent(agentConfig);

      expect(agent.getCreatedAt()).toBeInstanceOf(Date);
      expect(agent.getUpdatedAt()).toBeInstanceOf(Date);
    });
  });

  describe('toJSON', () => {
    it('should serialize agent to JSON', () => {
      const agent = new Agent(agentConfig, 'test-id');
      const json = agent.toJSON();

      expect(json.id).toBe('test-id');
      expect(json.config.name).toBe('Test Agent');
      expect(json.isActive).toBe(true);
    });
  });
});
