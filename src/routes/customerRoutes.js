import express from 'express';
import customerController from '../controllers/customerControllers.js';
import {
  handleValidationErrors,
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
  createValidators,handleValidationErrors,
  customerController.addCustomer
);

router.put(
  '/customers/update/:id',
  authenticateToken,
  authorizeRole(['ADMIN', 'EMPLOYE']),
  updateValidators,handleValidationErrors,
  customerController.updateCustomer
);

router.get(
  '/customers/:id',
  authenticateToken,handleValidationErrors,
  authorizeRole(['ADMIN', 'EMPLOYE']),
  customerController.getCustomerById
);

router.delete(
  '/customers/delete/:id',
  authenticateToken,
  authorizeRole(['ADMIN']),
  handleValidationErrors,
  deleteValidators,
  customerController.deleteCustomer
);

router.get(
  '/customers',
  authenticateToken,handleValidationErrors,
  authorizeRole(['ADMIN', 'EMPLOYE']),handleValidationErrors,
  customerController.getAllCustomers
);

export default router;
