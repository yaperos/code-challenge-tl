# Challenge 3: Shared Platform Library 👉 `@yape/kafka-module`

Bienvenido a la demostración de la librería dinámica genérica construida en NestJS para la segregación y aislamiento de lógica Kafka de las escuadras de Producto.  

Este desafío cumple la premisa de encapsular las conexiones, habilitar **DLT Automático sin configuración en el Squat** y, crucialmente, obligar el acoplamiento a tipos con **EventContract<T>** validado puramente en compilación (`strict: true`). Hemos documentado la decisión clave de usar DynamicModules de NestJS en la carpeta *adr*.

---

## 🛠 Instalación y Configuración

Dado que el reto exige el proyecto en una nueva carpeta independiente, simularemos su uso internamente:  
El código base de la librería vive en `src/` (y sus subcarpetas). El archivo de la app simulada *Squad Payments* que importa la librería está en `src/app.module.ts` y se lanza con Nest.

```bash
# 1. Ingresa la carpeta
cd challenge-3

# 2. Instala dependencias (si no lo hiciste)
npm install

# 3. Necesitarás Kafka corriendo en localhost:9092
# Usa el mismo contenedor de Infraestructura del Challenge 1 (docker-compose up -d)

# 4. Inicia la aplicación (Squad que consume tu módulo)
npm run start
```

---

## 🧐 Cómo Probar y Validar cada Escenario Exigido

La librería inyecta `KafkaTypedProducer` que previene payloads inválidos en su invocación de *Publish*. 

### A) Validar Compilación Estricta de EventContract<T>
Los squads **NO** pueden compilar el proyecto ni envíar mensajes a Kafka si los datos no coinciden estrictamente con las Interfaces. En vez de explotar en ejecución, atraparemos el error tipográfico previniendo builds subidos a Master.

**Paso 1:** Abre el archivo `src/app.controller.ts`.  
**Paso 2:** Localiza la línea 37 en la petición del body de Prueba.  
```typescript
currency: 'PEN', // Si cambias esto a 'EUR', Fallará en tiempo de compilación Typescript
```
**Paso 3:** Cambia `'PEN'` por una moneda que no figure (e.g. `'BRL'`) o borra una propiedad requerida de la Interfaz *PaymentCreatedPayload*.   
**Paso 4:** En tu terminal escribe: `npm run build` o `npx tsc`. 
¡El compilador TypeScript rechaza tu push! (Requisito 4 del Challenge validado).  

### B) Validar el Orquestador y Discovery (`@KafkaEvent()`)
La app de pruebas suscribe indirectamente usando el decorador creado `@KafkaEvent()` dentro del `app.controller.ts` (línea 46). Al disparar el evento usando un POST, observaremos instantáneamente el log del Subscriber interceptándolo.

Para iniciar un flujo positivo, corre el entorno en una terminal y dispara la URL:
```bash
curl -X POST http://localhost:3000/test-publish \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'
```
**Resultado en los logs de Nestjs:**
```bash
[KafkaTypedProducer] Published message to payment.created.v1 ...
[KafkaConsumerExplorer] Mapped {payment.created.v1} event to AppController.handlePaymentCreated() ...
[AppController] Received Kafka Event in Squad Consumer: {"paymentId":"PAY-123456","amount":100,"currency":"PEN","fromCountry":"PE"}
```

### C) Validar el DLT Automático (Configurado a las 2 reintentos)
La librería inyecta silenciosamente un `KafkaDltHandler` global al Squad. Si algún microservicio suelta una excepción irrecuperable un número de veces que excede `maxRetries`, la librería atrapa ese evento fallido y lo deriva al sub-tópico `{topic}.dlt` para no desechar el Request de Cliente.

Dispara el POST con una cantidad altísima (el código en Controller lanzará throw explícito emulando un Crash):
```bash
curl -X POST http://localhost:3000/test-publish \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000}'
```
Observarás en los Logs cómo reintenta de forma consecutiva la excepción (Intentos 1, 2 y 3).  
**Resultado:**  Al rebasar el límite, publicará en el DLT Topic:
```bash
[KafkaConsumerExplorer] Error processing message on payment.created.v1 (Attempt 1/2)...
[KafkaConsumerExplorer] Error processing message on payment.created.v1 (Attempt 2/2)...
[KafkaConsumerExplorer] Max retries exceeded for topic payment.created.v1. Routing to DLT.
[KafkaDltHandler] Routing message to DLT topic: payment.created.v1.dlt ...
```
¡El squad NUNCA necesitó tocar la configuración de DLT!

---

## 🏛 Registro de Decisiones de Arquitectura (MADR)
Se encuentra alojado en forma de reporte en formato **MADR** en el folder local: `./adr/001-kafka-module-dynamic.md`. Explica en detalle por qué NestJS Dynamic Modules frente a clases comunes y alternativas discutidas (Schema Registries vs TypeScript Code-Checking).
