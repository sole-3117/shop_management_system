const categoriesService = require('./categories.service');
const { success } = require('../../utils/response');

class CategoriesController {
  async getAll(req, res, next) {
    try {
      const cats = await categoriesService.getAll(req.user.schema);
      return success(res, cats);
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const cat = await categoriesService.getById(req.user.schema, req.params.id);
      return success(res, cat);
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const cat = await categoriesService.create(req.user.schema, req.body);
      return success(res, cat, 'Kategoriya qo\'shildi', 201);
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const cat = await categoriesService.update(req.user.schema, req.params.id, req.body);
      return success(res, cat, 'Kategoriya yangilandi');
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await categoriesService.delete(req.user.schema, req.params.id);
      return success(res, null, 'Kategoriya o\'chirildi');
    } catch (err) { next(err); }
  }
}

module.exports = new CategoriesController();
