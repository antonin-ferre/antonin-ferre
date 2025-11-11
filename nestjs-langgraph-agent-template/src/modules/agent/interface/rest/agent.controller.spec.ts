import { Test, TestingModule } from '@nestjs/testing';
import { AgentController } from './agent.controller';
import { CreateAgentUseCase } from '../../core/application/usecases/create-agent.usecase';
import { GetAgentUseCase } from '../../core/application/usecases/get-agent.usecase';
import { Agent } from '../../core/domain/entities/agent.entity';
import {
  AgentConfig,
  AgentTypeEnum,
  LLMProviderEnum,
} from '../../core/domain/types/agent.types';

describe('AgentController', () => {
  let controller: AgentController;
  let mockCreateUseCase: any;
  let mockGetUseCase: any;

  beforeEach(async () => {
    mockCreateUseCase = {
      execute: jest.fn(),
    };

    mockGetUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentController],
      providers: [
        {
          provide: CreateAgentUseCase,
          useValue: mockCreateUseCase,
        },
        {
          provide: GetAgentUseCase,
          useValue: mockGetUseCase,
        },
      ],
    }).compile();

    controller = module.get<AgentController>(AgentController);
  });

  describe('createAgent', () => {
    it('should create agent', async () => {
      const agentConfig: AgentConfig = {
        type: AgentTypeEnum.GENERAL,
        name: 'Test Agent',
        llmConfig: {
          provider: LLMProviderEnum.OPENAI,
          modelName: 'gpt-4',
        },
      };

      const agent = new Agent(agentConfig, 'test-id');
      mockCreateUseCase.execute.mockResolvedValue(agent);

      const dto = {
        type: AgentTypeEnum.GENERAL,
        name: 'Test Agent',
        llmProvider: LLMProviderEnum.OPENAI,
        llmModel: 'gpt-4',
      };

      const result = await controller.createAgent(dto as any);

      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
      expect(result.name).toBe('Test Agent');
    });
  });

  describe('getAgent', () => {
    it('should get agent by id', async () => {
      const agentConfig: AgentConfig = {
        type: AgentTypeEnum.GENERAL,
        name: 'Test Agent',
        llmConfig: {
          provider: LLMProviderEnum.OPENAI,
          modelName: 'gpt-4',
        },
      };

      const agent = new Agent(agentConfig, 'test-id');
      mockGetUseCase.execute.mockResolvedValue(agent);

      const result = await controller.getAgent('test-id');

      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
      expect(mockGetUseCase.execute).toHaveBeenCalledWith('test-id');
    });
  });

  describe('health', () => {
    it('should return health status', async () => {
      const result = await controller.health();

      expect(result.status).toBe('ok');
    });
  });
});


