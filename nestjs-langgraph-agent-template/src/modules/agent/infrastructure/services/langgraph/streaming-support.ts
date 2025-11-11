/**
 * Streaming Support Utilities
 * Handles streaming responses for real-time agent output
 */

export interface StreamEvent {
  type: 'start' | 'node_update' | 'data_update' | 'error' | 'end';
  timestamp: string;
  data?: unknown;
  nodeId?: string;
  error?: string;
}

/**
 * Convert graph stream to Server-Sent Events format
 */
export async function* streamGraphEvents(
  graphStream: AsyncIterable<unknown>,
): AsyncGenerator<StreamEvent> {
  try {
    yield {
      type: 'start',
      timestamp: new Date().toISOString(),
      data: { message: 'Stream started' },
    };

    let eventCount = 0;

    for await (const event of graphStream) {
      eventCount++;

      // Extract node and data information
      const eventRecord = event as Record<string, unknown> | null;
      const keys = Object.keys(eventRecord ?? {});

      for (const nodeId of keys) {
        const nodeData = eventRecord?.[nodeId];

        yield {
          type: 'node_update',
          timestamp: new Date().toISOString(),
          nodeId,
          data: nodeData,
        };
      }
    }

    yield {
      type: 'end',
      timestamp: new Date().toISOString(),
      data: { eventsProcessed: eventCount },
    };
  } catch (error) {
    yield {
      type: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Convert stream events to SSE format string
 */
export function formatSSE(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/**
 * Creates a ReadableStream from graph execution
 */
export function createSSEStream(graphStream: AsyncIterable<unknown>) {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of streamGraphEvents(graphStream)) {
          controller.enqueue(formatSSE(event));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * Process streaming chunks and aggregate results
 */
export class StreamAggregator {
  private chunks: StreamEvent[] = [];
  private errors: StreamEvent[] = [];
  private startTime?: string;
  private endTime?: string;

  async aggregate(
    stream: AsyncIterable<StreamEvent>,
  ): Promise<StreamAggregateResult> {
    for await (const event of stream) {
      if (event.type === 'start') {
        this.startTime = event.timestamp;
      } else if (event.type === 'end') {
        this.endTime = event.timestamp;
      } else if (event.type === 'error') {
        this.errors.push(event);
      } else {
        this.chunks.push(event);
      }
    }

    return this.getResult();
  }

  getResult(): StreamAggregateResult {
    const duration = this.calculateDuration();

    return {
      totalEvents: this.chunks.length,
      errorCount: this.errors.length,
      hasErrors: this.errors.length > 0,
      duration,
      events: this.chunks,
      errors: this.errors,
      startTime: this.startTime,
      endTime: this.endTime,
    };
  }

  private calculateDuration(): number {
    if (!this.startTime || !this.endTime) return 0;
    return (
      new Date(this.endTime).getTime() - new Date(this.startTime).getTime()
    );
  }
}

export interface StreamAggregateResult {
  totalEvents: number;
  errorCount: number;
  hasErrors: boolean;
  duration: number;
  events: StreamEvent[];
  errors: StreamEvent[];
  startTime?: string;
  endTime?: string;
}
