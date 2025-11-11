import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerService } from '@shared/logger/logger.service';
import { validateEnv } from '@shared/config/env';
import { AgentModule } from '@agent/agent.module';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
    }),
    // Feature modules
    AgentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global logger service
    {
      provide: 'LOGGER_SERVICE',
      useClass: LoggerService,
    },
  ],
})
export class AppModule {}
