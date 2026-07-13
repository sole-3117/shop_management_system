const superAdminService = require('./superadmin.service');
const { success } = require('../../utils/response');

class SuperAdminController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await superAdminService.login(email, password);
      return success(res, result, 'Muvaffaqiyatli kirdingiz');
    } catch (err) { next(err); }
  }

  async getClients(req, res, next) {
    try {
      const clients = await superAdminService.getClients();
      return success(res, clients);
    } catch (err) { next(err); }
  }

  async createClient(req, res, next) {
    try {
      const client = await superAdminService.createClient(req.body);
      return success(res, client, 'Mijoz yaratildi', 201);
    } catch (err) { next(err); }
  }

  async toggleClient(req, res, next) {
    try {
      const client = await superAdminService.toggleClient(req.params.id, req.body.isActive);
      return success(res, client, 'Holat yangilandi');
    } catch (err) { next(err); }
  }

  async deleteClient(req, res, next) {
    try {
      await superAdminService.deleteClient(req.params.id);
      return success(res, null, 'Mijoz o\'chirildi');
    } catch (err) { next(err); }
  }
}

module.exports = new SuperAdminController();
