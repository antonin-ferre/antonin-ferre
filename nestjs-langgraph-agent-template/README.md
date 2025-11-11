# NestJS LangGraph Agent Template

A production-ready template for building AI agents using NestJS, LangGraph, and LangChain. Built with Clean Architecture principles and supporting all LangGraph features (state management, memory, RAG, multi-agent, HITL, streaming).

⚠️ **TEMPLATE STATUS**: This is a reference implementation and template. It uses in-memory repositories by design to demonstrate architectural patterns and best practices. For production use, you'll need to implement persistent storage (PostgreSQL, MongoDB, etc.), add authentication/authorization, configure proper monitoring, and handle production-level concerns. See [Production Checklist](#production-checklist) section below.

## Features

- **Clean Architecture**: Organized layers (domain, application, infrastructure, presentation)
- **LangGraph Integration**: State management, tools, streaming, memory
- **Multiple Agent Types**: General-purpose, specialized, multi-agent, HITL
- **Database Agnostic**: Abstracted repositories for easy database swapping
- **Type Safety**: Full TypeScript with strict mode
- **Dependency Injection**: NestJS module system with proper DI patterns
- **Environment Validation**: Zod-based env configuration
- **Testing Ready**: Unit tests and integration test utilities included

## Project Structure

```
src/
├── modules/agent/
│   ├── core/
│   │   ├── domain/          # Entities, value objects, errors
│   │   ├── application/     # Use cases
│   │   └── ports/           # Repository and service interfaces
│   ├── infrastructure/      # Implementations (LangGraph, repositories, services)
│   └── interface/           # Controllers, DTOs, presenters
├── shared/
│   ├── config/              # Environment configuration
│   ├── errors/              # Global error handling
│   └── logger/              # Logging service
└── types/                   # Global types
```

## Agent Types

### 1. General-Purpose Agent

Customer support chatbots with RAG capabilities.

- Tools: Search, FAQ retrieval, ticket creation
- Example: `src/modules/agent/examples/general-purpose.example.ts`

### 2. Specialized Agent

Domain-specific task automation (e.g., code generation).

- Tools: Generate, validate, format operations
- Example: `src/modules/agent/examples/specialized.example.ts`

### 3. Multi-Agent System

Multiple agents coordinating via supervisor pattern.

- Workers: Researcher, Writer, Editor
- Example: `src/modules/agent/examples/multi-agent.example.ts`

### 4. HITL Agent

Human-In-The-Loop with approval checkpoints.

- Breakpoints: Planning, review, execution
- Example: `src/modules/agent/examples/hitl.example.ts`

## LangGraph Features

### Basic Agent

- ReAct pattern with tools
- State management
- Iteration tracking
- Located: `src/modules/agent/infrastructure/services/langgraph/basic-agent.graph.ts`

### RAG Agent

- Document retrieval
- Relevance grading
- Query rewriting
- Located: `src/modules/agent/infrastructure/services/langgraph/rag-agent.graph.ts`

### Multi-Agent

- Supervisor routing
- Worker coordination
- Result aggregation
- Located: `src/modules/agent/infrastructure/services/langgraph/multi-agent.graph.ts`

### HITL Agent

- Planning nodes
- Human review checkpoints
- Execution with approval
- Located: `src/modules/agent/infrastructure/services/langgraph/hitl-agent.graph.ts`

### Streaming Support

- Server-Sent Events formatting
- Stream aggregation
- Event processing
- Located: `src/modules/agent/infrastructure/services/langgraph/streaming-support.ts`

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env

# 3. Update .env with your API keys
# Edit .env and add:
#   OPENAI_API_KEY=your_key
#   ANTHROPIC_API_KEY=your_key (optional)

# 4. Verify everything works
pnpm run test

# 5. Start development server
pnpm run start:dev

# 6. Test the API
curl http://localhost:3000/agents/health/ping
```

### Successful Start Output

```
[Nest] 12345   - 11/09/2024, 10:30:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345   - 11/09/2024, 10:30:00 AM     LOG [InstanceLoader] AgentModule dependencies initialized
[Nest] 12345   - 11/09/2024, 10:30:00 AM     LOG [RoutesResolver] AgentController {/agents}:
[Nest] 12345   - 11/09/2024, 10:30:01 AM     LOG [NestApplication] Nest application successfully started
```

## Setup

```bash
# Install dependencies
pnpm install

# Create .env from .env.example
cp .env.example .env

# Update with your API keys
# OPENAI_API_KEY=your_key
# ANTHROPIC_API_KEY=your_key
```

## Development

```bash
# Start development server
pnpm run start:dev

# Build
pnpm run build

# Run tests
pnpm run test

# Test coverage
pnpm run test:cov
```

## Environment Variables

Key configuration options in `.env`:

```
LLM_PROVIDER=openai          # LLM provider (openai, anthropic, azure)
LLM_MODEL=gpt-4              # Model name
OPENAI_API_KEY=...           # OpenAI API key
ANTHROPIC_API_KEY=...        # Anthropic API key
AGENT_MAX_ITERATIONS=10      # Max iterations per agent run
AGENT_TIMEOUT_MS=30000       # Timeout in milliseconds
ENABLE_STREAMING=true        # Enable streaming responses
ENABLE_MEMORY_PERSISTENCE=false  # Persist memory to database
MEMORY_BACKEND=in-memory     # Memory backend (in-memory, postgresql, mongodb)
```

## API Endpoints

### Create Agent

```
POST /agents
Content-Type: application/json

