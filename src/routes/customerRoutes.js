import express from 'express';
import customerController from '../controllers/customerControllers.js';
import {
  createValidators,
  updateValidators,
  deleteValidators,
} from '../validators/customerValidators.js';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post(
  '/customers/add',
  authenticateToken,
  authorizeRole(['ADMIN', 'EMPLOYE']),
  createValidators,
  customerController.addCustomer
);

router.put(
  '/customers/update/:id',
  authenticateToken,
  authorizeRole(['ADMIN', 'EMPLOYE']),
  updateValidators,
  customerController.updateCustomer
);

router.get(
  '/customers/:id',
  authenticateToken,
  authorizeRole(['ADMIN', 'EMPLOYE']),
  customerController.getCustomerById
);

router.delete(
  '/customers/delete/:id',
  authenticateToken,
  authorizeRole(['ADMIN']),
  deleteValidators,
  customerController.deleteCustomer
);

router.get(
  '/customers',
  authenticateToken,
  authorizeRole(['ADMIN', 'EMPLOYE']),
  customerController.getAllCustomers
);

export default router;
