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
      user_id,
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
          user_id,
        },
      });
      return res.status(201).json(vehicle);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  updateVehicle: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const dataToUpdate = {};

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
      return res.status(500).json({ error: error.message });
    }
  },
  getAllVehicles: async (req, res) => {
    try {
      const vehicles = await prisma.vehicle.findMany();
      return res.status(200).json(vehicles);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getVehicleById: async (req, res) => {
    const { id } = req.params;
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: parseInt(id, 10) },
      });
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      return res.status(200).json(vehicle);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  deleteVehicle: async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.vehicle.delete({
        where: { id: parseInt(id, 10) },
      });
      return res.status(204).json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

export default vehicleController;
