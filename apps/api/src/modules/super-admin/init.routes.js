const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../../config/database');

router.post('/init-db', async (req, res) => {
  const secret = req.headers['x-init-secret'];
  if (secret !== process.env.INIT_SECRET) {
    return res.status(403).json({ success: false, message: 'Ruxsat yo\'q' });
  }
  try {
    await db.raw(`CREATE TABLE IF NOT EXISTS public.clients (
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
    )`);

    await db.raw(`CREATE TABLE IF NOT EXISTS public.super_admins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    const passwordHash = await bcrypt.hash('Admin123!', 12);

    await db.raw(`
      INSERT INTO public.super_admins (name, email, password_hash)
      VALUES ('Super Admin', 'admin@shop.uz', ?)
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    `, [passwordHash]);

    return res.json({ success: true, message: 'Database tayyor! Admin parol qayta o\'rnatildi.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
