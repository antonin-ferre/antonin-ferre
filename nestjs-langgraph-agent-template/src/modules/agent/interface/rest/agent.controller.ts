import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateAgentUseCase } from '../../core/application/usecases/create-agent.usecase';
import { GetAgentUseCase } from '../../core/application/usecases/get-agent.usecase';
import { CreateAgentDto } from './dto/create-agent.dto';
import {
  AgentResponseDto,
  PaginatedAgentsResponseDto,
} from './dto/agent-response.dto';
import { AgentPresenter } from '../presenter/agent.presenter';
import {
  AgentTypeEnum,
  LLMProviderEnum,
} from '../../core/domain/types/agent.types';
import { AgentConfig } from '../../core/domain/types/agent.types';

/**
 * Agent Controller
 * REST API endpoints for agent management
 */
@Controller('agents')
export class AgentController {
  constructor(
    private readonly createAgentUseCase: CreateAgentUseCase,
    private readonly getAgentUseCase: GetAgentUseCase,
  ) {}

  /**
   * Create new agent
   * POST /agents
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAgent(
    @Body() createAgentDto: CreateAgentDto,
  ): Promise<AgentResponseDto> {
    const config: AgentConfig = {
      type: createAgentDto.type,
      name: createAgentDto.name,
      description: createAgentDto.description,
      llmConfig: {
        provider: createAgentDto.llmProvider,
        modelName: createAgentDto.llmModel,
        temperature: createAgentDto.temperature,
        maxTokens: createAgentDto.maxTokens,
      },
      maxIterations: createAgentDto.maxIterations,
      timeoutMs: createAgentDto.timeoutMs,
      systemPrompt: createAgentDto.systemPrompt,
    };

    const agent = await this.createAgentUseCase.execute(config);
    return AgentPresenter.toResponseDto(agent);
  }

  /**
   * Get agent by ID
   * GET /agents/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getAgent(@Param('id') agentId: string): Promise<AgentResponseDto> {
    const agent = await this.getAgentUseCase.execute(agentId);
    return AgentPresenter.toResponseDto(agent);
  }

  /**
   * Health check endpoint
   * GET /agents/health
   */
  @Get('health/ping')
  @HttpCode(HttpStatus.OK)
  async health(): Promise<{ status: string }> {
    return { status: 'ok' };
  }
}
