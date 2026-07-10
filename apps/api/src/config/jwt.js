module.exports = {
  secret: process.env.JWT_SECRET || 'fallback_secret_change_in_prod',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
