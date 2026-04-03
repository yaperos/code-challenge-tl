# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copiar archivos de definición de dependencias
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Instalar todas las dependencias (incluyendo devDependencies para compilar)
RUN npm install

# Copiar el código fuente y las librerías
COPY apps/ ./apps/
COPY libs/ ./libs/

# Compilar las tres aplicaciones
RUN npm run build api
RUN npm run build relay
RUN npm run build consumers

# Stage 2: Production
FROM node:20-alpine

WORKDIR /usr/src/app

# Copiar package.json y lock para instalar solo dependencias de producción
COPY package*.json ./
RUN npm install --omit=dev

# Copiar los artefactos compilados desde la etapa de build
COPY --from=build /usr/src/app/dist ./dist

# Copiar las plantillas de correo necesarias para NotifyConsumer
COPY templates ./templates

# Exponer el puerto de la API (por defecto 3001)
EXPOSE 3001

# El comando de inicio se sobreescribirá en docker-compose para cada servicio
CMD ["node", "dist/apps/api/main"]
