# 👑 UNIFIED EXCHANGE PLATFORM - MASTER MAKEFILE
# One command to rule them all

.PHONY: all build up down logs clean dev prod deploy health init-db

# ============================================
# DEVELOPMENT
# ============================================

all: build up

dev:
	@echo ">>> Starting Development Environment..."
	docker-compose up -d
	@echo "✅ Dev environment ready!"
	@echo "   Frontend: http://localhost:3001"
	@echo "   API: http://localhost:3000"
	@echo "   Gateway: http://localhost:8080"

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

# ============================================
# PRODUCTION
# ============================================

prod:
	@echo ">>> Starting Production Environment..."
	docker-compose -f docker-compose.prod.yml up -d --build
	@echo "✅ Production environment ready!"

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

# ============================================
# DEPLOYMENT
# ============================================

deploy:
	@echo ">>> Full Deployment..."
	cd .. && ./deploy.sh --all

deploy-frontend:
	cd .. && ./deploy.sh --frontend

deploy-backend:
	cd .. && ./deploy.sh --backend

# ============================================
# DATABASE
# ============================================

init-db:
	@echo ">>> Initializing Database..."
	cd user-service && npm install && node -e "require('../shared/database').initializeDatabase().then(() => process.exit())"

# ============================================
# HEALTH CHECK
# ============================================

health:
	@echo ">>> Running Health Checks..."
	cd .. && ./deploy.sh --check

# ============================================
# TESTING
# ============================================

test-sandbox:
	@echo ">>> Testing Quant Sandbox Isolation..."
	docker-compose run --rm quant-sandbox

test-api:
	@echo ">>> Testing API Endpoints..."
	curl -s http://localhost:3001/health | jq .
	curl -s http://localhost:8080/health | jq .

# ============================================
# INFRASTRUCTURE
# ============================================

deploy-infra:
	@echo ">>> Deploying Infrastructure (Simulated)..."
	cd scripts && ./deploy-platform.sh

