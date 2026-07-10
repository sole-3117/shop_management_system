const productsService = require('./products.service');
const { success, paginated, error } = require('../../utils/response');

class ProductsController {
  async getAll(req, res, next) {
    try {
      const result = await productsService.getAll(req.user.schema, req.query);
      return paginated(res, result.data, result.pagination);
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const product = await productsService.getById(req.user.schema, req.params.id);
      return success(res, product);
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const product = await productsService.create(req.user.schema, req.body);
      return success(res, product, 'Mahsulot qo\'shildi', 201);
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const product = await productsService.update(req.user.schema, req.params.id, req.body);
      return success(res, product, 'Mahsulot yangilandi');
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await productsService.delete(req.user.schema, req.params.id);
      return success(res, null, 'Mahsulot o\'chirildi');
    } catch (err) { next(err); }
  }

  async updateStock(req, res, next) {
    try {
      const { quantity, type } = req.body;
      const product = await productsService.updateStock(req.user.schema, req.params.id, quantity, type);
      return success(res, product, 'Ombor yangilandi');
    } catch (err) { next(err); }
  }

  async getLowStock(req, res, next) {
    try {
      const products = await productsService.getLowStock(req.user.schema, req.query.threshold);
      return success(res, products);
    } catch (err) { next(err); }
  }
}

module.exports = new ProductsController();
