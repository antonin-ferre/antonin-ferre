import { Module, DynamicModule } from '@nestjs/common';
import { RAGAgentGraph } from './rag-agent.graph';

/**
 * RAGAgent Module
 * Provides the Retrieval-Augmented Generation agent graph
 * Import this module to enable RAG functionality
 */
@Module({})
export class RAGAgentModule {
  static register(): DynamicModule {
    return {
      module: RAGAgentModule,
      providers: [RAGAgentGraph],
      exports: [RAGAgentGraph],
    };
  }
}
