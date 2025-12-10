#!/bin/bash
echo "🚀 Unified Exchange Platform Başlatılıyor..."
echo "📂 Dizin: unified-exchange-platform"

cd unified-exchange-platform

# Check if make is installed
if ! command -v make &> /dev/null; then
    echo "⚠️ 'make' komutu bulunamadı. Doğrudan docker-compose kullanılıyor..."
    docker-compose up --build -d
else
    echo "🔧 'make' kullanılıyor..."
    make all
fi

echo "✅ Sistem başlatıldı!"
echo "🌍 Frontend: http://localhost:3000"
echo "🔌 API Gateway: http://localhost:8080"
echo "📊 Grafana: http://localhost:3001"
