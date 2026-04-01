export interface EventEnvelope {
  eventId: string;
  eventType: string;
  version: number;
  producer: string;
  occurredAt: string; // ISO 8601
  correlationId?: string;
}

// El generic T fuerza que el payload coincida en tiempo de compilación
export type EventContract<T extends object> = EventEnvelope & {
  data: T;
};
