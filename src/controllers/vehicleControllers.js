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
    // const user_id = req.user.user_id;

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
          // user_id, 
        },
      });
      return res.status(201).json(vehicle);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors de l\'ajout du véhicule: ' + error.message });
    }
  },

  // Mettre à jour un véhicule
  updateVehicle: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const dataToUpdate = {};

    // Préparer les données à mettre à jour
    for (const key in req.body) {
      if (req.body[key] !== undefined) {
        dataToUpdate[key] = req.body[key];
      }
    }

    try {
      const vehicle = await prisma.vehicle.update({
        where: { id: parseInt(id, 10) },
        data: dataToUpdate,
      });
      return res.status(200).json(vehicle);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors de la mise à jour du véhicule: ' + error.message });
    }
  },

  // Récupérer tous les véhicules
  getAllVehicles: async (req, res) => {
    try {
      const vehicles = await prisma.vehicle.findMany();
      return res.status(200).json(vehicles);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des véhicules: ' + error.message });
    }
  },

  // Récupérer un véhicule par ID
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
      return res.status(500).json({ error: 'Erreur lors de la récupération du véhicule: ' + error.message });
    }
  },

  // Supprimer un véhicule
  deleteVehicle: async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.vehicle.delete({
        where: { id: parseInt(id, 10) },
      });
      return res.status(204).json({ message: 'Véhicule supprimé avec succès.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors de la suppression du véhicule: ' + error.message });
    }
  },
};

export default vehicleController;
