# 🏪 Shop Management System

Kichik va o'rta bizneslar uchun to'liq savdo boshqaruv tizimi.

## 🏗️ Stack

- **Backend:** Node.js + Express.js
- **Frontend:** React + TailwindCSS + Redux Toolkit
- **Database:** PostgreSQL (Schema-per-Tenant)
- **Bot:** Telegram Web App
- **Deploy:** Render / Docker

## 📁 Struktura

```
shop-management-system/
├── apps/
│   ├── api/          # Express.js backend
│   ├── web/          # React frontend  
│   └── bot/          # Telegram bot
├── packages/
│   └── database/     # SQL init fayl
├── infrastructure/
│   ├── docker/       # Docker compose
│   └── scripts/      # Deploy skriptlar
├── render.yaml       # Render deploy config
└── setup.sh          # Boshlash skripti
```

## 🚀 Boshlash

### Local (Development)

```bash
# 1. Sozlash
chmod +x setup.sh && ./setup.sh

# 2. .env to'ldirish
nano .env

# 3. PostgreSQL ishga tushirish
docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d

# 4. DB init
psql $DATABASE_URL -f packages/database/init.sql

# 5. Xizmatlar ishga tushirish (har birini alohida terminal)
cd apps/api && npm run dev      # http://localhost:5000
cd apps/web && npm run dev      # http://localhost:3000
cd apps/bot && npm run dev      # Bot
```

### Docker bilan

```bash
cp .env.example .env
nano .env  # to'ldiring
bash infrastructure/scripts/deploy.sh
```

### Render deploy

1. GitHub ga push qiling
2. render.yaml mavjud — Render avtomatik aniqlaydi
3. Environment variables qo'shing:
   - `FRONTEND_URL` → web service URL
   - `BOT_TOKEN` → Telegram bot token
   - `WEBAPP_URL` → web service URL

## 👤 Default kirish

Super Admin: `admin@shop.uz` / `Admin123!`

> ⚠️ Birinchi kirishda parolni o'zgartiring!

## 📱 Telegram Bot

1. `@BotFather` da bot yarating
2. `BOT_TOKEN` ni .env ga qo'shing
3. `WEBAPP_URL` ga web frontend URL ni kiriting
4. Bot avtomatik Web App ni ochadi

## 🔑 API Endpointlar

| Method | URL | Tavsif |
|--------|-----|--------|
| POST | /api/auth/login | Kirish |
| GET | /api/products | Mahsulotlar |
| POST | /api/orders | Buyurtma yaratish |
| GET | /api/analytics/dashboard | Dashboard stats |
| GET | /health | Tizim holati |

## 🏢 Roles

- `super_admin` — Platforma boshqaruvi
- `admin` — To'liq kirish
- `manager` — Mahsulot, buyurtma boshqaruvi
- `staff` — Faqat ko'rish va buyurtma yaratish
