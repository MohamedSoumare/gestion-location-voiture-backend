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
  validateUserData,
  handleValidationErrors,
  userController.addUser
);
router.post('/login', handleValidationErrors, userController.login);
router.put(
  '/users/edit/:id',
  validateUserData,
  handleValidationErrors,
  userController.updateUser
);
router.get('/users', userController.getAllUsers);
router.delete('/users/delete/:id', userController.deleteUser);
router.put('/update-password', userController.updatePassword);
router.post('/reset-password', userController.resetPassword);
router.get('/users/:id', userController.getUserById);

export default router;
