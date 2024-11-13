import prisma from '../config/db.js';
import { validationResult } from 'express-validator';
// import { reservationValidators } from '../validators/reservationValidators.js';

export const reservationController = {
  async createReservation(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { vehicle_id, customer_id, startDate, endDate, totalAmount, status } = req.body;

    if (!vehicle_id || !customer_id || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Required fields: vehicle_id, customer_id, startDate, endDate',
      });
    }

    const startDateParsed = new Date(startDate);
    const endDateParsed = new Date(endDate);

    if (isNaN(startDateParsed) || isNaN(endDateParsed)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    try {
      // Vérifie si le véhicule est disponible pour la période spécifiée
      const existingReservations = await prisma.reservation.findMany({
        where: {
          vehicle_id,
          status: 'confirmed', // Vérifie uniquement les réservations confirmées
          OR: [
            {
              startDate: { lte: endDateParsed },
              endDate: { gte: startDateParsed },
            },
          ],
        },
      });

      // Si une réservation confirmée existe dans cette période, retourne une erreur
      if (existingReservations.length > 0) {
        return res.status(400).json({
          error: 'Vehicle is already reserved during these dates.',
        });
      }

      // Crée une nouvelle réservation si le véhicule est disponible
      const reservation = await prisma.reservation.create({
        data: {
          vehicle_id,
          customer_id,
          startDate: startDateParsed,
          endDate: endDateParsed,
          totalAmount,
          status,
        },
        include: {
          customer: true,
          vehicle: true,
        },
      });

      return res.status(201).json(reservation);
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Unique constraint failed' });
      }
      return res
        .status(500)
        .json({ error: `Failed to create reservation: ${error.message}` });
    } finally {
      await prisma.$disconnect();
    }
  },

  async getAllReservations(req, res) {
    try {
      const reservations = await prisma.reservation.findMany({
        include: {
          customer: { select: { id: true, fullName: true } },
          vehicle: { select: { id: true, brand: true, model: true } },
          user: { select: { fullName: true } },
        },
      });
      return res.status(200).json(reservations);
    } catch (error) {
      return res
        .status(500)
        .json({ error: `Failed to retrieve reservations: ${error.message}` });
    }
  },
  async getReservationById(req, res) {
    const { id } = req.params;
    try {
      const reservation = await prisma.reservation.findUnique({
        where: { id: parseInt(id) },
        include: {
          customer: true,
          vehicle: true,
          user: { select: { id: true, fullName: true } },
        },
      });
      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }
      return res.status(200).json(reservation);
    } catch (error) {
      return res
        .status(500)
        .json({ error: `Failed to retrieve reservation: ${error.message}` });
    }
  },

  async updateReservation(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { id } = req.params;
    const { vehicle_id, customer_id, startDate, endDate, totalAmount, status } = req.body;
  
    const startDateParsed = new Date(startDate);
    const endDateParsed = new Date(endDate);
  
    if (isNaN(startDateParsed) || isNaN(endDateParsed)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
  
    try {
      // Vérifie si la réservation existe
      const reservation = await prisma.reservation.findUnique({
        where: { id: parseInt(id) },
      });
      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }
  
      // Vérifie si le véhicule est disponible pour la période spécifiée
      const conflictingReservations = await prisma.reservation.findMany({
        where: {
          vehicle_id,
          status: 'confirmed',
          id: { not: parseInt(id) }, // Exclut la réservation actuelle de la recherche
          OR: [
            {
              startDate: { lte: endDateParsed },
              endDate: { gte: startDateParsed },
            },
          ],
        },
      });
  
      // Si une réservation confirmée existe pour le même véhicule dans cette période, retourne une erreur
      if (conflictingReservations.length > 0) {
        return res.status(400).json({
          error: 'Vehicle is already reserved during these dates.',
        });
      }
  
      // Mise à jour de la réservation si aucune réservation en conflit n'existe
      const updatedReservation = await prisma.reservation.update({
        where: { id: parseInt(id) },
        data: {
          vehicle_id,
          customer_id,
          startDate: startDateParsed,
          endDate: endDateParsed,
          totalAmount,
          status,
        },
      });
  
      return res.status(200).json(updatedReservation);
    } catch (error) {
      return res
        .status(500)
        .json({ error: `Failed to update reservation: ${error.message}` });
    } finally {
      await prisma.$disconnect();
    }
  },
  
  async deleteReservation(req, res) {
    const { id } = req.params;
    try {
      const reservation = await prisma.reservation.findUnique({
        where: { id: parseInt(id) },
      });
      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      await prisma.reservation.delete({ where: { id: parseInt(id) } });
      return res
        .status(204)
        .json({ message: 'Reservation deleted successfully' });
    } catch (error) {
      return res
        .status(500)
        .json({ error: `Failed to delete reservation: ${error.message}` });
    }
  },
};

export default reservationController;
