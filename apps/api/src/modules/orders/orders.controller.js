const ordersService = require('./orders.service');
const { success, paginated } = require('../../utils/response');

class OrdersController {
  async getAll(req, res, next) {
    try {
      const result = await ordersService.getAll(req.user.schema, req.query);
      return paginated(res, result.data, result.pagination);
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const order = await ordersService.getById(req.user.schema, req.params.id);
      return success(res, order);
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const order = await ordersService.create(req.user.schema, req.body);
      return success(res, order, 'Buyurtma yaratildi', 201);
    } catch (err) { next(err); }
  }

  async updateStatus(req, res, next) {
    try {
      const { status, paymentStatus } = req.body;
      const order = await ordersService.updateStatus(req.user.schema, req.params.id, status, paymentStatus);
      return success(res, order, 'Buyurtma holati yangilandi');
    } catch (err) { next(err); }
  }

  async getStats(req, res, next) {
    try {
      const { dateFrom = new Date(new Date().setDate(1)), dateTo = new Date() } = req.query;
      const stats = await ordersService.getStats(req.user.schema, dateFrom, dateTo);
      return success(res, stats);
    } catch (err) { next(err); }
  }
}

module.exports = new OrdersController();
