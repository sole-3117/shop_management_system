const db = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

class OrdersService {
  async getAll(schema, query) {
    const { page, limit, offset } = getPagination(query);
    const { status, customerId, dateFrom, dateTo, search } = query;

    let q = db('orders').withSchema(schema)
      .select('orders.*', 'customers.name as customer_name', 'customers.phone as customer_phone')
      .leftJoin(`${schema}.customers`, 'orders.customer_id', 'customers.id');

    if (status) q = q.where('orders.status', status);
    if (customerId) q = q.where('orders.customer_id', customerId);
    if (dateFrom) q = q.where('orders.created_at', '>=', dateFrom);
    if (dateTo) q = q.where('orders.created_at', '<=', dateTo);
    if (search) q = q.whereILike('orders.order_number', `%${search}%`);

    const [{ count }] = await q.clone().count('orders.id as count');
    const orders = await q.orderBy('orders.created_at', 'desc').limit(limit).offset(offset);

    return { data: orders, pagination: getPaginationMeta(count, page, limit) };
  }

  async getById(schema, id) {
    const order = await db('orders').withSchema(schema)
      .select('orders.*', 'customers.name as customer_name', 'customers.phone as customer_phone')
      .leftJoin(`${schema}.customers`, 'orders.customer_id', 'customers.id')
      .where('orders.id', id).first();

    if (!order) throw { status: 404, message: 'Buyurtma topilmadi' };

    const items = await db('order_items').withSchema(schema)
      .select('order_items.*', 'products.name as product_name', 'products.image_url')
      .leftJoin(`${schema}.products`, 'order_items.product_id', 'products.id')
      .where('order_id', id);

    return { ...order, items };
  }

  async create(schema, data) {
    const { customerId, items, notes, discount = 0, paymentMethod = 'cash' } = data;

    return db.transaction(async (trx) => {
      // Narxlarni hisoblash
      let subtotal = 0;
      const processedItems = [];

      for (const item of items) {
        const product = await trx('products').withSchema(schema).where({ id: item.productId }).first();
        if (!product) throw { status: 404, message: `Mahsulot topilmadi: ${item.productId}` };
        if (product.stock < item.quantity) {
          throw { status: 400, message: `${product.name} uchun yetarli ombor yo'q` };
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
        processedItems.push({
          id: uuidv4(),
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: product.price,
          total_price: itemTotal,
        });

        // Ombor kamaytirish
        await trx('products').withSchema(schema)
          .where({ id: item.productId })
          .decrement('stock', item.quantity);
      }

      const total = subtotal - discount;
      const orderNumber = `ORD-${Date.now()}`;

      const [order] = await trx('orders').withSchema(schema).insert({
        id: uuidv4(),
        order_number: orderNumber,
        customer_id: customerId || null,
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: 'unpaid',
        subtotal,
        discount,
        total,
        notes,
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('*');

      const itemsWithOrder = processedItems.map(i => ({ ...i, order_id: order.id }));
      await trx('order_items').withSchema(schema).insert(itemsWithOrder);

      return { ...order, items: itemsWithOrder };
    });
  }

  async updateStatus(schema, id, status, paymentStatus) {
    const updates = { status, updated_at: new Date() };
    if (paymentStatus) updates.payment_status = paymentStatus;

    const [order] = await db('orders').withSchema(schema)
      .where({ id }).update(updates).returning('*');

    if (!order) throw { status: 404, message: 'Buyurtma topilmadi' };
    return order;
  }

  async getStats(schema, dateFrom, dateTo) {
    const q = db('orders').withSchema(schema)
      .where('created_at', '>=', dateFrom)
      .where('created_at', '<=', dateTo);

    const [stats] = await q.clone().select(
      db.raw('COUNT(*) as total_orders'),
      db.raw('SUM(total) as total_revenue'),
      db.raw('AVG(total) as avg_order_value'),
      db.raw('COUNT(CASE WHEN status = \'completed\' THEN 1 END) as completed_orders'),
    );

    return stats;
  }
}

module.exports = new OrdersService();
