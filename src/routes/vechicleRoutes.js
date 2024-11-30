import express from 'express';
import vehicleController from '../controllers/vehicleControllers.js';
import {
  createVehicleValidators,
  updateVehicleValidators,
  deleteVehicleValidators,
  handleValidationErrors,
} from '../validators/vehicleValidators.js';
import {
  authenticateToken,
  authorizeRole,
} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post(
  '/vehicles/add',
  authenticateToken,
  authorizeRole(['ADMIN', 'EMPLOYE']),
  createVehicleValidators,
  handleValidationErrors,
  vehicleController.addVehicle
);
router.put(
  '/vehicles/edit/:id',
  authenticateToken,
  authorizeRole(['ADMIN', 'EMPLOYE']),
  updateVehicleValidators,
  handleValidationErrors,
  vehicleController.updateVehicle
);
router.delete(
  '/vehicles/delete/:id',
  authenticateToken,
  authorizeRole(['ADMIN']),
  deleteVehicleValidators,
  handleValidationErrors,
  vehicleController.deleteVehicle
);

router.get(
  '/vehicles',
  authenticateToken,
  authorizeRole(['ADMIN', 'EMPLOYE']),
  handleValidationErrors,
  vehicleController.getAllVehicles
);

router.get(
  '/vehicles/:id',
  authenticateToken,
  authorizeRole(['ADMIN', 'EMPLOYE']),
  handleValidationErrors,
  vehicleController.getVehicleById
);

export default router;
