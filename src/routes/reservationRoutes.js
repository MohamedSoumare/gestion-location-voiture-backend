import express from 'express';
import { reservationController } from '../controllers/reservationControllers.js';
import { reservationValidators } from '../validators/reservationValidators.js';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.post(
  '/reservations/add',
  authenticateToken,
  authorizeRole(['ADMIN','EMPLOYE']),
  reservationValidators,
  reservationController.createReservation
);
router.get('/reservations',authenticateToken,authorizeRole(['ADMIN','EMPLOYE']), reservationController.getAllReservations);

router.get('/reservations/:id',authenticateToken,authorizeRole(['ADMIN','EMPLOYE']),reservationController.getReservationById);
router.get('/reservations/status/:id',authenticateToken,authorizeRole(['ADMIN','EMPLOYE']),reservationController.updateReservationStatus);

router.put(
  '/reservations/edit/:id', authenticateToken,
  authorizeRole(['ADMIN','EMPLOYE']),
  reservationValidators,
  reservationController.updateReservation
);
router.delete(
  '/reservations/delete/:id', authenticateToken,
  authorizeRole(['ADMIN']),
  reservationController.deleteReservation
);

export default router;
