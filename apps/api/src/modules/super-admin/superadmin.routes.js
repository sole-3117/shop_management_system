const express = require('express');
const router = express.Router();
const c = require('./superadmin.controller');
const { authenticate, authorize } = require('../../middleware/auth');

router.post('/login', c.login.bind(c));

router.use(authenticate, authorize('super_admin'));
router.get('/clients', c.getClients.bind(c));
router.post('/clients', c.createClient.bind(c));
router.patch('/clients/:id/toggle', c.toggleClient.bind(c));
router.delete('/clients/:id', c.deleteClient.bind(c));

module.exports = router;
