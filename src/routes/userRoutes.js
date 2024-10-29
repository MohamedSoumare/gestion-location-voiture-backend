import express from 'express';
import userController from '../controllers/userControllers.js';
import {
  validateUserData,
  handleValidationErrors,
} from '../validators/userValidators.js';

const router = express.Router();

router.post(
  '/users/add',
  validateUserData,
  handleValidationErrors,
  userController.addUser
);

router.put(
  '/users/edit/:id',
  validateUserData,
  handleValidationErrors,
  userController.updateUser
);

router.get('/users', userController.getAllUsers);

router.get('/users/:id', userController.getUserById);

router.delete('/users/delete/:id', userController.deleteUser);

// router.get('/users/:id/history', userController.getUserHistory);

export default router;
