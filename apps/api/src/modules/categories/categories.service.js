const db = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

class CategoriesService {
  async getAll(schema) {
    return db('categories').withSchema(schema).orderBy('name');
  }

  async getById(schema, id) {
    const cat = await db('categories').withSchema(schema).where({ id }).first();
    if (!cat) throw { status: 404, message: 'Kategoriya topilmadi' };
    return cat;
  }

  async create(schema, data) {
    const [cat] = await db('categories').withSchema(schema)
      .insert({ id: uuidv4(), ...data, created_at: new Date(), updated_at: new Date() })
      .returning('*');
    return cat;
  }

  async update(schema, id, data) {
    const [cat] = await db('categories').withSchema(schema)
      .where({ id }).update({ ...data, updated_at: new Date() }).returning('*');
    if (!cat) throw { status: 404, message: 'Kategoriya topilmadi' };
    return cat;
  }

  async delete(schema, id) {
    const hasProducts = await db('products').withSchema(schema).where({ category_id: id }).first();
    if (hasProducts) throw { status: 400, message: 'Bu kategoriyada mahsulotlar mavjud' };
    await db('categories').withSchema(schema).where({ id }).delete();
    return true;
  }
}

module.exports = new CategoriesService();
