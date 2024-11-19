import express from 'express';
import { login, resetPassword, refreshToken } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);

export default router;

