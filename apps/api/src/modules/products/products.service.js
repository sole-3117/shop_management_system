const db = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

class ProductsService {
  async getAll(schema, query) {
    const { page, limit, offset } = getPagination(query);
    const { search, categoryId, isActive, sortBy = 'created_at', sortOrder = 'desc' } = query;

    let q = db('products').withSchema(schema).select(
      'products.*',
      'categories.name as category_name'
    ).leftJoin(`${schema}.categories`, 'products.category_id', 'categories.id');

    if (search) q = q.whereILike('products.name', `%${search}%`);
    if (categoryId) q = q.where('products.category_id', categoryId);
    if (isActive !== undefined) q = q.where('products.is_active', isActive === 'true');

    const [{ count }] = await q.clone().count('products.id as count');
    const products = await q.orderBy(`products.${sortBy}`, sortOrder).limit(limit).offset(offset);

    return { data: products, pagination: getPaginationMeta(count, page, limit) };
  }

  async getById(schema, id) {
    const product = await db('products').withSchema(schema)
      .select('products.*', 'categories.name as category_name')
      .leftJoin(`${schema}.categories`, 'products.category_id', 'categories.id')
      .where('products.id', id).first();
    if (!product) throw { status: 404, message: 'Mahsulot topilmadi' };
    return product;
  }

  async create(schema, data) {
    const [product] = await db('products').withSchema(schema).insert({
      id: uuidv4(),
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    }).returning('*');
    return product;
  }

  async update(schema, id, data) {
    const [product] = await db('products').withSchema(schema)
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    if (!product) throw { status: 404, message: 'Mahsulot topilmadi' };
    return product;
  }

  async delete(schema, id) {
    const deleted = await db('products').withSchema(schema).where({ id }).delete();
    if (!deleted) throw { status: 404, message: 'Mahsulot topilmadi' };
    return true;
  }

  async updateStock(schema, id, quantity, type = 'set') {
    const product = await this.getById(schema, id);
    let newStock;
    if (type === 'add') newStock = product.stock + quantity;
    else if (type === 'subtract') newStock = Math.max(0, product.stock - quantity);
    else newStock = quantity;

    const [updated] = await db('products').withSchema(schema)
      .where({ id })
      .update({ stock: newStock, updated_at: new Date() })
      .returning('*');
    return updated;
  }

  async getLowStock(schema, threshold = 10) {
    return db('products').withSchema(schema)
      .where('stock', '<=', threshold)
      .where('is_active', true)
      .orderBy('stock', 'asc');
  }
}

module.exports = new ProductsService();
