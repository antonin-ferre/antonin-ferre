import { InMemoryAgentRepository } from './in-memory-agent.repository';
import { Agent } from '../../core/domain/entities/agent.entity';
import {
  AgentConfig,
  AgentTypeEnum,
  LLMProviderEnum,
} from '../../core/domain/types/agent.types';

describe('InMemoryAgentRepository', () => {
  let repository: InMemoryAgentRepository;
  let testAgent: Agent;
  let agentConfig: AgentConfig;

  beforeEach(() => {
    repository = new InMemoryAgentRepository();
    agentConfig = {
      type: AgentTypeEnum.GENERAL,
      name: 'Test Agent',
      llmConfig: {
        provider: LLMProviderEnum.OPENAI,
        modelName: 'gpt-4',
      },
    };
    testAgent = new Agent(agentConfig, 'test-id');
  });

  describe('save and findById', () => {
    it('should save and retrieve agent', async () => {
      await repository.save(testAgent);
      const found = await repository.findById('test-id');

      expect(found).toBeDefined();
      expect(found?.getName()).toBe('Test Agent');
    });

    it('should return null for non-existent agent', async () => {
      const found = await repository.findById('non-existent');

      expect(found).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should find agent by name', async () => {
      await repository.save(testAgent);
      const found = await repository.findByName('Test Agent');

      expect(found).toBeDefined();
      expect(found?.getId()).toBe('test-id');
    });

    it('should return null if name not found', async () => {
      const found = await repository.findByName('Non-existent');

      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all agents', async () => {
      await repository.save(testAgent);
      const agent2 = new Agent(agentConfig, 'test-id-2');
      await repository.save(agent2);

      const result = await repository.findAll();

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should respect pagination', async () => {
      for (let i = 0; i < 15; i++) {
        const agent = new Agent(agentConfig, `test-id-${i}`);
        await repository.save(agent);
      }

      const result = await repository.findAll({ skip: 0, take: 10 });

      expect(result.data).toHaveLength(10);
      expect(result.total).toBe(15);
    });
  });

  describe('update', () => {
    it('should update existing agent', async () => {
      await repository.save(testAgent);
      testAgent.updateConfig({ maxIterations: 20 });
      await repository.update(testAgent);

      const found = await repository.findById('test-id');
      expect(found?.getConfig().maxIterations).toBe(20);
    });

    it('should throw error updating non-existent agent', async () => {
      await expect(repository.update(testAgent)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete agent', async () => {
      await repository.save(testAgent);
      await repository.delete('test-id');

      const found = await repository.findById('test-id');
      expect(found).toBeNull();
    });
  });

  describe('exists', () => {
    it('should return true for existing agent', async () => {
      await repository.save(testAgent);
      const exists = await repository.exists('test-id');

      expect(exists).toBe(true);
    });

    it('should return false for non-existent agent', async () => {
      const exists = await repository.exists('non-existent');

      expect(exists).toBe(false);
    });
  });

  describe('count', () => {
    it('should return agent count', async () => {
      await repository.save(testAgent);
      const count = await repository.count();

      expect(count).toBe(1);
    });

    it('should return 0 for empty repository', async () => {
      const count = await repository.count();

      expect(count).toBe(0);
    });
  });
});
