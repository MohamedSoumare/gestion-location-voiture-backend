import prisma from '../config/db.js';
import { validationResult } from 'express-validator';

const contractController = {
  // Crée un nouveau contrat
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
    } = req.body;

    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    try {
      // Vérifie si le véhicule existe
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicle_id },
      });
      if (!vehicle)
        return res.status(404).json({ error: 'Véhicule introuvable.' });

      // Vérifie la disponibilité du véhicule pour les dates spécifiées
      const existingReservations = await prisma.reservation.findMany({
        where: {
          vehicle_id,
          startDate: { lte: new Date(returnDate) },
          endDate: { gte: new Date(startDate) },
        },
      });
      if (existingReservations.length > 0) {
        return res.status(400).json({
          error: 'Le véhicule est déjà réservé pour les dates sélectionnées.',
        });
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
          user_id,
        },
      });
      return res.status(201).json(contract);
    } catch (error) {
      if (
        error.code === 'P2002' &&
        error.meta?.target.includes('contractNumber')
      ) {
        return res
          .status(400)
          .json({ error: 'Le numéro de contrat existe déjà.' });
      }
      console.error('Erreur lors de la création du contrat :', error.message);
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  },

  // Récupère tous les contrats de l'utilisateur connecté
  getAllContracts: async (req, res) => {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    try {
      const contracts = await prisma.contract.findMany({
        where: { user_id },
        include: {
          vehicle: true,
          customer: true,
        },
      });
      return res.status(200).json(contracts);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  },

  // Récupère un contrat par ID
  getContractById: async (req, res) => {
    const { id } = req.params;
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    try {
      const contract = await prisma.contract.findFirst({
        where: { id: parseInt(id), user_id },
        include: {
          vehicle: true,
          customer: true,
        },
      });
      if (!contract)
        return res.status(404).json({ message: 'Contrat introuvable.' });
      return res.status(200).json(contract);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  },

  // Met à jour un contrat
  updateContract: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Erreurs de validation :', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    

    const { id } = req.params;
    const {
      contractNumber,
      startDate,
      returnDate,
      vehicle_id,
      customer_id,
      totalAmount,
      status,
    } = req.body;

    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    try {
      // Vérifie que le contrat existe et appartient à l'utilisateur connecté
      const contract = await prisma.contract.findUnique({
        where: { id: parseInt(id) },
      });

      if (!contract || contract.user_id !== user_id) {
        return res.status(404).json({
          error: 'Contrat introuvable ou non autorisé.',
        });
      }

      // Met à jour le contrat
      const updatedContract = await prisma.contract.update({
        where: { id: parseInt(id) },
        data: {
          contractNumber,
          startDate: new Date(startDate),
          returnDate: new Date(returnDate),
          vehicle_id,
          customer_id,
          totalAmount,
          status,
        },
      });

      return res.status(200).json(updatedContract);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contrat :', error.message);
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  },

  // Supprime un contrat
  deleteContract: async (req, res) => {
    const { id } = req.params;
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    try {
      const contract = await prisma.contract.findUnique({
        where: { id: parseInt(id) },
      });

      if (!contract || contract.user_id !== user_id) {
        return res.status(404).json({
          error: 'Contrat introuvable ou non autorisé.',
        });
      }

      await prisma.contract.delete({ where: { id: parseInt(id) } });
      return res
        .status(204)
        .json({ message: 'Contrat supprimé avec succès.' });
    } catch (error) {
      console.error('Erreur lors de la suppression du contrat :', error.message);
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  },
};

export default contractController;
