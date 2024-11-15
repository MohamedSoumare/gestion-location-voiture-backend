import prisma from '../config/db.js';

const customerController = {
  addCustomer: async (req, res) => {
    const { fullName, address, phoneNumber, nni, birthDate, drivingLicense } =
      req.body;
    // const user_id = req.user.user_id;

    // if (!user_id) {
    //   return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    // }
    try {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          OR: [{ phoneNumber }, { nni: String(nni) }, { drivingLicense }],
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
        return res.status(400).json({ error: 'Format de date de naissance invalide. Utilisez le format YYYY-MM-DD.' });
      }
      
      const customer = await prisma.customer.create({
        data: {
          fullName,
          address,
          phoneNumber,
          nni: String(nni),
          birthDate: new Date(parsedDate),
          drivingLicense,
        },
      });
      return res.status(201).json(customer);
    } catch (error) {
      console.error('Erreur lors de la création du client :', error);
      return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  },
  updateCustomer: async (req, res) => {
    const customerId = parseInt(req.params.id, 10);
    const { fullName, address, phoneNumber, nni, birthDate, drivingLicense } =
      req.body;
    // const user_id = req.user.user_id;
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) {
        return res.status(404).json({ error: 'Client non trouvé.' });
      }
      // if (customer.user_id !== user_id) {
      //   return res
      //     .status(403)
      //     .json({ error: 'Non autorisé à modifier ce client.' });
      // }

      // Mise à jour des informations du client
      const updatedData = {
        fullName,
        address,
        phoneNumber,
        nni,
        birthDate,
        drivingLicense,
        // user_id,
      };
      if (birthDate) {
        const parsedDate = new Date(birthDate);
        if (isNaN(parsedDate.getTime())) {
          return res
            .status(400)
            .json({ error: 'Format de date de naissance invalide' });
        }
        updatedData.birthDate = parsedDate;
      }

      const updatedCustomer = await prisma.customer.update({
        where: { id: customerId },
        data: updatedData,
      });
      return res.status(200).json(updatedCustomer);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  },

  getCustomerById: async (req, res) => {
    const customerId = parseInt(req.params.id, 10);

    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) {
        return res.status(404).json({ error: 'Client non trouvé.' });
      }
      return res.status(200).json(customer);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ errors: [{ message: error.message }] });
    }
  },

  getAllCustomers: async (req, res) => {
    try {
      const customers = await prisma.customer.findMany();
      return res.status(200).json(customers);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ errors: [{ message: error.message }] });
    }
  },

  deleteCustomer: async (req, res) => {
    const customerId = parseInt(req.params.id, 10);
  
    try {
      // Vérifier si le client existe
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) {
        return res.status(404).json({ error: 'Client non trouvé.' });
      }
  
      // Vérifier si le client a des réservations
      const existingReservations = await prisma.reservation.findMany({
        where: {
          customer_id: customerId,
          status: 'confirmed', // Vous pouvez ajuster le statut selon vos besoins
        },
      });
  
      // Vérifier si le client a des contrats de location
      const existingContracts = await prisma.rentalContract.findMany({
        where: {
          customer_id: customerId,
          status: 'validate',
        },
      });
  
      if (existingReservations.length > 0 || existingContracts.length > 0) {
        return res.status(400).json({
          error: 'Impossible de supprimer le client car il a des réservations ou des contrats de location actifs.',
        });
      }
  
      await prisma.customer.delete({ where: { id: customerId } });
      return res.status(200).json({ message: 'Client supprimé avec succès.' });
    } catch (error) {
      console.error('Erreur lors de la suppression du client :', error);
      return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  },
};

export default customerController;
