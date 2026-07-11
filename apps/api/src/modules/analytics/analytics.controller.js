const analyticsService = require('./analytics.service');
const { success } = require('../../utils/response');

class AnalyticsController {
  async getDashboard(req, res, next) {
    try {
      const stats = await analyticsService.getDashboardStats(req.user.schema);
      return success(res, stats);
    } catch (err) { next(err); }
  }

  async getSalesChart(req, res, next) {
    try {
      const data = await analyticsService.getSalesChart(req.user.schema, req.query.period);
      return success(res, data);
    } catch (err) { next(err); }
  }

  async getTopProducts(req, res, next) {
    try {
      const data = await analyticsService.getTopProducts(req.user.schema, req.query.limit);
      return success(res, data);
    } catch (err) { next(err); }
  }

  async getRecentOrders(req, res, next) {
    try {
      const data = await analyticsService.getRecentOrders(req.user.schema, req.query.limit);
      return success(res, data);
    } catch (err) { next(err); }
  }
}

module.exports = new AnalyticsController();
