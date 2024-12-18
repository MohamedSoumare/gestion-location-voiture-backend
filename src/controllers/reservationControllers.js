import prisma from '../config/db.js';
import { validationResult } from 'express-validator';

export const reservationController = {
  // Méthode pour créer une réservation
  async createReservation(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { vehicle_id, customer_id, startDate, endDate, totalAmount, status } = req.body;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    try {
      const startDateParsed = new Date(startDate);
      const endDateParsed = new Date(endDate);

      if (isNaN(startDateParsed) || isNaN(endDateParsed)) {
        return res.status(400).json({ error: 'Format de date invalide.' });
      }

      const existingReservations = await prisma.reservation.findMany({
        where: {
          vehicle_id,
          status: { in: ['CONFIRMER'] },
          OR: [
            {
              startDate: { lte: endDateParsed },
              endDate: { gte: startDateParsed },
            },
          ],
        },
      });

      if (existingReservations.length > 0) {
        return res.status(400).json({
          error: 'Le véhicule est déjà réservé pour les dates spécifiées.',
        });
      }

      const reservation = await prisma.reservation.create({
        data: {
          vehicle_id,
          customer_id,
          startDate: startDateParsed,
          endDate: endDateParsed,
          totalAmount,
          status: status || 'EN_ATTENTE',
          user_id,
        },
        include: {
          customer: true,
          vehicle: true,
        },
      });

      return res.status(201).json(reservation);
    } catch (error) {
      console.error('Create Reservation Error:', error.message);
      return res.status(500).json({
        error: `Erreur lors de la création de la réservation: ${error.message}`,
      });
    }
  },

  // Méthode pour récupérer une réservation par son ID
  async getReservationById(req, res) {
    const { id } = req.params; // Récupère l'ID de la réservation dans les paramètres de la requête
    const user_id = req.user?.user_id; // Récupère l'ID de l'utilisateur authentifié

    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' }); 
    }

    try {
      // Recherche la réservation dans la base de données avec l'ID donné
      const reservation = await prisma.reservation.findUnique({
        where: { id: Number(id) }, // Utilise l'ID passé dans les paramètres
        include: {
          customer: { select: { id: true, fullName: true } }, // Inclut les informations du client (id et nom complet)
          vehicle: { select: { id: true, brand: true, model: true } }, // Inclut les informations du véhicule (id, marque et modèle)
        },
      });

      // Si la réservation n'existe pas, renvoie une erreur 404
      if (!reservation) {
        return res.status(404).json({ error: 'Réservation non trouvée.' });
      }

    
    } catch (error) {
      console.error('Get Reservation By ID Error:', error.message); // Log l'erreur dans la console
      return res.status(500).json({
        error: `Erreur lors de la récupération de la réservation: ${error.message}`,
      }); // Si une erreur survient, renvoie une erreur 500 avec le message d'erreur
    }
  },

  // Méthode pour récupérer toutes les réservations
  async getAllReservations(req, res) {
    
    try {
      const reservations = await prisma.reservation.findMany({
        include: {
          customer: { select: { id: true, fullName: true } },
          vehicle: { select: { id: true, brand: true, model: true } },
        },
      });
      return res.status(200).json(reservations);
    } catch (error) {
      console.error('Get All Reservations Error:', error.message);
      return res.status(500).json({
        error: `Erreur lors de la récupération des réservations: ${error.message}`,
      });
    }
  },

  async updateReservation(req, res) {
    // Validation des erreurs dans la requête
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { vehicle_id, customer_id, startDate, endDate, totalAmount, status } = req.body;
    const user_id = req.user?.user_id; 

    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    try {
      // Vérification si l'ID est un entier valide
      const reservationId = parseInt(id);
      if (isNaN(reservationId)) {
        return res.status(400).json({ error: 'L\'ID de la réservation doit être un entier valide.' });
      }

      // Recherche de la réservation existante
      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
      });

      if (!reservation) {
        return res.status(404).json({ error: 'Réservation non trouvée.' });
      }
      
    
      
      // Conversion et validation des dates
      const startDateParsed = new Date(startDate);
      const endDateParsed = new Date(endDate);

      if (isNaN(startDateParsed.getTime()) || isNaN(endDateParsed.getTime())) {
        return res.status(400).json({ error: 'Format de date invalide.' });
      }

      if (startDateParsed >= endDateParsed) {
        return res.status(400).json({ error: 'La date de début doit être antérieure à la date de fin.' });
      }

      // Vérification des conflits avec d'autres réservations
      const existingReservations = await prisma.reservation.findMany({
        where: {
          vehicle_id,
          status: { in: ['CONFIRMER'] },
          id: { not: reservationId }, // Exclure la réservation actuelle
          OR: [
            {
              startDate: { lte: endDateParsed },
              endDate: { gte: startDateParsed },
            },
          ],
        },
      });

      if (existingReservations.length > 0) {
        return res.status(400).json({
          error: 'Le véhicule est déjà réservé pour les dates spécifiées.',
        });
      }
      console.log('Données reçues :', req.body);
      console.log('ID de la réservation :', req.params.id);
      
      // Mise à jour de la réservation
      const updatedReservation = await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          customer_id: parseInt(customer_id),
          vehicle_id: parseInt(vehicle_id),
          startDate: startDateParsed,
          endDate: endDateParsed,
          totalAmount: parseFloat(totalAmount),
          status: status,
        },
      });
      
      return res.status(200).json(updatedReservation);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réservation:', error.message);
      return res.status(500).json({ error: `Erreur lors de la mise à jour: ${error.message}` });
    }
  },

  // Méthode pour mettre à jour le statut d'une réservation
  async updateReservationStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }
    if (!['CONFIRMER', 'EN_ATTENTE', 'ANNULLER'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide.' });
    }

    try {
      const updatedStatus = await prisma.reservation.update({
        where: { id: Number(id) },
        data: { status },
      });

      return res.status(200).json(updatedStatus);
    } catch (error) {
      console.error('Update Reservation Status Error:', error.message);
      return res.status(500).json({
        error: `Erreur lors de la mise à jour du statut: ${error.message}`,
      });
    }
  },

  // Méthode pour supprimer une réservation
  async deleteReservation(req, res) {
    const { id } = req.params;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    try {
      const reservation = await prisma.reservation.findUnique({
        where: { id: Number(id) },
      });

      if (!reservation) {
        return res.status(403).json({ error: 'Reservation non trouvé.' });
      }

      if (reservation.status === 'CONFIRMER') {
        return res
          .status(400)
          .json({
            error: 'Impossible de supprimer une réservation confirmée.',
          });
      }

      await prisma.reservation.delete({ where: { id: Number(id) } });
      return res.status(204).send();
    } catch (error) {
      console.error('Delete Reservation Error:', error.message);
      return res
        .status(500)
        .json({ error: `Erreur lors de la suppression: ${error.message}` });
    }
  },
};

export default reservationController;
