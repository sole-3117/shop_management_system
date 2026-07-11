const authService = require('./auth.service');
const { success, error } = require('../../utils/response');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const schema = req.schema || 'public';
      const tenantId = req.tenant?.id;
      const result = await authService.login(schema, tenantId, email, password);
      return success(res, result, 'Muvaffaqiyatli kirdingiz');
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const schema = req.schema || 'public';
      const tenantId = req.tenant?.id;
      const result = await authService.refresh(schema, tenantId, refreshToken);
      return success(res, result, 'Token yangilandi');
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(req.user.schema, req.user.id, refreshToken);
      return success(res, null, 'Muvaffaqiyatli chiqdingiz');
    } catch (err) {
      next(err);
    }
  }

  async me(req, res, next) {
    try {
      const { password_hash, ...user } = req.user;
      return success(res, user);
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user.schema, req.user.id, currentPassword, newPassword);
      return success(res, null, 'Parol muvaffaqiyatli o\'zgartirildi');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
