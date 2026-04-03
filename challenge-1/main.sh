#!/bin/bash

# Script para automatizar el levantamiento del ecosistema Challenge 1

echo "--------------------------------------------------------"
echo "Iniciando proceso de contenedorización - Challenge 1"
echo "--------------------------------------------------------"

# 1. Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker no parece estar corriendo. Por favor, inícialo primero."
  exit 1
fi

# 2. Limpiar imágenes y contenedores antiguos
echo "Limpiando recursos previos..."
docker-compose down --remove-orphans

# 3. Construir y levantar el stack
echo "Construyendo imágenes y levantando el stack completo..."
# Usamos --build para forzar la reconstrucción de las apps NestJS
docker-compose up --build -d

echo "--------------------------------------------------------"
echo "Stack levantado en modo background."
echo "--------------------------------------------------------"
echo "Estado de los contenedores:"
docker-compose ps

echo ""
echo "Puedes ver los logs de cualquier servicio con:"
echo "   docker logs -f payment_api"
echo "   docker logs -f payment_relay"
echo "   docker logs -f payment_consumers"
echo ""
echo "API escuchando en: http://localhost:3001"
echo "--------------------------------------------------------"
