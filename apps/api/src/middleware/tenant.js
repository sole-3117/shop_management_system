const db = require('../config/database');

const resolveTenant = async (req, res, next) => {
  try {
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];

    // Bot uchun header orqali
    const tenantId = req.headers['x-tenant-id'] || subdomain;

    if (!tenantId || tenantId === 'api' || tenantId === 'localhost') {
      return next(); // Super admin yoki direct API
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
