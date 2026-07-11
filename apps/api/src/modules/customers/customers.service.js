const db = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

class CustomersService {
  async getAll(schema, query) {
    const { page, limit, offset } = getPagination(query);
    const { search } = query;

    let q = db('customers').withSchema(schema);
    if (search) {
      q = q.where(function() {
        this.whereILike('name', `%${search}%`).orWhereILike('phone', `%${search}%`);
      });
    }

    const [{ count }] = await q.clone().count('id as count');
    const customers = await q.orderBy('created_at', 'desc').limit(limit).offset(offset);
    return { data: customers, pagination: getPaginationMeta(count, page, limit) };
  }

  async getById(schema, id) {
    const customer = await db('customers').withSchema(schema).where({ id }).first();
    if (!customer) throw { status: 404, message: 'Mijoz topilmadi' };

    const orders = await db('orders').withSchema(schema)
      .where({ customer_id: id }).orderBy('created_at', 'desc').limit(10);

    return { ...customer, recentOrders: orders };
  }

  async create(schema, data) {
    // Telefon raqam tekshiruv
    if (data.phone) {
      const existing = await db('customers').withSchema(schema).where({ phone: data.phone }).first();
      if (existing) throw { status: 409, message: 'Bu telefon raqam allaqachon ro\'yxatda' };
    }

    const [customer] = await db('customers').withSchema(schema)
      .insert({ id: uuidv4(), ...data, created_at: new Date(), updated_at: new Date() })
      .returning('*');
    return customer;
  }

  async update(schema, id, data) {
    const [customer] = await db('customers').withSchema(schema)
      .where({ id }).update({ ...data, updated_at: new Date() }).returning('*');
    if (!customer) throw { status: 404, message: 'Mijoz topilmadi' };
    return customer;
  }

  async delete(schema, id) {
    await db('customers').withSchema(schema).where({ id }).delete();
    return true;
  }

  async getByTelegramId(schema, telegramId) {
    return db('customers').withSchema(schema).where({ telegram_id: telegramId }).first();
  }

  async upsertByTelegram(schema, telegramData) {
    const existing = await this.getByTelegramId(schema, telegramData.telegram_id);
    if (existing) {
      const [updated] = await db('customers').withSchema(schema)
        .where({ id: existing.id })
        .update({ ...telegramData, updated_at: new Date() })
        .returning('*');
      return updated;
    }
    return this.create(schema, telegramData);
  }
}

module.exports = new CustomersService();
