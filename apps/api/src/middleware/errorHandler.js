const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, url: req.url, method: req.method });

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Bu ma\'lumot allaqachon mavjud' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ success: false, message: 'Bog\'liq ma\'lumot topilmadi' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Server xatosi' : err.message,
  });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route topilmadi: ${req.originalUrl}` });
};

module.exports = { errorHandler, notFound };
