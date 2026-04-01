export interface EventEnvelope {
    eventId: string;
    eventType: string;
    version: number;
    producer: string;
    occurredAt: string;
    correlationId?: string;
}
export type EventContract<T extends object> = EventEnvelope & {
    data: T;
};
