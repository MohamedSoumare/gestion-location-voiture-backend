import prisma from '../config/db.js';
import { validationResult } from 'express-validator';

export const vehicleController = {
  addVehicle: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      brand,
      model,
      year,
      registrationPlate,
      seatCount,
      doorCount,
      color,
      fuelType,
      transmissionType,
      airConditioning,
      dailyRate,
      status,
    } = req.body;

    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }
    
    try {
      const vehicle = await prisma.vehicle.create({
        data: {
          brand,
          model,
          year,
          registrationPlate,
          seatCount,
          doorCount,
          color,
          fuelType,
          transmissionType,
          airConditioning,
          dailyRate,
          status,
          user_id,
        },
      });
      return res.status(201).json(vehicle);
    } catch (error) {
      console.error('Add Vehicle Error:', error.message);
      return res.status(500).json({
        error: `Erreur lors de l'ajout du véhicule: ${error.message}`,
      });
    }
  },

  updateVehicle: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { id } = req.params;
    const user_id = req.user?.user_id;
  
    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }
  
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: parseInt(id, 10) },
      });
  
      if (!vehicle) {
        return res.status(404).json({ error: 'Véhicule non trouvé.' });
      }
  
      if (vehicle.user_id !== user_id) {
        return res.status(403).json({
          error: 'Vous n\'êtes pas autorisé à modifier ce véhicule.',
        });
      }
  
      // Préparer les données de mise à jour
      const {
        brand,
        model,
        year,
        registrationPlate,
        seatCount,
        doorCount,
        color,
        fuelType,
        transmissionType,
        airConditioning,
        dailyRate,
        status,
      } = req.body;
  
      const updateData = {};
  
      // Ajouter uniquement les champs présents dans req.body
      if (brand) updateData.brand = brand;
      if (model) updateData.model = model;
      if (year) updateData.year = year;
      if (registrationPlate) updateData.registrationPlate = registrationPlate;
      if (seatCount) updateData.seatCount = seatCount;
      if (doorCount) updateData.doorCount = doorCount;
      if (color) updateData.color = color;
      if (fuelType) updateData.fuelType = fuelType;
      if (transmissionType) updateData.transmissionType = transmissionType;
      if (typeof airConditioning !== 'undefined') {updateData.airConditioning = airConditioning;}      
      if (dailyRate) updateData.dailyRate = dailyRate;
      if (status) updateData.status = status;
  
      // Mettre à jour le véhicule avec les données filtrées
      const updatedVehicle = await prisma.vehicle.update({
        where: { id: parseInt(id, 10) },
        data: updateData,
      });
  
      return res.status(200).json(updatedVehicle);
    } catch (error) {
      console.error('Update Vehicle Error:', error.message);
      return res.status(500).json({
        error: `Erreur lors de la mise à jour du véhicule: ${error.message}`,
      });
    }
  },
  
  // Retrieve all vehicles
  getAllVehicles: async (req, res) => {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    try { const vehicles = await prisma.vehicle.findMany({
      where: { user_id }, 
    });
      //  const vehicles = await prisma.vehicle.findMany();
    return res.status(200).json(vehicles);
    } catch (error) {
      console.error('Get All Vehicles Error:', error.message);
      return res.status(500).json({
        error: `Erreur lors de la récupération des véhicules: ${error.message}`,
      });
    }
  },

  // Retrieve a vehicle by ID
  getVehicleById: async (req, res) => {
    const { id } = req.params;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    try {
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          id: parseInt(id, 10),
          user_id,
        },
      });
      if (!vehicle) {
        return res.status(404).json({
          error: 'Véhicule introuvable ou accès non autorisé.',
        });
      }

      return res.status(200).json(vehicle);
    } catch (error) {
      console.error('Get Vehicle By ID Error:', error.message);
      return res.status(500).json({
        error: `Erreur lors de la récupération du véhicule: ${error.message}`,
      });
    }
  },

  // deleteVehicle: async (req, res) => {
  //   const { id } = req.params;
  //   const user_id = req.user?.user_id;
  
  //   if (!user_id) {
  //     return res.status(401).json({ error: 'Utilisateur non authentifié.' });
  //   }
  
  //   try {
  //     const vehicle = await prisma.vehicle.findUnique({
  //       where: { id: parseInt(id, 10) },
  //     });
  
  //     if (!vehicle) {
  //       return res.status(404).json({ error: 'Véhicule non trouvé.' });
  //     }
  
  //     if (vehicle.user_id !== user_id) {
  //       return res.status(403).json({
  //         error: 'Vous n\'êtes pas autorisé à supprimer ce véhicule.',
  //       });
  //     }
  
  //     // Vérifier si le véhicule est lié à un contrat ou une réservation
  //     const existingContracts = await prisma.contract.findMany({
  //       where: { vehicle_id: parseInt(id, 10) },
  //     });
  
  //     const existingReservations = await prisma.reservation.findMany({
  //       where: {
  //         vehicle_id: parseInt(id, 10),
  //         status: 'CONFIRMER',
  //       },
  //     });
  
  //     if (existingContracts.length > 0) {
  //       return res.status(400).json({
  //         error:
  //           'Impossible de supprimer le véhicule car il est lié à un contrat de location.',
  //       });
  //     }
  
  //     if (existingReservations.length > 0) {
  //       return res.status(400).json({
  //         error:
  //           'Impossible de supprimer le véhicule car il a des réservations confirmées.',
  //       });
  //     }
  
  //     // Supprimer le véhicule
  //     await prisma.vehicle.delete({
  //       where: { id: parseInt(id, 10) },
  //     });
  
  //     return res.status(200).json({ message: 'Véhicule supprimé avec succès.' });
  //   } catch (error) {
  //     console.error('Delete Vehicle Error:', error.message);
  //     return res.status(500).json({
  //       error: `Erreur lors de la suppression du véhicule: ${error.message}`,
  //     });
  //   }
  // },

  deleteVehicle: async (req, res) => {
    const { id } = req.params;
  
    try {
      const vehicleId = parseInt(id, 10);
  
      // Vérifier si le véhicule existe
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
      });
  
      if (!vehicle) {
        return res.status(404).json({ error: 'Véhicule non trouvé.' });
      }
  
      // Vérifier s'il est lié à des contrats ou des réservations
      const [linkedContracts, linkedReservations] = await Promise.all([
        prisma.contract.findMany({ where: { vehicle_id: vehicleId } }),
        prisma.reservation.findMany({
          where: { vehicle_id: vehicleId},
        }),
      ]);
  
      if (linkedContracts.length > 0) {
        return res.status(400).json({
          error: 'Impossible de supprimer : véhicule lié à un contrat.',
        });
      }
  
      if (linkedReservations.length > 0) {
        return res.status(400).json({
          error: 'Impossible de supprimer : véhicule lié à une réservation.',
        });
      }
  
      // Suppression
      await prisma.vehicle.delete({
        where: { id: vehicleId },
      });
  
      return res.status(200).json({ message: 'Véhicule supprimé avec succès.' });
    } catch (error) {
      console.error('Erreur suppression véhicule:', error.message);
      return res.status(500).json({
        error: 'Erreur interne lors de la suppression du véhicule.',
      });
    }
  },
  
};

export default vehicleController;
