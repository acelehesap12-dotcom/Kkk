#!/bin/bash
# ╔════════════════════════════════════════════════════════════════╗
# ║           👑 K99 EXCHANGE - AUTO DEPLOY SCRIPT                 ║
# ╚════════════════════════════════════════════════════════════════╝
#
# Kullanım: ./deploy.sh [options]
# Options:
#   --frontend    Sadece frontend deploy
#   --backend     Sadece backend deploy
#   --all         Hepsini deploy (varsayılan)
#   --check       Health check yap

set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${PURPLE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           👑 K99 EXCHANGE - AUTO DEPLOY                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Config
SITE_URL="https://k99-exchange.xyz"
API_URL="https://api.k99-exchange.xyz"
GATEWAY_URL="https://gateway.k99-exchange.xyz"
MARKET_URL="https://market.k99-exchange.xyz"

# Check command
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 bulunamadı! Lütfen yükleyin.${NC}"
        exit 1
    fi
}

# Health check function
health_check() {
    echo -e "\n${CYAN}🏥 Health Check Başlatılıyor...${NC}\n"
    
    # Frontend
    echo -n "🌐 Frontend ($SITE_URL): "
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Online${NC}"
    else
        echo -e "${RED}❌ HTTP $HTTP_CODE${NC}"
    fi
    
    # API
    echo -n "🔧 User API ($API_URL): "
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Healthy${NC}"
    else
        echo -e "${YELLOW}⚠️ HTTP $HTTP_CODE (henüz deploy edilmemiş olabilir)${NC}"
    fi
    
    # Gateway
    echo -n "🚪 Order Gateway ($GATEWAY_URL): "
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$GATEWAY_URL/health" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Healthy${NC}"
    else
        echo -e "${YELLOW}⚠️ HTTP $HTTP_CODE (henüz deploy edilmemiş olabilir)${NC}"
    fi
    
    # Market Data
    echo -n "📊 Market Data ($MARKET_URL): "
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$MARKET_URL/health" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Healthy${NC}"
    else
        echo -e "${YELLOW}⚠️ HTTP $HTTP_CODE (henüz deploy edilmemiş olabilir)${NC}"
    fi
    
    echo ""
}

# Git push function
git_push() {
    echo -e "\n${BLUE}📤 Git Push...${NC}"
    
    # Check for changes
    if [[ -z $(git status --porcelain) ]]; then
        echo -e "${YELLOW}ℹ️ Commit edilecek değişiklik yok${NC}"
    else
        git add .
        git commit -m "chore: Auto-deploy $(date '+%Y-%m-%d %H:%M:%S')" || true
    fi
    
    git push origin main
    echo -e "${GREEN}✅ Push başarılı!${NC}"
}

# Deploy frontend
deploy_frontend() {
    echo -e "\n${BLUE}🌐 Frontend Deploy (GitHub Pages)...${NC}"
    
    cd unified-exchange-platform/frontend
    
    # Install deps
    echo "📦 Bağımlılıklar yükleniyor..."
    npm install
    
    # Build
    echo "🔨 Building..."
    npm run build
    
    cd ../..
    
    echo -e "${GREEN}✅ Frontend build tamamlandı! GitHub Actions deploy edecek.${NC}"
}

# Deploy backend (Render)
deploy_backend() {
    echo -e "\n${BLUE}🔧 Backend Deploy (Render.com)...${NC}"
    
    if [ -z "$RENDER_DEPLOY_HOOK_URL" ]; then
        echo -e "${YELLOW}ℹ️ RENDER_DEPLOY_HOOK_URL tanımlanmamış.${NC}"
        echo -e "${CYAN}Render.com dashboard'dan deploy hook oluşturun:${NC}"
        echo "  1. render.com → Services → Settings → Deploy Hook"
        echo "  2. Export RENDER_DEPLOY_HOOK_URL=<hook_url>"
        echo ""
        echo -e "${CYAN}Alternatif: render.yaml ile Blueprint deploy:${NC}"
        echo "  1. render.com → Blueprints → New Blueprint Instance"
        echo "  2. GitHub repo seçin ve render.yaml otomatik algılanacak"
    else
        echo "🔔 Render deploy hook tetikleniyor..."
        curl -X POST "$RENDER_DEPLOY_HOOK_URL"
        echo -e "\n${GREEN}✅ Backend deploy tetiklendi!${NC}"
    fi
}

# Initialize database
init_database() {
    echo -e "\n${BLUE}🗄️ Database Initialization...${NC}"
    
    cd unified-exchange-platform/user-service
    npm install
    node -e "
    const { initializeDatabase } = require('../shared/database');
    initializeDatabase()
        .then(() => console.log('✅ Database initialized'))
        .catch(err => console.error('❌ Error:', err))
        .finally(() => process.exit());
    "
    cd ../..
}

# Main
case "${1:-all}" in
    --check)
        health_check
        ;;
    --frontend)
        check_command npm
        deploy_frontend
        git_push
        ;;
    --backend)
        deploy_backend
        ;;
    --init-db)
        init_database
        ;;
    --all|*)
        check_command npm
        check_command git
        check_command curl
        
        echo -e "${CYAN}🚀 Full Deploy Başlatılıyor...${NC}"
        
        git_push
        deploy_frontend
        deploy_backend
        
        echo -e "\n${PURPLE}════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}✅ Deploy tamamlandı!${NC}"
        echo -e "${PURPLE}════════════════════════════════════════════════════════${NC}"
        
        echo -e "\n${CYAN}60 saniye sonra health check yapılacak...${NC}"
        sleep 60
        health_check
        ;;
esac

echo -e "\n${PURPLE}👑 K99 Exchange - To the Moon! 🚀${NC}\n"
