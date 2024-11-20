import express from 'express';
import { reservationController } from '../controllers/reservationControllers.js';
import { createReservationValidators,updateReservationValidators,handleValidationErrors,deleteReservationValidators } from '../validators/reservationValidators.js';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.post(
  '/reservations/add',
  authenticateToken,
  authorizeRole(['ADMIN','EMPLOYE']),
  createReservationValidators,handleValidationErrors,
  reservationController.createReservation
);
router.get('/reservations',authenticateToken,authorizeRole(['ADMIN','EMPLOYE']),handleValidationErrors, reservationController.getAllReservations);

router.get('/reservations/:id',authenticateToken,authorizeRole(['ADMIN','EMPLOYE']),handleValidationErrors, reservationController.getReservationById);
router.get('/reservations/status/:id',authenticateToken,authorizeRole(['ADMIN','EMPLOYE']),reservationController.updateReservationStatus);

router.put(
  '/reservations/edit/:id', authenticateToken,authorizeRole(['ADMIN','EMPLOYE']),handleValidationErrors,updateReservationValidators,
  reservationController.updateReservation
);
router.delete(
  '/reservations/delete/:id', authenticateToken,
  authorizeRole(['ADMIN']),deleteReservationValidators,
  reservationController.deleteReservation
);

export default router;
