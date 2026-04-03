# ADR-001: @yape/kafka-module como NestJS Dynamic Module

## Status
Accepted

## Context
Diversos squads en Yape (e.g. Payments, Notifications, Fraud) necesitan publicar y consumir eventos desde Kafka con contratos tipados, ruteo DLT (Dead Letter Topic) automático y convenciones de nombres homogéneas. 

Sin una librería compartida estricta:
1. Cada squad implementa su propio envoltorio sobre `kafkajs`, lo que genera inconsistencias al fallar mensajes (algunos lo ignoran, otros mueren silenciosamente).
2. Los productores de eventos envían JSON en esquemas variables, provocando excepciones inesperadas (crashes en runtime) a nivel de deserialización cuando cambian atributos sin avisar.
3. Se pierden capacidades analíticas porque los *consumer groups* no siguen naming conventions establecidas.

## Decision
Implementar la librería `@yape/kafka-module` como un **NestJS Dynamic Module** que se importa localmente en la aplicación de cada squad utilizando `KafkaModule.forFeature({...})`. Las abstracciones inyectan decoradores transparentes (`@KafkaEvent`) en reemplazo de métodos imperativos y exponen `EventContract<T>` exclusivamente.

## Alternatives Considered

| Alternativa | Razón de rechazo |
|---|---|
| **Clase singleton u objeto estático global exportado** | No integra con la Inyección de Dependencias (DI) de NestJS. Los squads no pueden "mockearla" nativamente (`jest.spyOn`) dentro de TestingModules, impidiendo Unit Tests limpios. |
| **Librería Agnóstica pura de Node/Express (ej. Wrapper TS plano)** | Exige que el programador importe, instancie parámetros y amarre su ciclo de vida manualmente. Impide aprovechar el DiscoveryModule de NestJS para escanear controladores decorados en bootstrap. |
| **Implementar Confluent Schema Registry (Protobuf/Avro) puro** | Produce gran latencia y overhead de infraestructura técnica para un MVP inicial. Fue descartada en favor de *TypeScript Compile Checks* por ser instantáneo y suficiente para Squads dentro del mismo Monorepo, aunque se planteará como segunda etapa. |

## Schema Evolution Strategy
En la V1 del módulo se adopta la política de **Additive-only fields**. Los Event Contracts solo pueden agregar campos opcionales; de lo contrario, TypeScript alertará un fallo en Compile-Time que impide el `git push`. Si se requiere eliminar o transformar propiedades (Breaking Changes), se adoptará una estrategia de **Topic Versioning** explícito (ej. `payment.created.v2` en vez de `v1`), forzando un período de coexistencia de la V1 y V2 por un mínimo de dos Sprints para dar tiempo a los downstream consumers de migrar sin caída del servicio.

## What would be added with 2 more weeks
1. Integración completa con **Verdaccio local / GitHub Packages registry** con control estricto SemVer y changelogs automáticos. 
2. Incorporación de **Confluent Schema Registry** validando cargas pesadas en runtime para atrapar payloads originados fuera de TypeScript (Microservicios en Go/Java).
3. Monitoreo unificado Prometheus inyectando un iterador sobre métricas de `producer.send` midiendo tasas de desbordamiento DLT.
4. Generación automática de tipos Typescript (Typing Code-Gen) desde un contrato YAML o un repositorio central de esquemas en lugar de que cada Squad lo tipee.
