import express from 'express';
import contractController from '../controllers/contractControllers.js';

import {
  contractValidators,
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
router.get('/contracts',authenticateToken,
  authorizeRole(['ADMIN','EMPLOYE']), contractController.getAllContracts);
router.get('/contracts/:id',authenticateToken,
  authorizeRole(['ADMIN','EMPLOYE']), contractController.getContractById);
router.put(
  '/contracts/update/:id',authenticateToken,
  authorizeRole(['ADMIN','EMPLOYE']),
  contractValidators,
  handleValidationErrors,
  contractController.updateContract
);
router.delete('/contracts/delete/:id',authenticateToken,
  authorizeRole(['ADMIN']), contractController.deleteContract);

export default router;
