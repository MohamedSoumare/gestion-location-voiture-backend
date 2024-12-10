import express from 'express';
import {
  login,
  resetPassword,
  refreshToken,
  updateResetPassword,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/reset-password', resetPassword);
router.post('/forgot-password',updateResetPassword);

export default router;
  