# Challenge 1 — Payment Settlement Pipeline

## Arquitectura

La solución implementa un **Payment Settlement Pipeline** basado en arquitectura guiada por eventos (EDA) utilizando NestJS, Kafka y PostgreSQL. 

La arquitectura resuelve específicamente el requerimiento crítico de no emitir mensajes al broker (Kafka) dentro de transacciones de base de datos distribuidas. La solución adopta el **Transactional Outbox Pattern**:

1. **`apps/api` (Payment API)**: Se ejecuta la creación del pago y la escritura en la tabla de Outbox de eventos (`outbox_events`). Ambos registros se guardan utilizando la misma estructura de transacción a nivel de Base de datos (vía `QueryRunner`), otorgando garantías de integridad relacional ACID. El broker Kafka **no** interviene en esta ejecución.
2. **`apps/relay` (Outbox Relay Process)**: Un proceso (Worker) asíncrono configurado con `@Cron` escanea la tabla `outbox_events` cada X segundos capturando los eventos marcados como `PENDING`. Estos son publicados en Kafka (`payment.created.v1`) y el registro cambia a estado `SENT`.
3. **`apps/consumers` (Consumers & Saga)**:
    - Escuchan los eventos en Kafka.
    - Se aseguran de aplicar el patrón **Idempotent Consumer**, basándose en una clave compuesta `eventId` y `consumerType` dentro de una tabla compartida en Base de datos (`processed_events`). Esto otorga manejo de reintentos e idempotencia (*at-least-once guarantee*).
    - Un coordinador local (*Saga Consumer*) escucha eventos intermedios (ej. `payment.fraud.approved.v1` y `payment.ledger.written.v1`) para alterar de forma asíncrona la consistencia final (*eventual consistency*) del pago a `SETTLED`.

## Tech Stack
- **Framework:** NestJS
- **Microservicios/Messaging:** Nativos NestJS Microservices, Kafka
- **Base de Datos:** PostgreSQL
- **ORM:** TypeORM

---

## Cómo compilar y ejecutar

1. **Levantar Infraestructura Base** (Kafka, Zookeeper, PostgreSQL)  
```bash
docker-compose up -d
```

2. **Instalar dependencias**  
Asegúrate de tener Node.js instalado (v18+) y ubicado en la carpeta del challenge.
```bash
npm install
```

3. **Ejecutar módulos por separado (en diferentes terminales preferentemente)**
- API y Creación Outbox: `npm run start api`
- Relay (Cron publicador a Kafka): `npm run start relay`
- Consumidores Kafka: `npm run start consumers`

---

## Arquitecturas y Decisiones (ADR)

### ADR 1: The Transactional Outbox vs Two-Phase Commit 
- **Decisión:** Implementar Transactional Outbox pattern.
- **Razón:** El uso de 2PC o llamar a `kafkaClient.emit` dentro de una transacción genera pérdida de datos cuando el bloque local es exitoso pero el mensaje al Broker fracasa. Guardar una copia serializada del payload como `OutboxEvent` en PostgreSQL nos permite delegar a un *Poller Relay* la publicación, desacoplándonos de la disponibilidad instantánea de Kafka.

### ADR 2: Monorepo NestJS vs Repositorios Múltiples
- **Decisión:** NestJS Standard Monorepo (`apps/api`, `apps/relay`, `apps/consumers`).
- **Razón:** Al tratarse de un challenge conceptual, y con la estricta idea de no acoplar los consumer / relay en procesos `setInterval()` internos de la API, el monorepo nos brinda separación de subprocesos y puertos, además de permitir exportar las entidades Base de datos (`Payment`, `OutboxEvent`) y los DTOs en una única librería `libs/shared` consolidada, sin duplicidad de esfuerzo.

### ADR 3: Coreografía del Estado Final (Eventual Consistency)
- **Decisión:** Coreografiar el estado de los pagos desde un tercer oyente `SagaConsumer`.
- **Razón:** En lugar de hacer que Fraud o Ledger modifiquen el `PaymentTable` diréctamente (creando cuellos de acceso a tabla central), enviamos una repuesta Kafka `payment.fraud.approved` que un saga local evalúa. Esto documenta con claridad la garantía *eventual* donde la API devuelve el Payload intacto con semántica PENDING hasta la convergencia final.

### Requerimientos / Limitaciones Conocidas / Qué Incluir con más tiempo
- Por motivos prácticos, todo el Monorepo asume una conexión genérica a la BD. En producción, el Relay y los Consumers utilizarían credenciales restrictivas.
- Para Namespace País (opcional check): No se implementó un enrutamiento en sub-Kafka. De implementarlo, sería mediante `topic: pe.payments.payment...` inyectando dependencias configurables bajo módulo por entorno. 
- Dead Letter Queue (`DLT`) y Retry Policies: El relay reintenta sin fin. Si los consumidores fallan (Simulado con `amount > 1000000`), el `FraudConsumer` invoca `sendToDlt` y deriva al subtopic `.dlt`, a su vez enviando `payment.failed.v1` donde la Saga finalmente declara status `FAILED` en la tabla para reflejarse vía API `GET /payments/:id`.
