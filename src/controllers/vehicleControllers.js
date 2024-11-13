import prisma from '../config/db.js';
import { validationResult } from 'express-validator';

export const vehicleController = {
  // Add a vehicle
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
        },
      });
      return res.status(201).json(vehicle);
    } catch (error) {
      console.error('Add Vehicle Error:', error.message);
      return res.status(500).json({ error: `Erreur lors de l'ajout du véhicule: ${error.message}` });
    }
  },

  // Update a vehicle
  updateVehicle: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    try {
      const vehicle = await prisma.vehicle.update({
        where: { id: parseInt(id, 10) },
        data: req.body,
      });
      return res.status(200).json(vehicle);
    } catch (error) {
      console.error('Update Vehicle Error:', error.message);
      return res.status(500).json({ error: `Erreur lors de la mise à jour du véhicule: ${error.message}` });
    }
  },

  // Retrieve all vehicles
  getAllVehicles: async (req, res) => {
    try {
      const vehicles = await prisma.vehicle.findMany();
      return res.status(200).json(vehicles);
    } catch (error) {
      console.error('Get All Vehicles Error:', error.message);
      return res.status(500).json({ error: `Erreur lors de la récupération des véhicules: ${error.message}` });
    }
  },

  // Retrieve a vehicle by ID
  getVehicleById: async (req, res) => {
    const { id } = req.params;
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: parseInt(id, 10) },
      });
      if (!vehicle) {
        return res.status(404).json({ message: 'Véhicule non trouvé.' });
      }
      return res.status(200).json(vehicle);
    } catch (error) {
      console.error('Get Vehicle By ID Error:', error.message);
      return res.status(500).json({ error: `Erreur lors de la récupération du véhicule: ${error.message}` });
    }
  },

  // Delete a vehicle
  deleteVehicle: async (req, res) => {
    const { id } = req.params;

    try {
      // Vérifier s'il existe des contrats pour ce véhicule
      const existingContracts = await prisma.contract.findMany({
        where: {
          vehicle_id: parseInt(id, 10),
        },
      });

      if (existingContracts.length > 0) {
        return res.status(400).json({
          error: 'Impossible de supprimer le véhicule car il est lié à un contrat de location existant.',
        });
      }

      // Vérifier s'il existe des réservations confirmées pour ce véhicule
      const existingReservations = await prisma.reservation.findMany({
        where: {
          vehicle_id: parseInt(id, 10),
          status: 'confirmed',
        },
      });

      if (existingReservations.length > 0) {
        return res.status(400).json({
          error: 'Impossible de supprimer le véhicule car il a des réservations confirmées.',
        });
      }

      // Supprimer le véhicule
      await prisma.vehicle.delete({
        where: { id: parseInt(id, 10) },
      });

      return res.status(204).json({ message: 'Véhicule supprimé avec succès.' });
    } catch (error) {
      console.error('Delete Vehicle Error:', error.message);
      return res.status(500).json({ error: `Erreur lors de la suppression du véhicule: ${error.message}` });
    } finally {
      await prisma.$disconnect();
    }
  },
};

export default vehicleController;
