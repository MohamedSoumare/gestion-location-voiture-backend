import express from 'express';
import vehicleController from '../controllers/vehicleControllers.js';
import {
  handleValidationErrors,
  validateVehicleData,
} from '../validators/vehicleValidators.js';

const router = express.Router();

router.post(
  '/vehicles/add',
  validateVehicleData,
  handleValidationErrors,
  vehicleController.addVehicle
);

router.put(
  '/vehicles/edit/:id',
  validateVehicleData,
  handleValidationErrors,
  vehicleController.updateVehicle
);

router.delete('/vehicles/delete/:id', vehicleController.deleteVehicle);
router.get('/vehicles', vehicleController.getAllVehicles);
router.get('/vehicles/:id', vehicleController.getVehicleById);

export default router;
