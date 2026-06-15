#!/bin/bash
set -e

echo "🔧 Shop Management System - Sozlash"
echo "===================================="

# .env yaratish
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "✅ .env fayl yaratildi. Iltimos, tahrirlang:"
  echo "   nano .env"
fi

# Node modules
echo "📦 Paketlar o'rnatilmoqda..."
cd apps/api && npm install && cd ../..
cd apps/web && npm install && cd ../..
cd apps/bot && npm install && cd ../..
cd packages/database && npm install && cd ../..

echo ""
echo "✅ Sozlash tugadi!"
echo ""
echo "Keyingi qadamlar:"
echo "  1. .env faylni to'ldiring"
echo "  2. PostgreSQL ulaning va init.sql ni ishga tushiring:"
echo "     psql -U postgres -d shop_db -f packages/database/init.sql"
echo "  3. API ishga tushiring:"
echo "     cd apps/api && npm run dev"
echo "  4. Web ishga tushiring:"
echo "     cd apps/web && npm run dev"
echo "  5. Bot ishga tushiring:"
echo "     cd apps/bot && npm run dev"
