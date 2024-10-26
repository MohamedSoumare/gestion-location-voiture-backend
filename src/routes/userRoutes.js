import express from 'express';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userControllers.js';
import { validateUser } from '../validators/userValidator.js';

const router = express.Router();

router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.post('/users', validateUser, createUser);
router.put('/users/:id', validateUser, updateUser);
router.delete('/users/:id', deleteUser);

export default router;
