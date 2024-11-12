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

router.post(
  '/customers/add',
  handleValidationErrors,
  customerController.addCustomer
);
router.put(
  '/customers/update/:id',
  validateCustomerData,
  handleValidationErrors,
  customerController.updateCustomer
);
// router.get(
//   '/customers/:id',
//   authenticateToken,
//   authorizeRole(['admin', 'employe']),
//   customerController.getCustomerById
// );
router.get('/customers/:id', customerController.getCustomerById);
router.delete('/customers/delete/:id', customerController.deleteCustomer);
router.get('/customers', customerController.getAllCustomers);

export default router;
