#!/bin/bash
set -e

echo "🚀 Shop Management System - Deploy"
echo "=================================="

# .env tekshirish
if [ ! -f ".env" ]; then
  echo "❌ .env fayl topilmadi! .env.example dan nusxa oling:"
  echo "   cp .env.example .env"
  exit 1
fi

echo "📦 Docker image lar qurilmoqda..."
docker-compose -f infrastructure/docker/docker-compose.yml build

echo "🛑 Eski containerlar to'xtatilmoqda..."
docker-compose -f infrastructure/docker/docker-compose.yml down

echo "▶️ Yangi containerlar ishga tushirilmoqda..."
docker-compose -f infrastructure/docker/docker-compose.yml up -d

echo "⏳ Ma'lumotlar bazasi tayyor bo'lishi kutilmoqda..."
sleep 10

echo "✅ Deploy muvaffaqiyatli tugadi!"
echo ""
echo "Xizmatlar:"
echo "  - API: http://localhost:5000"
echo "  - Web: http://localhost:80"
echo "  - Health: http://localhost:5000/health"
