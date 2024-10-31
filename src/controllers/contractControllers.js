import prisma from '../config/db.js';
import { validationResult } from 'express-validator';
import { contractValidators } from '../validators/contractValidators.js';

export const contractController = {
  createContract: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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
      reservation_id,
    } = req.body;
    const user_id = req.user.id; // Récupération automatique de l'ID utilisateur

    try {
      const existingReservations = await prisma.reservation.findMany({
        where: {
          vehicle_id,
          startDate: { lte: new Date(returnDate) },
          endDate: { gte: new Date(startDate) },
        },
      });

      if (existingReservations.length > 0) {
        return res.status(400).json({
          error: 'Vehicle is already reserved for the selected dates',
        });
      }

      const contract = await prisma.contract.create({
        data: {
          contractNumber,
          startDate: new Date(startDate),
          returnDate: returnDate ? new Date(returnDate) : null,
          totalAmount,
          status,
          vehicle_id,
          customer_id,
          reservation_id,
          user_id,
        },
      });

      return res.status(201).json(contract);
    } catch (error) {
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
        include: {
          customer: true,
          vehicle: true,
          reservation: true,
          user: true,
        },
      });
      if (!contract) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      return res.status(200).json(contract);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  updateContract: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      startDate,
      returnDate,
      totalAmount,
      status,
      vehicle_id,
      customer_id,
      user_id,
    } = req.body;

    try {
      const contract = await prisma.contract.findUnique({
        where: { id: parseInt(id) },
      });
      if (!contract) {
        return res.status(404).json({ message: 'Contract not found' });
      }

      const existingReservations = await prisma.reservation.findMany({
        where: {
          vehicle_id,
          startDate: { lte: new Date(returnDate) },
          endDate: { gte: new Date(startDate) },
        },
      });

      if (existingReservations.length > 0) {
        return res.status(400).json({
          error: 'Vehicle is already reserved for the selected dates',
        });
      }

      const updatedContract = await prisma.contract.update({
        where: { id: parseInt(id) },
        data: {
          startDate: new Date(startDate),
          returnDate: returnDate ? new Date(returnDate) : null,
          totalAmount,
          status,
          vehicle_id,
          customer_id,
          user_id,
        },
      });

      return res.status(200).json(updatedContract);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  deleteContract: async (req, res) => {
    const { id } = req.params;
    try {
      const contract = await prisma.contract.findUnique({
        where: { id: parseInt(id) },
      });

      if (!contract) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      await prisma.contract.delete({ where: { id: parseInt(id) } });
      return res.status(204).json({ message: 'Contract deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

export default contractController;
