import express from 'express';
import userController from '../controllers/userControllers.js';
import {
  validateUserData,
  handleValidationErrors,
} from '../validators/userValidators.js';
import authenticateToken, {
  authorizeRole,
} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post(
  '/register',
  validateUserData,
  handleValidationErrors,
  userController.addUser
);
router.post(
  '/users/add',
  authenticateToken,
  authorizeRole(['admin']),
  validateUserData,
  handleValidationErrors,
  userController.addUser
);
router.post('/login', handleValidationErrors, userController.login);
router.put(
  '/users/:id',
  authenticateToken,
  authorizeRole(['admin']),
  validateUserData,
  handleValidationErrors,
  userController.updateUser
);
router.get(
  '/users',
  authenticateToken,
  authorizeRole(['admin', 'employe']),
  userController.getAllUsers
);
router.delete(
  '/users/:id',
  authenticateToken,
  authorizeRole(['admin']),
  userController.deleteUser
);
router.put(
  '/update-password',
  authenticateToken,
  authorizeRole(['admin', 'employe']),
  userController.updatePassword
);
router.post(
  '/reset-password',
  authenticateToken,
  authorizeRole(['admin', 'employe']),
  userController.resetPassword
);
router.get(
  '/users/:id',
  authenticateToken,
  authorizeRole(['admin', 'employe']),
  userController.getUserById
);

export default router;
