import prisma from '../config/db.js';
import { validationResult } from 'express-validator';

const customerController = {
 
  addCustomer: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { fullName, address, phoneNumber, nni, birthDate, drivingLicense } =
      req.body;

    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }
    try {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          OR: [{ phoneNumber }, { nni: String(nni) }, { drivingLicense }],
          user_id,
        },
      });

      if (existingCustomer) {
        return res.status(400).json({
          error:
            'Le numéro de téléphone, NNI ou permis de conduire est déjà utilisé.',
        });
      }

      const parsedDate = Date.parse(birthDate);
      if (isNaN(parsedDate)) {
        return res.status(400).json({
          error:
            'Format de date de naissance invalide. Utilisez le format YYYY-MM-DD.',
        });
      }

      const customer = await prisma.customer.create({
        data: {
          fullName,
          address,
          phoneNumber,
          nni: String(nni),
          birthDate: new Date(parsedDate),
          drivingLicense,
          user_id,
        },
      });

      return res.status(201).json(customer);
    } catch (error) {
      console.error('Erreur lors de la création du client :', error.message);
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  },

  updateCustomer: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map(err => {
        // Construire un message d'erreur plus détaillé
          return err.param
            ? `${err.msg} (Champ : ${err.param})`
            : `${err.msg}`;
        }),
      });
    }
  
    console.log('Données reçues :', req.body);

    const customerId = parseInt(req.params.id, 10);
    const { fullName, address, phoneNumber, nni, birthDate, drivingLicense } =
    req.body;

    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        return res.status(404).json({ error: 'Client non trouvé.' });
      }

      if (customer.user_id !== user_id) {
        return res
          .status(403)
          .json({ error: 'Non autorisé à modifier ce client.' });
      }

      const updatedData = {};
      if (fullName) updatedData.fullName = fullName.trim();
      if (address) updatedData.address = address.trim();
      if (phoneNumber) updatedData.phoneNumber = phoneNumber;
      if (nni) updatedData.nni = nni;
      if (birthDate) updatedData.birthDate = new Date(birthDate);
      if (drivingLicense) updatedData.drivingLicense = drivingLicense.trim();

      const updatedCustomer = await prisma.customer.update({
        where: { id: customerId },
        data: updatedData,
      });

      return res.status(200).json(updatedCustomer);
    } catch (error) {
      console.error('Erreur lors de la mise à jour :', error.message);

      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Client introuvable.' });
      }
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  },
   
  // Récupérer un client par ID
  getCustomerById: async (req, res) => {
    const customerId = parseInt(req.params.id, 10);
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    try {
      const customer = await prisma.customer.findFirst({
        where: { id: customerId, user_id },
        include: {
          reservations: true,
          contracts: true,
        },
      });

      if (!customer) {
        return res.status(404).json({ error: 'Client non trouvé.' });
      }

      return res.status(200).json(customer);
    } catch (error) {
      console.error('Erreur lors de la récupération du client :', error.message);
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  },

  // Récupérer tous les clients de l'utilisateur
  getAllCustomers: async (req, res) => {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    try {
      const customers = await prisma.customer.findMany({
        where: { user_id },
      });

      return res.status(200).json(customers);
    } catch (error) {
      console.error('Erreur lors de la récupération des clients :', error.message);
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  },
  deleteCustomer: async (req, res) => {
    const customerId = parseInt(req.params.id, 10);
    const user_id = req.user?.user_id;
  
    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }
  
    try {
      // Vérifie si le client existe
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });
  
      if (!customer) {
        return res.status(404).json({ error: 'Client non trouvé.' });
      }
  
      // Vérifie si l'utilisateur est autorisé
      if (customer.user_id !== user_id) {
        return res
          .status(403)
          .json({ error: 'Non autorisé à supprimer ce client.' });
      }
  
      // Vérifie si le client a des réservations actives
      const hasActiveReservations = await prisma.reservation.findFirst({
        where: {
          customer_id: customerId,
          status: {
            in: ['CONFIRMER', 'EN_ATTENTE', 'MAINTENANCE', 'ANNULER'],
          },
        },
      });
  
      // Vérifie si le client a des contrats actifs
      const hasActiveContracts = await prisma.contract.findFirst({
        where: {
          customer_id: customerId,
          status: {
            in: ['VALIDER', 'EN_ATTENTE', 'ANNULER'],
          },
        },
      });
  
      if (hasActiveReservations || hasActiveContracts) {
        return res.status(400).json({
          errorCode: 'RESERVATIONS_OR_CONTRACTS_ACTIVE',
          error:
            'Impossible de supprimer le client car il a des réservations ou des contrats actifs.',
        });
      }
  
      // Supprime le client
      await prisma.customer.delete({ where: { id: customerId } });
  
      return res.status(200).json({ message: 'Client supprimé avec succès.' });
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
  
      if (error.code === 'P2025') {
        return res.status(404).json({
          errorCode: 'CUSTOMER_NOT_FOUND',
          message: 'Le client n\'existe pas.',
        });
      }
  
      if (error.code === 'P2003') {
        return res.status(409).json({
          errorCode: 'CUSTOMER_ASSOCIATED_DATA',
          message:
            'Le client ne peut pas être supprimé car il est associé à des réservations ou des contrats.',
        });
      }
  
      return res.status(500).json({
        message: 'Une erreur est survenue lors de la suppression du client.',
      });
    }
  },
};
  
export default customerController;
