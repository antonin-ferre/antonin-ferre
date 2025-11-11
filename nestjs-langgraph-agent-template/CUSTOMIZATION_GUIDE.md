# Customization Guide

This guide walks you through customizing the NestJS LangGraph Agent Template for your specific use case.

## Table of Contents

1. [Adding a New Agent Type](#adding-a-new-agent-type)
2. [Implementing Custom Tools](#implementing-custom-tools)
3. [Switching Databases](#switching-databases)
4. [Adding LLM Providers](#adding-llm-providers)
5. [Custom Memory Backends](#custom-memory-backends)
6. [Real-World Examples](#real-world-examples)

---

## Adding a New Agent Type

### Step 1: Create Your LangGraph Agent

Create a new file in `src/modules/agent/infrastructure/services/langgraph/`:

```typescript
// src/modules/agent/infrastructure/services/langgraph/custom-agent.graph.ts
import { StateGraph, START, END } from '@langchain/langgraph';
import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';

// Define your agent state
export const customAgentStateAnnotation = {
  messages: {
    value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => [],
  },
  customField: {
    value: (x: string, y: string) => y || x,
    default: () => '',
  },
};

export type CustomAgentState = typeof customAgentStateAnnotation.State;

// Define agent nodes
async function customNode(state: CustomAgentState) {
  // Your custom logic here
  const response = `Processing: ${state.customField}`;
  return {
    messages: [new HumanMessage(response)],
  };
}

// Build the graph
export function buildCustomAgentGraph() {
  const workflow = new StateGraph(customAgentStateAnnotation);

  workflow.addNode('custom_node', customNode);
  workflow.addEdge(START, 'custom_node');
  workflow.addEdge('custom_node', END);

  return workflow.compile();
}
```

### Step 2: Create a Use Case for Your Agent

```typescript
// src/modules/agent/core/application/usecases/run-custom-agent.usecase.ts
import { Injectable } from '@nestjs/common';
import { CustomAgentConfig } from '../../domain/types/agent.types';

@Injectable()
export class RunCustomAgentUseCase {
  constructor(private agentGraphService: CustomAgentGraphService) {}

  async execute(config: CustomAgentConfig) {
    // Orchestrate your agent here
    const graph = buildCustomAgentGraph();
    const result = await graph.invoke({
      messages: [],
      customField: config.customField,
    });

    return result;
  }
}
```

### Step 3: Register in the Module

```typescript
// src/modules/agent/agent.module.ts
import { RunCustomAgentUseCase } from './core/application/usecases/run-custom-agent.usecase';

@Module({
  providers: [
    // ... existing providers
    RunCustomAgentUseCase,
    CustomAgentGraphService,
  ],
})
export class AgentModule {}
```

### Step 4: Add Controller Endpoint

```typescript
// src/modules/agent/interface/rest/agent.controller.ts
@Post('/agents/custom')
async runCustomAgent(@Body() dto: RunCustomAgentDto) {
  const result = await this.runCustomAgentUseCase.execute({
    customField: dto.customField,
  });
  return this.agentPresenter.toDTO(result);
}
```

---

## Implementing Custom Tools

### Step 1: Define Your Tool

```typescript
// src/modules/agent/infrastructure/services/tools/custom.tool.ts
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';

export class CustomTool extends Tool {
  name = 'custom_operation';
  description = 'Performs a custom operation';

  schema = z.object({
    input: z.string().describe('Input for the operation'),
  });

  async _call(input: { input: string }): Promise<string> {
    // Your custom logic here
    const result = await performCustomOperation(input.input);
    return JSON.stringify(result);
  }
}

async function performCustomOperation(input: string): Promise<any> {
  // Implementation
  return { success: true, message: `Processed: ${input}` };
}
```

### Step 2: Register the Tool

```typescript
// src/modules/agent/infrastructure/services/tools/tool-registry.service.ts
export class ToolRegistryService {
  private tools: Map<string, Tool> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  private registerDefaultTools() {
    this.tools.set('custom_tool', new CustomTool());
    // Register other tools
  }

  getTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  getToolsByNames(names: string[]): Tool[] {
    return names
      .map((name) => this.tools.get(name))
      .filter((tool) => tool !== undefined) as Tool[];
  }
}
```

### Step 3: Use in Your Agent

```typescript
// In your agent graph
const tools = this.toolRegistry.getTools();
const llmWithTools = llm.bindTools(tools);

async function agentNode(state: AgentState) {
  const response = await llmWithTools.invoke(state.messages);
  return { messages: [response] };
}
```

---

## Switching Databases

### Step 1: Create a New Repository Implementation

```typescript
// src/modules/agent/infrastructure/repositories/postgres-agent.repository.ts
import { Injectable } from '@nestjs/common';
import { IAgentRepository } from '../../core/ports/repositories/agent.repository.interface';
import { Agent } from '../../core/domain/entities/agent.entity';
import { PrismaService } from '@shared/services/prisma.service';

@Injectable()
export class PostgresAgentRepository implements IAgentRepository {
  constructor(private prisma: PrismaService) {}

  async save(agent: Agent): Promise<void> {
    await this.prisma.agent.create({
      data: {
        id: agent.id.value,
        name: agent.name,
        // Map other fields
      },
    });
  }

  async findById(id: string): Promise<Agent | null> {
    const data = await this.prisma.agent.findUnique({
      where: { id },
    });

    if (!data) return null;

    return Agent.create({
      name: data.name,
      // Map other fields
    });
  }

  // Implement other interface methods
}
```

### Step 2: Update Module Configuration

```typescript
// src/modules/agent/agent.module.ts
const agentRepositoryProvider = {
  provide: 'IAgentRepository',
  useClass:
    process.env.DATABASE_TYPE === 'postgres'
      ? PostgresAgentRepository
      : InMemoryAgentRepository,
};

@Module({
  providers: [agentRepositoryProvider],
})
export class AgentModule {}
```

### Step 3: Run Migrations

Create migration files for your database schema:

```bash
# For PostgreSQL with TypeORM
npm run typeorm migration:generate -- -n CreateAgentTable

# For Prisma
npm run prisma migrate dev -- --name create_agent_table
```

---

## Adding LLM Providers

### Step 1: Implement the Service Interface

```typescript
// src/modules/agent/infrastructure/services/llm/anthropic-llm.service.ts
import { Injectable } from '@nestjs/common';
import { ILLMService } from '../../core/ports/services/llm.service.interface';
import { Anthropic } from '@anthropic-ai/sdk';

@Injectable()
export class AnthropicLLMService implements ILLMService {
  private client: Anthropic;

  constructor(configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: configService.get('ANTHROPIC_API_KEY'),
    });
  }

  async generateResponse(
    messages: Array<{ role: string; content: string }>,
    options?: LLMOptions,
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: options?.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options?.maxTokens || 2048,
      messages: messages as any,
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  async getAvailableModels(): Promise<string[]> {
    // Return available Anthropic models
    return [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
    ];
  }
}
```

### Step 2: Register in Module

```typescript
// src/modules/agent/agent.module.ts
const llmServiceProvider = {
  provide: 'ILLMService',
  useFactory: (config: ConfigService) => {
    const provider = config.get('LLM_PROVIDER');

    if (provider === 'anthropic') {
      return new AnthropicLLMService(config);
    }

    return new OpenAILLMService(config);
  },
  inject: [ConfigService],
};

@Module({
  providers: [llmServiceProvider],
})
export class AgentModule {}
```

### Step 3: Update Environment Configuration

```bash
# .env
LLM_PROVIDER=anthropic  # or openai, azure
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Custom Memory Backends

### Step 1: Implement Memory Service

```typescript
// src/modules/agent/infrastructure/services/memory/redis-memory.service.ts
import { Injectable } from '@nestjs/common';
import { IMemoryService } from '../../core/ports/services/memory.service.interface';
import { Redis } from 'ioredis';

@Injectable()
export class RedisMemoryService implements IMemoryService {
  private redis: Redis;

  constructor(configService: ConfigService) {
    this.redis = new Redis(configService.get('REDIS_URL'));
  }

  async saveMessage(sessionId: string, message: any): Promise<void> {
    const key = `session:${sessionId}:messages`;
    await this.redis.lpush(key, JSON.stringify(message));
    await this.redis.expire(key, 86400); // 24 hours
  }

  async getMessages(sessionId: string): Promise<any[]> {
    const key = `session:${sessionId}:messages`;
    const messages = await this.redis.lrange(key, 0, -1);
    return messages.map((msg) => JSON.parse(msg));
  }

  async clearMessages(sessionId: string): Promise<void> {
    const key = `session:${sessionId}:messages`;
    await this.redis.del(key);
  }
}
```

### Step 2: Register Provider

```typescript
// src/modules/agent/agent.module.ts
const memoryServiceProvider = {
  provide: 'IMemoryService',
  useClass:
    process.env.MEMORY_BACKEND === 'redis'
      ? RedisMemoryService
      : InMemoryMemoryService,
};
```

---

## Real-World Examples

### Example 1: E-commerce Product Search Agent

See `src/modules/agent/examples/ecommerce-product-agent.ts`

```typescript
// Features:
// - Search products in database
// - Filter by category, price, rating
// - Generate recommendations
// - Track user preferences
```

### Example 2: Customer Support Agent for Restaurants

See `src/modules/agent/examples/restaurant-support-agent.ts`

```typescript
// Features:
// - Check restaurant hours
// - Make reservations
// - Get menu recommendations
// - Handle complaints
// - Process refunds
```

### Example 3: Code Review Agent

See `src/modules/agent/examples/code-review-agent.ts`

```typescript
// Features:
// - Analyze code for issues
// - Suggest improvements
// - Check security vulnerabilities
// - Generate documentation
```

---

## Testing Your Customizations

### Unit Test Example

```typescript
// src/modules/agent/infrastructure/services/tools/custom.tool.spec.ts
describe('CustomTool', () => {
  let tool: CustomTool;

  beforeEach(() => {
    tool = new CustomTool();
  });

  it('should execute custom operation', async () => {
    const result = await tool._call({ input: 'test' });
    expect(JSON.parse(result)).toHaveProperty('success', true);
  });
});
```

### Integration Test Example

```typescript
describe('CustomAgent Integration', () => {
  it('should run custom agent successfully', async () => {
    const graph = buildCustomAgentGraph();
    const result = await graph.invoke({
      messages: [],
      customField: 'test',
    });

    expect(result.messages).toHaveLength(1);
  });
});
```

---

## Best Practices

1. **Keep Domain Layer Pure**: Don't add framework-specific code to domain entities
2. **Use Dependency Injection**: Always inject dependencies rather than creating them
3. **Test Your Tools**: Write tests for all custom tools before integration
4. **Document State**: Clearly document your agent state structure
5. **Error Handling**: Implement comprehensive error handling in all nodes
6. **Type Safety**: Use TypeScript strict mode throughout
7. **Environment Variables**: Use environment variables for all configuration
8. **Performance**: Monitor token usage and API costs

---

## Need Help?

- Check the `examples/` directory for reference implementations
- Review the domain layer for entity patterns
- See `src/shared/errors/` for error handling patterns
- Check `.env.example` for all available configuration options

For more details on LangGraph patterns, visit: https://langchain-ai.github.io/langgraph/
