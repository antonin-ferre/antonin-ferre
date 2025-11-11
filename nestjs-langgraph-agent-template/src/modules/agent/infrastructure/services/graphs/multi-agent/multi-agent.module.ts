import { Module, DynamicModule } from '@nestjs/common';
import { MultiAgentGraph } from './multi-agent.graph';

/**
 * MultiAgent Module
 * Provides the multi-agent supervisor graph for agent coordination
 * Import this module to enable multi-agent functionality
 */
@Module({})
export class MultiAgentModule {
  static register(): DynamicModule {
    return {
      module: MultiAgentModule,
      providers: [MultiAgentGraph],
      exports: [MultiAgentGraph],
    };
  }
}
