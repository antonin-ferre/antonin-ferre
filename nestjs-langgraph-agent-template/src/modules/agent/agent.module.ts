import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Use Cases
import { CreateAgentUseCase } from './core/application/usecases/create-agent.usecase';
import { GetAgentUseCase } from './core/application/usecases/get-agent.usecase';

// Repositories
import { InMemoryAgentRepository } from './infrastructure/repositories/in-memory-agent.repository';
import { InMemorySessionRepository } from './infrastructure/repositories/in-memory-session.repository';

// Services
import { OpenAILLMService } from './infrastructure/services/llm/openai-llm.service';
import { ToolRegistryService } from './infrastructure/services/tools/tool-registry.service';
import { InMemoryMemoryService } from './infrastructure/services/memory/in-memory.memory.service';

// LangGraph - imported from graphs/basic folder when needed

// Controller
import { AgentController } from './interface/rest/agent.controller';

// Presenter
import { AgentPresenter } from './interface/presenter/agent.presenter';

/**
 * Agent Module
 * Contains all agent-related functionality
 * Implements Clean Architecture with proper dependency injection
 */
@Module({
  providers: [
    // Repositories
    {
      provide: 'IAgentRepository',
      useClass: InMemoryAgentRepository,
    },
    {
      provide: 'ISessionRepository',
      useClass: InMemorySessionRepository,
    },

    // Services
    {
      provide: 'ILLMService',
      useClass: OpenAILLMService,
    },
    {
      provide: 'IToolRegistryService',
      useClass: ToolRegistryService,
    },
    {
      provide: 'IMemoryService',
      useClass: InMemoryMemoryService,
    },

    // Use Cases
    {
      provide: CreateAgentUseCase,
      useFactory: (agentRepository: any) => {
        return new CreateAgentUseCase(agentRepository);
      },
      inject: ['IAgentRepository'],
    },
    {
      provide: GetAgentUseCase,
      useFactory: (agentRepository: any) => {
        return new GetAgentUseCase(agentRepository);
      },
      inject: ['IAgentRepository'],
    },

    // Presenters
    AgentPresenter,
  ],
  controllers: [AgentController],
  exports: [
    // Export use cases for controller injection
    CreateAgentUseCase,
    GetAgentUseCase,
    // Export repositories for other modules
    'IAgentRepository',
    'ISessionRepository',
    // Export services
    'ILLMService',
    'IToolRegistryService',
    'IMemoryService',
  ],
})
export class AgentModule {}
