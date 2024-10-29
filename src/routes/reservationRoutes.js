import express from 'express';
import { reservationController } from '../controllers/reservationControllers.js';
import { reservationValidators } from '../validators/reservationValidators.js';

const router = express.Router();

router.post(
  '/reservations/add',
  reservationValidators,
  reservationController.createReservation
);
router.get('/reservations', reservationController.getAllReservations);
router.get('/reservations/:id', reservationController.getReservationById);
router.put(
  '/reservations/edit/:id',
  reservationValidators,
  reservationController.updateReservation
);
router.delete(
  '/reservations/delete/:id',
  reservationController.deleteReservation
);

export default router;
