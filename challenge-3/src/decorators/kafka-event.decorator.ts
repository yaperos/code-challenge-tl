export const KAFKA_EVENT_METADATA = Symbol('KAFKA_EVENT_METADATA');

export function KafkaEvent(topic: string): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(
      KAFKA_EVENT_METADATA,
      { topic },
      descriptor.value as object,
    );
    return descriptor;
  };
}
