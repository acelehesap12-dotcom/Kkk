#!/bin/bash
# 👑 SYSTEM HEALTHCHECK & VALIDATION SCRIPT

echo ">>> 🔍 Starting System Health Check..."

# 1. Check Docker Services
echo ">>> Checking Container Status..."
if docker-compose ps | grep "Exit"; then
    echo "❌ Some containers have crashed!"
    docker-compose ps
    exit 1
else
    echo "✅ All Containers Running"
fi

# 2. Check Ports
check_port() {
    nc -z localhost $1
    if [ $? -eq 0 ]; then
        echo "✅ Service on port $1 is reachable ($2)"
    else
        echo "❌ Service on port $1 is DOWN ($2)"
    fi
}

check_port 3000 "User Service"
check_port 3001 "Frontend"
check_port 8080 "Order Gateway"
check_port 5432 "TimescaleDB"
check_port 5433 "ManagementDB"
check_port 9092 "Kafka"

# 3. Check Endpoints
echo ">>> Testing API Endpoints..."

# User Service Health
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/auth/login)
if [ "$HTTP_CODE" == "400" ] || [ "$HTTP_CODE" == "200" ]; then
    echo "✅ User Service API is responsive"
else
    echo "❌ User Service API failed (Code: $HTTP_CODE)"
fi

# Frontend Health
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ Frontend is serving content"
else
    echo "❌ Frontend failed (Code: $HTTP_CODE)"
fi

echo ">>> 🚀 System Validation Complete."
