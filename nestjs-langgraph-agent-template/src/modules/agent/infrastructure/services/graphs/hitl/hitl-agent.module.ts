import { Module, DynamicModule } from '@nestjs/common';
import { HITLAgentGraph } from './hitl-agent.graph';

/**
 * HITLAgent Module
 * Provides the Human-In-The-Loop agent graph with approval workflows
 * Import this module to enable HITL functionality
 */
@Module({})
export class HITLAgentModule {
  static register(): DynamicModule {
    return {
      module: HITLAgentModule,
      providers: [HITLAgentGraph],
      exports: [HITLAgentGraph],
    };
  }
}



