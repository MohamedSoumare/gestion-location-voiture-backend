import express from 'express';
import userController from '../controllers/userControllers.js';
import {
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  handleValidationErrors,
} from '../validators/userValidators.js';
import {
  authenticateToken,
  authorizeRole,
} from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route to add a new user
router.post(
  '/users/add',
  authenticateToken,
  authorizeRole(['ADMIN']),
  createUserValidator,
  handleValidationErrors,
  userController.addUser
);

// Route to edit a user
router.put(
  '/users/edit/:id',
  authenticateToken,
  authorizeRole(['ADMIN']),
  updateUserValidator,
  handleValidationErrors,
  userController.updateUser
);

// Route to delete a user
router.delete(
  '/users/delete/:id',
  authenticateToken,
  authorizeRole(['ADMIN']),
  deleteUserValidator,
  handleValidationErrors,
  userController.deleteUser
);

// Route to get all users
router.get(
  '/users',
  authenticateToken,
  authorizeRole(['ADMIN']),
  handleValidationErrors,
  userController.getAllUsers
);

// Route to update profile
router.put(
  '/users/update-profile',
  authenticateToken,
  handleValidationErrors,
  userController.updateProfile
);
// Route to get profile
router.get(
  '/users/profile',
  authenticateToken,
  handleValidationErrors,
  userController.getProfile
);

// Route to update password
router.put(
  '/profile/update-password',
  authenticateToken,
  handleValidationErrors,
  userController.updatePassword
);

// Route to get user by ID
router.get(
  '/users/:id',
  authenticateToken,
  authorizeRole(['ADMIN']),
  userController.getUserById
);

export default router;
