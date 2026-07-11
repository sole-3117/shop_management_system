const express = require('express');
const router = express.Router();
const c = require('./customers.controller');
const { authenticate, authorize } = require('../../middleware/auth');

router.use(authenticate);
router.get('/', c.getAll.bind(c));
router.get('/:id', c.getById.bind(c));
router.post('/', c.create.bind(c));
router.put('/:id', c.update.bind(c));
router.delete('/:id', authorize('admin'), c.delete.bind(c));

module.exports = router;
