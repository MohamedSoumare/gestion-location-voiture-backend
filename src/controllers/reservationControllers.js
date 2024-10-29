import prisma from '../config/db.js';
import { validationResult } from 'express-validator';
import { reservationValidators } from '../validators/reservationValidators.js';

export const reservationController = {
  createReservation: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { vehicle_id, customer_id, startDate, endDate, totalAmount, status, user_id } = req.body;

    try {
      const existingReservations = await prisma.reservation.findMany({
        where: {
          vehicle_id,
          startDate: { lte: new Date(endDate) },
          endDate: { gte: new Date(startDate) },
        },
      });

      if (existingReservations.length > 0) {
        return res.status(400).json({
          error: 'Vehicle is already reserved for the selected dates',
        });
      }

      const reservation = await prisma.reservation.create({
        data: {
          vehicle_id,
          customer_id,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          totalAmount,
          status,
          user_id,
        },
      });

      await prisma.vehicle.update({
        where: { id: vehicle_id },
        data: { status },
      });
      return res.status(201).json(reservation);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getAllReservations: async (req, res) => {
    try {
      const reservations = await prisma.reservation.findMany();
      return res.status(200).json(reservations);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getReservationById: async (req, res) => {
    const { id } = req.params;
    try {
      const reservation = await prisma.reservation.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: true,
        },
      });
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
      return res.status(200).json(reservation);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  updateReservation: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { startDate, endDate, totalAmount, status, user_id } = req.body;

    try {
      const reservation = await prisma.reservation.findUnique({
        where: { id: parseInt(id) },
      });

      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      const updatedReservation = await prisma.reservation.update({
        where: { id: parseInt(id) },
        data: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          totalAmount,
          status,
          user_id,
        },
      });

      return res.status(200).json(updatedReservation);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  deleteReservation: async (req, res) => {
    const { id } = req.params;
    try {
      const reservation = await prisma.reservation.findUnique({
        where: { id: parseInt(id) },
      });

      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      await prisma.reservation.delete({
        where: { id: parseInt(id) },
      });

      return res.status(204).json({ message: 'Reservation deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

export default reservationController;
