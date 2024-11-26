import express from 'express';
import contractController from '../controllers/contractControllers.js';

import {
  contractValidators,
  updateValidatorsContract,
  deleteValidatorsContract,
  handleValidationErrors,
} from '../validators/contractValidators.js';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';

const router = express.Router();



router.post(
  '/contracts/add',authenticateToken,
  authorizeRole(['ADMIN','EMPLOYE']),
  contractValidators,
  handleValidationErrors,
  contractController.createContract
);
router.put('/contracts/status/:id',authenticateToken,
  authorizeRole(['ADMIN','EMPLOYE']),
  handleValidationErrors, contractController.updateContractStatus);

router.get('/contracts',authenticateToken,
  authorizeRole(['ADMIN','EMPLOYE']),
  handleValidationErrors, contractController.getAllContracts);

router.get('/contracts/:id',authenticateToken,
  authorizeRole(['ADMIN','EMPLOYE']),
  handleValidationErrors, contractController.getContractById);
router.put(
  '/contracts/update/:id',authenticateToken,
  authorizeRole(['ADMIN','EMPLOYE']),
  updateValidatorsContract,
  handleValidationErrors,
  contractController.updateContract
);
router.delete('/contracts/delete/:id',authenticateToken,
  authorizeRole(['ADMIN']),deleteValidatorsContract,handleValidationErrors, contractController.deleteContract);

export default router;