{
  "name": "Support Bot",
  "type": "general",
  "llmProvider": "openai",
  "llmModel": "gpt-4",
  "systemPrompt": "You are a helpful assistant..."
}
```

### Get Agent

```
GET /agents/:id
```

### Health Check

```
GET /agents/health/ping
```

## Repository Implementations

The template includes in-memory implementations:

- `InMemoryAgentRepository`: Agent configuration storage
- `InMemorySessionRepository`: Session management
- `InMemoryMemoryService`: Conversation memory

Replace with database implementations for production.

## Services

### LLM Service

- `OpenAILLMService`: OpenAI API integration
- Extensible for other providers

### Tool Registry

- Dynamic tool registration
- Tool execution coordination
- LLM-compatible tool conversion

### Memory Service

- Session-based memory management
- Memory trimming and summarization

## Testing

```bash
# Unit tests
pnpm run test

# Watch mode
pnpm run test:watch

# Coverage
pnpm run test:cov
```

Test files included:

- `agent.entity.spec.ts`: Domain entity tests
- `create-agent.usecase.spec.ts`: Use case tests
- `in-memory-agent.repository.spec.ts`: Repository tests
- `agent.controller.spec.ts`: Controller tests

## Customization

### Adding New Agent Type

1. Create new graph in `infrastructure/services/langgraph/`
2. Add agent config example in `examples/`
3. Register in `AgentModule`
4. Add controller endpoint if needed

### Switching Databases

1. Create new repository implementation
2. Update `AgentModule` provider binding
3. Implement `IAgentRepository` and `ISessionRepository`

### Adding LLM Provider

1. Create service implementing `ILLMService`
2. Update environment variables
3. Register in `AgentModule`

## Best Practices

- Keep domain layer free of framework dependencies
- Use ports (interfaces) for external service abstraction
- Implement comprehensive error handling
- Test business logic in domain layer
- Use streaming for long-running operations
- Implement proper HITL approval workflows
- Monitor agent iterations and timeouts

## Production Checklist

### 📊 Data Persistence

- [ ] Replace `InMemoryAgentRepository` with database implementation (PostgreSQL/MongoDB)
- [ ] Replace `InMemorySessionRepository` with persistent session storage
- [ ] Implement database migrations
- [ ] Set up connection pooling for database
- [ ] Implement LangGraph checkpointing for agent state persistence
- [ ] Configure backup strategy

### 🔐 Security

- [ ] Implement authentication (JWT/OAuth2)
- [ ] Add API key validation for agent operations
- [ ] Implement request rate limiting
- [ ] Add input validation and sanitization
- [ ] Configure CORS properly
- [ ] Use environment secrets management (AWS Secrets Manager, HashiCorp Vault)
- [ ] Add request signing for external API calls
- [ ] Implement API versioning

### 📈 Monitoring & Observability

- [ ] Set up structured logging (Winston, Pino)
- [ ] Implement distributed tracing (OpenTelemetry)
- [ ] Add application performance monitoring (APM)
- [ ] Configure error tracking (Sentry, DataDog)
- [ ] Set up metrics collection (Prometheus)
- [ ] Create dashboards for agent performance
- [ ] Add alerts for agent failures

### ⚙️ Agent Configuration

- [ ] Add agent execution timeouts
- [ ] Implement retry logic with exponential backoff
- [ ] Set up proper LLM rate limiting
- [ ] Configure token usage tracking
- [ ] Implement cost tracking per agent
- [ ] Add agent usage quotas

### 📝 Documentation

- [ ] Create API documentation (Swagger/OpenAPI)
- [ ] Document all custom tools
- [ ] Create deployment guide
- [ ] Document troubleshooting procedures
- [ ] Create runbooks for common issues

### 🚀 Deployment

- [ ] Containerize application (Docker)
- [ ] Set up CI/CD pipeline (GitHub Actions, GitLab CI)
- [ ] Configure Kubernetes deployment (if needed)
- [ ] Set up health checks and readiness probes
- [ ] Implement graceful shutdown
- [ ] Configure horizontal scaling

### 🧪 Testing

- [ ] Expand test coverage to >80%
- [ ] Add integration tests with real LLMs
- [ ] Implement end-to-end tests
- [ ] Load test agent endpoints
- [ ] Security testing and penetration tests

### 📋 Compliance

- [ ] Implement audit logging
- [ ] Add data privacy compliance (GDPR, CCPA)
- [ ] Set up data retention policies
- [ ] Implement encryption at rest
- [ ] Document compliance requirements

## Deployment Examples

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
EXPOSE 3000
CMD ["pnpm", "run", "start:prod"]
```

### Docker Compose with PostgreSQL

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/agents
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: agents
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## License

MIT
