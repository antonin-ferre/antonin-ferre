import { CreateAgentUseCase } from './create-agent.usecase';
import {
  AgentConfig,
  AgentTypeEnum,
  LLMProviderEnum,
} from '../../domain/types/agent.types';
import { InvalidAgentConfigError } from '../../domain/errors/invalid-agent-config.error';
import type { IAgentRepository } from '../../ports/repositories/agent.repository.interface';
import { Agent } from '../../domain/entities/agent.entity';

describe('CreateAgentUseCase', () => {
  let useCase: CreateAgentUseCase;
  let mockRepository: jest.Mocked<IAgentRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByName: jest.fn().mockResolvedValue(null),
      findAll: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      count: jest.fn(),
    };

    useCase = new CreateAgentUseCase(mockRepository);
  });

  describe('execute', () => {
    let validConfig: AgentConfig;

    beforeEach(() => {
      validConfig = {
        type: AgentTypeEnum.GENERAL,
        name: 'Test Agent',
        llmConfig: {
          provider: LLMProviderEnum.OPENAI,
          modelName: 'gpt-4',
        },
      };
    });

    it('should create agent with valid config', async (): Promise<void> => {
      const result = await useCase.execute(validConfig);

      expect(result).toBeDefined();
      expect(result.getName()).toBe('Test Agent');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error if agent name already exists', async (): Promise<void> => {
      const existingAgent = new Agent(validConfig);
      mockRepository.findByName.mockResolvedValue(existingAgent);

      await expect(useCase.execute(validConfig)).rejects.toThrow(
        InvalidAgentConfigError,
      );
    });

    it('should throw error if config is invalid', async (): Promise<void> => {
      const invalidConfig = { ...validConfig, name: '' };

      await expect(useCase.execute(invalidConfig)).rejects.toThrow(
        InvalidAgentConfigError,
      );
    });

    it('should throw error if config is not an object', async (): Promise<void> => {
      const invalidConfig = null as unknown as AgentConfig;

      await expect(useCase.execute(invalidConfig)).rejects.toThrow(
        InvalidAgentConfigError,
      );
    });

    it('should throw error if type is missing', async (): Promise<void> => {
      const incompleteConfig: AgentConfig = {
        ...validConfig,
        type: undefined as unknown as AgentTypeEnum,
      };

      await expect(useCase.execute(incompleteConfig)).rejects.toThrow();
    });

    it('should throw error if llmConfig is missing', async (): Promise<void> => {
      const incompleteConfig: Partial<AgentConfig> = {
        ...validConfig,
        llmConfig: undefined,
      };

      await expect(
        useCase.execute(incompleteConfig as AgentConfig),
      ).rejects.toThrow();
    });
  });
});
