const db = require('../../config/database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

class SuperAdminService {
  async getClients() {
    return db('public.clients').orderBy('created_at', 'desc');
  }

  async createClient(data) {
    const { name, slug, email, adminName, adminPassword } = data;

    const existing = await db('public.clients').where({ slug }).first();
    if (existing) throw { status: 409, message: 'Bu slug allaqachon mavjud' };

    const clientId = uuidv4();
    const schema = `tenant_${clientId.replace(/-/g, '_')}`;

    await db.transaction(async (trx) => {
      // Client yaratish
      await trx('public.clients').insert({
        id: clientId,
        name,
        slug,
        email,
        schema_name: schema,
        is_active: true,
        created_at: new Date(),
      });

      // Schema yaratish
      await trx.raw(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);

      // Tenant tablolarini yaratish
      await this._createTenantTables(trx, schema);

      // Admin user yaratish
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await trx.raw(`
        INSERT INTO "${schema}".users (id, name, email, password_hash, role, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'admin', true, NOW(), NOW())
      `, [uuidv4(), adminName, email, passwordHash]);
    });

    return db('public.clients').where({ id: clientId }).first();
  }

  async _createTenantTables(trx, schema) {
    // Users
    await trx.raw(`
      CREATE TABLE IF NOT EXISTS "${schema}".users (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'staff',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Refresh tokens
    await trx.raw(`
      CREATE TABLE IF NOT EXISTS "${schema}".refresh_tokens (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES "${schema}".users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Categories
    await trx.raw(`
      CREATE TABLE IF NOT EXISTS "${schema}".categories (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Products
    await trx.raw(`
      CREATE TABLE IF NOT EXISTS "${schema}".products (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(12,2) NOT NULL DEFAULT 0,
        cost_price DECIMAL(12,2) DEFAULT 0,
        stock INTEGER DEFAULT 0,
        unit VARCHAR(50) DEFAULT 'dona',
        category_id UUID REFERENCES "${schema}".categories(id),
        image_url TEXT,
        barcode VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Customers
    await trx.raw(`
      CREATE TABLE IF NOT EXISTS "${schema}".customers (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        address TEXT,
        telegram_id BIGINT UNIQUE,
        telegram_username VARCHAR(255),
        notes TEXT,
        total_orders INTEGER DEFAULT 0,
        total_spent DECIMAL(12,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Orders
    await trx.raw(`
      CREATE TABLE IF NOT EXISTS "${schema}".orders (
        id UUID PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id UUID REFERENCES "${schema}".customers(id),
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50) DEFAULT 'cash',
        payment_status VARCHAR(50) DEFAULT 'unpaid',
        subtotal DECIMAL(12,2) DEFAULT 0,
        discount DECIMAL(12,2) DEFAULT 0,
        total DECIMAL(12,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Order items
    await trx.raw(`
      CREATE TABLE IF NOT EXISTS "${schema}".order_items (
        id UUID PRIMARY KEY,
        order_id UUID REFERENCES "${schema}".orders(id) ON DELETE CASCADE,
        product_id UUID REFERENCES "${schema}".products(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(12,2) NOT NULL,
        total_price DECIMAL(12,2) NOT NULL
      )
    `);
  }

  async toggleClient(id, isActive) {
    const [client] = await db('public.clients').where({ id }).update({ is_active: isActive }).returning('*');
    return client;
  }

  async deleteClient(id) {
    const client = await db('public.clients').where({ id }).first();
    if (!client) throw { status: 404, message: 'Mijoz topilmadi' };

    await db.transaction(async (trx) => {
      await trx.raw(`DROP SCHEMA IF EXISTS "${client.schema_name}" CASCADE`);
      await trx('public.clients').where({ id }).delete();
    });

    return true;
  }
}

module.exports = new SuperAdminService();
