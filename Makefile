# Makefile for Docker Compose
# Usage:
#   make up      → build & start containers (in background)
#   make build   → rebuild images
#   make logs    → tail logs
#   make down    → stop & remove containers
#   make restart → restart services

COMPOSE = docker compose
SERVICE = app   # change if your main service has a different name

up-dev:
	$(COMPOSE) -f docker-compose.dev.yml up --build

down-dev:
	$(COMPOSE) -f docker-compose.dev.yml down

