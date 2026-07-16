const db = require('../../config/database');

class AnalyticsService {
  async getDashboardStats(schema) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayStats] = await db('orders').withSchema(schema)
      .where('created_at', '>=', startOfDay)
      .select(
        db.raw('COUNT(*) as orders_count'),
        db.raw('COALESCE(SUM(total), 0) as revenue')
      );

    const [monthStats] = await db('orders').withSchema(schema)
      .where('created_at', '>=', startOfMonth)
      .select(
        db.raw('COUNT(*) as orders_count'),
        db.raw('COALESCE(SUM(total), 0) as revenue')
      );

    const [productStats] = await db('products').withSchema(schema)
      .select(
        db.raw('COUNT(*) as total_products'),
        db.raw('COUNT(CASE WHEN stock <= 10 THEN 1 END) as low_stock_count')
      );

    const [customerStats] = await db('customers').withSchema(schema)
      .select(db.raw('COUNT(*) as total_customers'));

    return {
      today: todayStats,
      month: monthStats,
      products: productStats,
      customers: customerStats,
    };
  }

  async getSalesChart(schema, period = '30days') {
    let dateFrom;
    const now = new Date();

    if (period === '7days') dateFrom = new Date(now - 7 * 24 * 60 * 60 * 1000);
    else if (period === '30days') dateFrom = new Date(now - 30 * 24 * 60 * 60 * 1000);
    else if (period === '12months') dateFrom = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    else dateFrom = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const dateFormat = period === '12months' ? 'YYYY-MM' : 'YYYY-MM-DD';

    const data = await db('orders').withSchema(schema)
      .where('created_at', '>=', dateFrom)
      .select(
        db.raw(`TO_CHAR(created_at, '${dateFormat}') as date`),
        db.raw('COUNT(*) as orders'),
        db.raw('COALESCE(SUM(total), 0) as revenue')
      )
      .groupBy(db.raw(`TO_CHAR(created_at, '${dateFormat}')`))
      .orderBy('date');

    return data;
  }

  async getTopProducts(schema, limit = 10) {
    return db('order_items').withSchema(schema)
      .join(`products`, 'order_items.product_id', 'products.id')
      .groupBy('products.id', 'products.name')
      .select(
        'products.id',
        'products.name',
        db.raw('SUM(order_items.quantity) as total_sold'),
        db.raw('SUM(order_items.total_price) as total_revenue')
      )
      .orderBy('total_sold', 'desc')
      .limit(limit);
  }

  async getRecentOrders(schema, limit = 10) {
    return db('orders').withSchema(schema)
      .leftJoin(`customers`, 'orders.customer_id', 'customers.id')
      .select('orders.*', 'customers.name as customer_name')
      .orderBy('orders.created_at', 'desc')
      .limit(limit);
  }
}

module.exports = new AnalyticsService();
