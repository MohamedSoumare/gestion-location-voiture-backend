import express from 'express';
import customerController from '../controllers/customerControllers.js';
import {
  validateCustomerData,
  handleValidationErrors,
} from '../validators/customerValidators.js';
// import authenticateToken, {
//   authorizeRole,
// } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST route to add a customer
router.post(
  '/customers/add',
  handleValidationErrors,
  customerController.addCustomer
);

// PUT route to update a customer
router.put(
  '/customers/update/:id',
  validateCustomerData,
  handleValidationErrors,
  customerController.updateCustomer
);

// GET route to get a customer by ID
router.get(
  '/customers/:id',
  customerController.getCustomerById
);

// DELETE route to delete a customer by ID
router.delete(
  '/customers/delete/:id',customerController.deleteCustomer
);

// GET route to get all customers
router.get(
  '/customers',customerController.getAllCustomers
);

export default router;
