import express from 'express';
import customerController from '../controllers/customerControllers.js';
// import { authMiddleware, checkRole } from '../middlewares/authMiddleware.js';
import { validateCustomerData } from '../validators/customerValidators.js';

const router = express.Router();

// router.post('/customers', authMiddleware, checkRole('admin'), validateCustomerData, customerController.addCustomer);

router.post('/customers/add',  validateCustomerData, customerController.addCustomer);
router.get('/customers', customerController.getAllCustomers);
router.get('/customers/:id', customerController.getCustomerById);
router.put('/customers/edit/:id',  validateCustomerData, customerController.updateCustomer);
router.delete('/customers/delete/:id',  customerController.deleteCustomer);
router.get('/customers/:id/history',  customerController.getCustomerHistory);

export default router;
