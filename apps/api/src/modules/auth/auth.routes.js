const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');

router.post('/login',
  [
    body('email').isEmail().withMessage('To\'g\'ri email kiriting'),
    body('password').notEmpty().withMessage('Parol kiritilishi shart'),
  ],
  validate,
  authController.login.bind(authController)
);

router.post('/refresh',
  body('refreshToken').notEmpty().withMessage('Refresh token kerak'),
  validate,
  authController.refresh.bind(authController)
);

router.post('/logout', authenticate, authController.logout.bind(authController));
router.get('/me', authenticate, authController.me.bind(authController));
router.put('/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).withMessage('Parol kamida 8 ta belgi'),
  ],
  validate,
  authController.changePassword.bind(authController)
);

module.exports = router;
