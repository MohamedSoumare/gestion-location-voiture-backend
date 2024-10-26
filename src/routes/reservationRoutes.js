import express from 'express';
import { listReservations, getReservation, createReservation, updateReservation, deleteReservation } from '../controllers/reservationController.js';

const router = express.Router();

router.get('/reservations', listReservations);
router.get('/reservations/:id', getReservation);
router.post('/reservations', createReservation);
router.put('/reservations/:id', updateReservation);
router.delete('/reservations/:id', deleteReservation);

export default router;
