import prisma from '../config/db.js';
import { validationResult } from 'express-validator';

const contractController = {
  // Crée un nouveau contrat
  createContract: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { contractNumber, startDate, returnDate, totalAmount, status, vehicle_id, customer_id } = req.body;

    try {
      // Vérifie si le véhicule existe
      const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicle_id } });
      if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });

      // Vérifie la disponibilité du véhicule pour les dates spécifiées
      const existingReservations = await prisma.reservation.findMany({
        where: {
          vehicle_id,
          startDate: { lte: new Date(returnDate) },
          endDate: { gte: new Date(startDate) },
        },
      });
      if (existingReservations.length > 0) {
        return res.status(400).json({ error: 'Vehicle is already reserved for the selected dates.' });
      }

      // Crée le contrat
      const contract = await prisma.contract.create({
        data: {
          contractNumber,
          startDate: new Date(startDate),
          returnDate: returnDate ? new Date(returnDate) : null,
          totalAmount,
          status,
          vehicle_id,
          customer_id,
        },
      });
      return res.status(201).json(contract);
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target.includes('contractNumber')) {
        return res.status(400).json({ error: 'Contract number already exists.' });
      }
      console.error('Error creating contract:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Récupère tous les contrats
  getAllContracts: async (req, res) => {
    try {
      const contracts = await prisma.contract.findMany({
        include: {
          vehicle: true,
          customer: true,
        },
      });
      return res.status(200).json(contracts);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Récupère un contrat par ID
  getContractById: async (req, res) => {
    const { id } = req.params;
    try {
      const contract = await prisma.contract.findUnique({ where: { id: parseInt(id) } });
      if (!contract) return res.status(404).json({ message: 'Contract not found' });
      return res.status(200).json(contract);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Met à jour un contrat
  updateContract: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { startDate, returnDate, vehicle_id } = req.body;

    try {
      // Vérifie les conflits de réservation pour les nouvelles dates
      const conflictingReservations = await prisma.reservation.findMany({
        where: {
          vehicle_id,
          startDate: { lte: new Date(returnDate) },
          endDate: { gte: new Date(startDate) },
          NOT: { id: parseInt(id) },
        },
      });
      if (conflictingReservations.length > 0) {
        return res.status(400).json({ error: 'Vehicle is already reserved for the selected dates' });
      }

      // Met à jour le contrat
      const updatedContract = await prisma.contract.update({
        where: { id: parseInt(id) },
        data: req.body,
      });

      return res.status(200).json(updatedContract);
    } catch (error) {
      console.error('Error updating contract:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Supprime un contrat
  deleteContract: async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.contract.delete({ where: { id: parseInt(id) } });
      return res.status(204).json({ message: 'Contract deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};
export default contractController;