import express from 'express';
import { reservationController } from '../controllers/reservationControllers.js';
import {
  createReservationValidators,
  updateReservationValidators,
  handleValidationErrors,
  deleteReservationValidators,
} from '../validators/reservationValidators.js';
import {
  authenticateToken,
  authorizeRole,
} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post(
  '/reservations/add',
  authenticateToken,
  authorizeRole(['ADMIN', 'EMPLOYE']),
  createReservationValidators,
  handleValidationErrors,
  reservationController.createReservation
);
router.get(
  '/reservations',
  authenticateToken,
  authorizeRole(['ADMIN', 'EMPLOYE']),
  handleValidationErrors,
  reservationController.getAllReservations
);

router.get(
  '/reservations/:id',
  authenticateToken,
  authorizeRole(['ADMIN', 'EMPLOYE']),
  handleValidationErrors,
  reservationController.getReservationById
);

router.put(
  '/reservations/edit/:id',
  authenticateToken,
  authorizeRole(['ADMIN', 'EMPLOYE']),
  handleValidationErrors,
  updateReservationValidators,
  reservationController.updateReservation
);
router.put(
  '/reservations/status/:id',
  authenticateToken,
  authorizeRole(['ADMIN', 'EMPLOYE']),
  handleValidationErrors,
  reservationController.updateReservationStatus
);

router.delete(
  '/reservations/delete/:id',
  authenticateToken,
  authorizeRole(['ADMIN']),
  deleteReservationValidators,
  handleValidationErrors,
  reservationController.deleteReservation
);

export default router;
