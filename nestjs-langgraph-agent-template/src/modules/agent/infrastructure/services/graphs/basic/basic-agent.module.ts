import { Module, DynamicModule } from '@nestjs/common';
import { BasicAgentGraph } from './basic-agent.graph';

/**
 * BasicAgent Module
 * Provides the ReAct agent graph with tools
 * Import this module to enable basic agent functionality
 */
@Module({})
export class BasicAgentModule {
  static register(): DynamicModule {
    return {
      module: BasicAgentModule,
      providers: [BasicAgentGraph],
      exports: [BasicAgentGraph],
    };
  }
}
