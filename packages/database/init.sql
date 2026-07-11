-- Public schema (Super Admin)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255),
  schema_name VARCHAR(255) NOT NULL,
  plan VARCHAR(50) DEFAULT 'basic',
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Super admin default user (parol: Admin123! ni o'zgartiring!)
INSERT INTO public.super_admins (name, email, password_hash)
VALUES ('Super Admin', 'admin@shop.uz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYlW5xqZ0Kj8K2')
ON CONFLICT (email) DO NOTHING;
