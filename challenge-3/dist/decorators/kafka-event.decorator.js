"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KAFKA_EVENT_METADATA = void 0;
exports.KafkaEvent = KafkaEvent;
exports.KAFKA_EVENT_METADATA = Symbol('KAFKA_EVENT_METADATA');
function KafkaEvent(topic) {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata(exports.KAFKA_EVENT_METADATA, { topic }, descriptor.value);
        return descriptor;
    };
}
//# sourceMappingURL=kafka-event.decorator.js.map