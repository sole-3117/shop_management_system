const express = require('express');
const router = express.Router();
const c = require('./categories.controller');
const { authenticate, authorize } = require('../../middleware/auth');

router.use(authenticate);
router.get('/', c.getAll.bind(c));
router.get('/:id', c.getById.bind(c));
router.post('/', authorize('admin', 'manager'), c.create.bind(c));
router.put('/:id', authorize('admin', 'manager'), c.update.bind(c));
router.delete('/:id', authorize('admin'), c.delete.bind(c));

module.exports = router;
