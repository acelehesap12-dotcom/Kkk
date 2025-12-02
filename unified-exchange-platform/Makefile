# 👑 UNIFIED EXCHANGE PLATFORM - MASTER MAKEFILE
# One command to rule them all

.PHONY: all build up down logs clean

all: build up

build:
	@echo ">>> Building all microservices..."
	docker-compose build

up:
	@echo ">>> Starting Unified Exchange Platform..."
	docker-compose up -d

down:
	@echo ">>> Stopping platform..."
	docker-compose down

logs:
	docker-compose logs -f

clean:
	docker-compose down -v
	docker system prune -f

test-sandbox:
	@echo ">>> Testing Quant Sandbox Isolation..."
	docker-compose run --rm quant-sandbox

deploy-infra:
	@echo ">>> Deploying Infrastructure (Simulated)..."
	cd scripts && ./deploy-platform.sh
