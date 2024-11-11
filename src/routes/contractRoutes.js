import express from 'express';
import { contractController } from '../controllers/contractControllers.js';
import { contractValidators, handleValidationErrors } from '../validators/contractValidators.js';

const router = express.Router();

router.post('/contracts/add', contractValidators, handleValidationErrors, contractController.createContract);
router.get('/contracts', contractController.getAllContracts);
router.get('/contracts/:id', contractController.getContractById);
router.put('/contracts/update/:id', contractValidators, handleValidationErrors, contractController.updateContract);
router.delete('/contracts/delete/:id', contractController.deleteContract);

export default router;
