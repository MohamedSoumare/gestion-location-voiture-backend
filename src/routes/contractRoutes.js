import express from 'express';
import contractController from '../controllers/contractControllers.js';
import {
  validateContractData,
  handleValidationErrors,
} from '../validators/contractValidators.js';

const router = express.Router();

router.post(
  '/contracts/add',
  validateContractData,
  handleValidationErrors,
  contractController.addContract
);
router.put(
  '/contracts/edit/:id',
  validateContractData,
  handleValidationErrors,
  contractController.updateContract
);
router.delete('/contracts/delete/:id', contractController.deleteContract);
router.get('/contracts', contractController.getAllContracts);
router.get('/contracts/:id', contractController.getContractById);

export default router;
