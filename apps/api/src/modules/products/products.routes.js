const express = require('express');
const router = express.Router();
const c = require('./products.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');

router.use(authenticate);

router.get('/', c.getAll.bind(c));
router.get('/low-stock', c.getLowStock.bind(c));
router.get('/:id', c.getById.bind(c));

router.post('/',
  authorize('admin', 'manager'),
  [
    body('name').notEmpty().withMessage('Nom kiritilishi shart'),
    body('price').isFloat({ min: 0 }).withMessage('Narx to\'g\'ri formatda bo\'lishi shart'),
    body('stock').isInt({ min: 0 }).withMessage('Miqdor 0 dan katta bo\'lishi shart'),
  ],
  validate,
  c.create.bind(c)
);

router.put('/:id', authorize('admin', 'manager'), c.update.bind(c));
router.delete('/:id', authorize('admin'), c.delete.bind(c));
router.patch('/:id/stock', authorize('admin', 'manager'), c.updateStock.bind(c));

module.exports = router;
