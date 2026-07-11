const express = require('express');
const router = express.Router();
const c = require('./analytics.controller');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);
router.get('/dashboard', c.getDashboard.bind(c));
router.get('/sales-chart', c.getSalesChart.bind(c));
router.get('/top-products', c.getTopProducts.bind(c));
router.get('/recent-orders', c.getRecentOrders.bind(c));

module.exports = router;
