const customersService = require('./customers.service');
const { success, paginated } = require('../../utils/response');

class CustomersController {
  async getAll(req, res, next) {
    try {
      const result = await customersService.getAll(req.user.schema, req.query);
      return paginated(res, result.data, result.pagination);
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const customer = await customersService.getById(req.user.schema, req.params.id);
      return success(res, customer);
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const customer = await customersService.create(req.user.schema, req.body);
      return success(res, customer, 'Mijoz qo\'shildi', 201);
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const customer = await customersService.update(req.user.schema, req.params.id, req.body);
      return success(res, customer, 'Mijoz yangilandi');
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await customersService.delete(req.user.schema, req.params.id);
      return success(res, null, 'Mijoz o\'chirildi');
    } catch (err) { next(err); }
  }
}

module.exports = new CustomersController();
