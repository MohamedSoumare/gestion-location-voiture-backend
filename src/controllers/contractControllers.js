import prisma from '../config/db.js';
import { validationResult } from 'express-validator';


const contractController = {
  createContract: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const {
      contractNumber,
      startDate: start,
      returnDate: end,
      totalAmount,
      vehicle_id,
      customer_id,
      status,
    } = req.body;
  
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ errors: ['Utilisateur non authentifié.'] });
    }
  
    try {
      const parsedStartDate = new Date(start);
      const parsedReturnDate = new Date(end);
  
      if (isNaN(parsedStartDate) || isNaN(parsedReturnDate)) {
        return res.status(400).json({ errors: ['Dates invalides fournies.'] });
      }
  
      if (parsedStartDate >= parsedReturnDate) {
        return res.status(400).json({
          errors: ['La date de début doit être antérieure à la date de fin.'],
        });
      }
  
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          vehicle_id,
          AND: [
            { startDate: { lte: parsedReturnDate } },
            { endDate: { gte: parsedStartDate } },
            {
              OR: [
                { status: 'CONFIRMER', NOT: { customer_id } },
                {
                  customer_id,
                  status: { in: ['EN_ATTENTE',' ANNULER'] },
                },
              ],
            },
          ],
        },
      });
  
      if (existingReservation) {
        const conflictStart = new Date(existingReservation.startDate).toLocaleDateString();
        const conflictEnd = new Date(existingReservation.endDate).toLocaleDateString();
        return res.status(409).json({
          errors: [
            `Conflit détecté : une réservation existante couvre la période du ${conflictStart} au ${conflictEnd}. Veuillez sélectionner une autre période ou un autre véhicule.`,
          ],
        });
      }

      const newContract = await prisma.contract.create({
        data: {
          contractNumber,
          vehicle_id,
          customer_id,
          startDate: parsedStartDate,
          returnDate: parsedReturnDate,
          totalAmount,
          user_id,
          status,
        },
      });
  
      return res.status(201).json({
        message: 'Contrat créé avec succès.',
        contract: newContract,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ errors: ['Numéro de contrat déjà utilisé.'] });
      }
      console.error('Erreur lors de la création du contrat :', error.message);
      return res.status(500).json({
        errors: ['Une erreur interne est survenue. Veuillez réessayer plus tard.'],
      });
    }
  },
  
  // createContract: async (req, res) => {
  //   const errors = validationResult(req);
  //   if (!errors.isEmpty()) {
  //     return res.status(400).json({ errors: errors.array() });
  //   }
  
  //   const {
  //     contractNumber,
  //     startDate: start,
  //     returnDate: end,
  //     totalAmount,
  //     vehicle_id,
  //     customer_id,
  //   } = req.body;
  
  //   const user_id = req.user?.user_id;
  //   if (!user_id) {
  //     return res.status(401).json({ errors: ['Utilisateur non authentifié.'] });
  //   }
  
  //   try {
  //     const parsedStartDate = new Date(start);
  //     const parsedReturnDate = new Date(end);
  
  //     if (isNaN(parsedStartDate) || isNaN(parsedReturnDate)) {
  //       return res.status(400).json({ errors: ['Dates invalides fournies.'] });
  //     }
  
  //     if (parsedStartDate >= parsedReturnDate) {
  //       return res
  //         .status(400)
  //         .json({ errors: ['La date de début doit être antérieure à la date de fin.'] });
  //     }
  
  //     const existingReservation = await prisma.reservation.findFirst({
  //       where: {
  //         vehicle_id,
  //         AND: [
  //           { startDate: { lte: parsedReturnDate } },
  //           { endDate: { gte: parsedStartDate } },
  //           {
  //             OR: [
  //               { status: 'CONFIRMER', NOT: { customer_id } },
  //               {
  //                 customer_id,
  //                 status: { in: ['EN_ATTENTE', 'ANNULER'] },
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //     });
  
  //     if (existingReservation) {
  //       return res.status(400).json({
  //         errors: [
  //           `Un conflit a été détecté avec une réservation existante pour ce véhicule. 
  //           La réservation actuelle couvre la période du ${existingReservation.startDate} 
  //           au ${existingReservation.endDate}. Veuillez sélectionner une autre période ou un autre véhicule.`,
  //         ],
  //       });
  //     }
      
  
  //     const newContract = await prisma.contract.create({
  //       data: {
  //         contractNumber,
  //         vehicle_id,
  //         customer_id,
  //         startDate: parsedStartDate,
  //         returnDate: parsedReturnDate,
  //         totalAmount,
  //         user_id,
  //         status: 'EN_ATTENTE',
  //       },
  //     });
  
  //     return res.status(201).json({
  //       message: 'Contrat créé avec succès.',
  //       contract: newContract,
  //     });
  //   } catch (error) {
  //     if (error.code === 'P2002') {
  //       return res.status(400).json({ errors: ['Numéro de contrat déjà utilisé.'] });
  //     }
  //     console.error('Erreur lors de la création du contrat :', error.message);
  //     return res.status(500).json({
  //       errors: ['Une erreur interne est survenue. Veuillez réessayer plus tard.'],
  //     });
  //   }
  // },
  updateContract: async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ erreurs: errors.array() });
    }
  
    const { id } = req.params;
    const {
      contractNumber,
      startDate,
      returnDate,
      vehicle_id,
      customer_id,
      totalAmount,
    } = req.body;
  
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({
        erreurs: [{ message: 'Utilisateur non authentifié.' }],
      });
    }
  
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        erreurs: [{ message: 'ID de contrat invalide.' }],
      });
    }
  
    try {
      // Vérification de l'existence du contrat
      const contract = await prisma.contract.findUnique({
        where: { id: parseInt(id) },
      });
  
      if (!contract) {
        return res.status(404).json({
          erreurs: [{ message: 'Contrat introuvable ou non autorisé.' }],
        });
      }
  
      // Validation des dates
      const parsedStartDate = new Date(startDate);
      const parsedReturnDate = new Date(returnDate);
  
      if (isNaN(parsedStartDate) || isNaN(parsedReturnDate)) {
        return res.status(400).json({
          erreurs: [{ message: 'Dates invalides fournies.' }],
        });
      }
  
      if (parsedStartDate >= parsedReturnDate) {
        return res.status(400).json({
          erreurs: [
            { message: 'La date de début doit être antérieure à la date de fin.' },
          ],
        });
      }
  
      // Vérification des conflits
      const conflictingContract = await prisma.contract.findFirst({
        where: {
          vehicle_id,
          id: { not: parseInt(id) }, // Exclut le contrat en cours de mise à jour
          AND: [
            { startDate: { lte: parsedReturnDate } },
            { returnDate: { gte: parsedStartDate } },
          ],
        },
      });
  
      if (conflictingContract) {
        const conflictStart = new Date(conflictingContract.startDate).toLocaleDateString();
        const conflictEnd = new Date(conflictingContract.returnDate).toLocaleDateString();
        return res.status(409).json({
          erreurs: [
            {
              message: `Impossible de mettre à jour le contrat : un autre contrat existe pour ce véhicule entre ${conflictStart} et ${conflictEnd}.`,
            },
          ],
        });
      }
  
      // Mise à jour du contrat
      const updatedContract = await prisma.contract.update({
        where: { id: parseInt(id) },
        data: {
          contractNumber,
          startDate: parsedStartDate,
          returnDate: parsedReturnDate,
          totalAmount,
          vehicle_id,
          customer_id,
          status: contract.status,
          user_id,
        },
      });
  
      return res.status(200).json({
        message: 'Contrat mis à jour avec succès.',
        contract: updatedContract,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contrat :', error.message);
      return res.status(500).json({
        errors: [{ message: 'Une erreur interne est survenue. Veuillez réessayer plus tard.' }],
      });
    }
  },
     
  // Récupère tous les contrats de l'utilisateur connecté
  getAllContracts: async (_req, res) => {
    // const user_id = req.user?.user_id;
    // if (!user_id) {
    //   return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    // }

    try {
      const contracts = await prisma.contract.findMany({
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

  getContractById: async (req, res) => {
    const { id } = req.params;
    // const user_id = req.user?.user_id;

    // if (!user_id) {
    //   return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    // }

    try {
      // Convertit l'ID en entier
      const contractId = parseInt(id, 10);

      if (isNaN(contractId)) {
        return res.status(400).json({ error: 'ID invalide.' });
      }

      const contract = await prisma.contract.findFirst({
        where: { id: contractId},
        include: {
          vehicle: true,
          customer: true,
        },
      });

      if (!contract) {
        return res.status(404).json({ error: 'Contrat introuvable.' });
      }

      // Transforme les dates pour les envoyer au frontend
      const formattedContract = {
        ...contract,
        startDate: contract.startDate ? contract.startDate.toISOString() : null,
        returnDate: contract.returnDate
          ? contract.returnDate.toISOString()
          : null,
      };

      return res.status(200).json(formattedContract);
    } catch (error) {
      console.error(
        'Erreur lors de la récupération du contrat :',
        error.message
      );
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  },

  updateContractStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    if (!['VALIDER', 'EN_ATTENTE', 'ANNULER'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide.' });
    }

    try {
      const updatedContract = await prisma.contract.update({
        where: { id: parseInt(id, 10) },
        data: { status },
      });
      return res.status(200).json(updatedContract);
    } catch (error) {
      console.error(
        'Erreur lors de la mise à jour du statut du contrat :',
        error
      );
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

      if (!contract) {
        return res.status(404).json({
          error: 'Contrat introuvable ou non autorisé.',
        });
      }

      await prisma.contract.delete({ where: { id: parseInt(id) } });
      return res.status(204).json({ message: 'Contrat supprimé avec succès.' });
    } catch (error) {
      console.error(
        'Erreur lors de la suppression du contrat :',
        error.message
      );
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  },
};

export default contractController;
