const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const db = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token topilmadi' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtConfig.secret);

    if (decoded.role === 'super_admin') {
      const admin = await db('public.super_admins')
        .where({ id: decoded.userId, is_active: true })
        .first();

      if (!admin) {
        return res.status(401).json({ success: false, message: 'Foydalanuvchi topilmadi' });
      }

      req.user = { ...admin, role: 'super_admin' };
      return next();
    }

    const user = await db('users')
      .withSchema(decoded.schema)
      .where({ id: decoded.userId, is_active: true })
      .first();

    if (!user) {
      return res.status(401).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    req.user = { ...user, schema: decoded.schema, tenantId: decoded.tenantId };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token muddati tugagan', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Noto\'g\'ri token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Ruxsat yo\'q' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
