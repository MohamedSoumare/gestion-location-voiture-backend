import express from 'express';
import vehicleController from '../controllers/vehicleControllers.js';
import { validateVehicleData } from '../validators/vehicleValidators.js';
// import authenticateToken from '../middlewares/authMiddleware.js'; 

const router = express.Router();


router.post('/vehicles/add', validateVehicleData, vehicleController.addVehicle);
router.put('/vehicles/edit/:id', validateVehicleData, vehicleController.updateVehicle);
router.delete('/vehicles/delete/:id', vehicleController.deleteVehicle);
router.get('/vehicles', vehicleController.getAllVehicles);
router.get('/vehicles/:id', vehicleController.getVehicleById);
    
export default router;
