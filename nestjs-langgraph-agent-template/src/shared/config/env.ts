import { z } from 'zod';

/**
 * Zod schema for environment variables
 * Provides type-safe validation and inference
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().positive().default(3000),

  // Database Configuration
  DATABASE_URL: z.string().optional(),
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.coerce.number().positive().default(5432),
  DATABASE_USERNAME: z.string().default('postgres'),
  DATABASE_PASSWORD: z.string().default('postgres'),
  DATABASE_NAME: z.string().default('agent_db'),

  // LLM Configuration
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().default('gpt-4'),
  LLM_PROVIDER: z.enum(['openai', 'anthropic', 'azure']).default('openai'),

  // Agent Configuration
  AGENT_MAX_ITERATIONS: z.coerce.number().positive().default(10),
  AGENT_TIMEOUT_MS: z.coerce.number().positive().default(30000),
  ENABLE_STREAMING: z
    .string()
    .transform((val) => val === 'true' || val === '1')
    .pipe(z.boolean())
    .default(true),

  // Memory & Checkpointing
  ENABLE_MEMORY_PERSISTENCE: z
    .string()
    .transform((val) => val === 'true' || val === '1')
    .pipe(z.boolean())
    .default(false),
  MEMORY_BACKEND: z
    .enum(['in-memory', 'postgresql', 'mongodb'])
    .default('in-memory'),
});

/**
 * Inferred TypeScript type from Zod schema
 * Ensures type safety across the application
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates and returns environment configuration
 * Throws error if validation fails
 */
export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.issues
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new Error(`Environment validation failed: ${errors}`);
  }

  return result.data;
}

/**
 * Parse and validate environment variables
 * Call this in app initialization
 */
export const parsedEnv = validateEnv(process.env);
