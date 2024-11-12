import prisma from '../config/db.js';
import { validationResult } from 'express-validator';

export const contractController = {
  createContract: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      contractNumber,
      startDate,
      returnDate,
      totalAmount,
      status,
      vehicle_id,
      customer_id,
    } = req.body;

    try {
      console.log('Creating contract with data:', req.body);

      // Check if the vehicle exists
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicle_id },
      });
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found.' });
      }

      // Check for overlapping reservations
      const existingReservations = await prisma.reservation.findMany({
        where: {
          vehicle_id,
          startDate: { lte: new Date(returnDate) },
          endDate: { gte: new Date(startDate) },
        },
      });
      if (existingReservations.length > 0) {
        return res
          .status(400)
          .json({
            error: 'Vehicle is already reserved for the selected dates.',
          });
      }

      // Create the contract
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
      // Handle unique constraint error on contractNumber
      if (
        error.code === 'P2002' &&
        error.meta &&
        error.meta.target.includes('contractNumber')
      ) {
        return res
          .status(400)
          .json({ error: 'Contract number already exists.' });
      }
      console.error('Error creating contract:', error.message);
      return res.status(500).json({ error: error.message });
    }
  },

  getAllContracts: async (req, res) => {
    try {
      const contracts = await prisma.contract.findMany();
      return res.status(200).json(contracts);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getContractById: async (req, res) => {
    const { id } = req.params;
    try {
      const contract = await prisma.contract.findUnique({
        where: { id: parseInt(id) },
      });
      if (!contract)
        return res.status(404).json({ message: 'Contract not found' });
      return res.status(200).json(contract);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  updateContract: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      contractNumber,
      startDate,
      returnDate,
      totalAmount,
      status,
      vehicle_id,
      customer_id,
    } = req.body;

    try {
      const existingContract = await prisma.contract.findUnique({
        where: { id: parseInt(id) },
      });
      if (!existingContract) {
        return res.status(404).json({ error: 'Contrat non trouvé' });
      }

      // Vérifier si le client existe
      const customer = await prisma.customer.findUnique({
        where: { id: customer_id },
      });
      if (!customer) {
        return res.status(404).json({ error: 'Client non trouvé' });
      }

      // Vérifier si le véhicule existe
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicle_id },
      });
      if (!vehicle) {
        return res.status(404).json({ error: 'Véhicule non trouvé' });
      }

      // Vérifier si le véhicule est déjà réservé aux nouvelles dates
      const conflictingReservations = await prisma.reservation.findMany({
        where: {
          vehicle_id,
          startDate: { lte: new Date(returnDate) },
          endDate: { gte: new Date(startDate) },
          NOT: { id: existingContract.id }, // Exclure la réservation actuelle pour éviter les conflits avec elle-même
        },
      });
      if (conflictingReservations.length > 0) {
        return res
          .status(400)
          .json({
            error: 'Le véhicule est déjà réservé aux dates sélectionnées',
          });
      }

      // Mise à jour du contrat
      const updatedContract = await prisma.contract.update({
        where: { id: parseInt(id) },
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

      console.log('Contract updated successfully:', updatedContract);
      return res.status(200).json(updatedContract);
    } catch (error) {
      console.error('Error updating contract:', error.message);
      return res.status(500).json({ error: error.message });
    }
  },
  deleteContract: async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.contract.delete({ where: { id: parseInt(id) } });
      return res.status(204).json({ message: 'Contract deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};
