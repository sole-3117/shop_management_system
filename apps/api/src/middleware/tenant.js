const db = require('../config/database');

const resolveTenant = async (req, res, next) => {
  try {
    const tenantId = req.headers['x-tenant-id'];

    // Header bo'lmasa — bu super-admin yoki tenant-mustaqil so'rov
    if (!tenantId) {
      return next();
    }

    const client = await db('public.clients').where({ slug: tenantId, is_active: true }).first();

    if (!client) {
      return res.status(404).json({ success: false, message: 'Tenant topilmadi' });
    }

    req.tenant = client;
    req.schema = `tenant_${client.id}`;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { resolveTenant };
