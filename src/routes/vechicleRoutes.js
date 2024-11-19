import express from 'express';
import vehicleController from '../controllers/vehicleControllers.js';
import { validateVehicleData } from '../validators/vehicleValidators.js';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/vehicles/add', authenticateToken,
  authorizeRole(['ADMIN','EMPLOYE']), validateVehicleData, vehicleController.addVehicle);
router.put(
  '/vehicles/edit/:id', authenticateToken,
  authorizeRole(['ADMIN','EMPLOYE']),
  validateVehicleData,
  vehicleController.updateVehicle
);
router.delete('/vehicles/delete/:id', authenticateToken,
  authorizeRole(['ADMIN']), vehicleController.deleteVehicle);
router.get('/vehicles',authenticateToken,
  authorizeRole(['ADMIN','EMPLOYE']), vehicleController.getAllVehicles);
router.get('/vehicles/:id', authenticateToken,
  authorizeRole(['ADMIN','EMPLOYE']),vehicleController.getVehicleById);

export default router;
