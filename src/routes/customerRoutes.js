import express from 'express';
import customerController from '../controllers/customerControllers.js';
import {
  validateCustomerData,
  handleValidationErrors,
} from '../validators/customerValidators.js';
import authenticateToken, {
  authorizeRole,
} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post(
  '/customers/add',
  authenticateToken,
  authorizeRole(['admin', 'employe']),
  validateCustomerData,
  handleValidationErrors,
  customerController.addCustomer
);
router.put(
  '/customers/update/:id',
  authenticateToken,
  authorizeRole(['admin', 'employe']),
  validateCustomerData,
  handleValidationErrors,
  customerController.updateCustomer
);
router.get(
  '/customers/:id',
  authenticateToken,
  authorizeRole(['admin', 'employe']),
  customerController.getCustomerById
);
router.delete(
  '/customers/delete/:id',
  authenticateToken,
  authorizeRole(['admin']),
  customerController.deleteCustomer
);
router.get(
  '/customers',
  authenticateToken,
  authorizeRole(['admin', 'employe']),
  customerController.getAllCustomers
);

export default router;
