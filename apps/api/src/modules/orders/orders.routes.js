const express = require('express');
const router = express.Router();
const c = require('./orders.controller');
const { authenticate, authorize } = require('../../middleware/auth');

router.use(authenticate);
router.get('/', c.getAll.bind(c));
router.get('/stats', c.getStats.bind(c));
router.get('/:id', c.getById.bind(c));
router.post('/', c.create.bind(c));
router.patch('/:id/status', authorize('admin', 'manager'), c.updateStatus.bind(c));

module.exports = router;
