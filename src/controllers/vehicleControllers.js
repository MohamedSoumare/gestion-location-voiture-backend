import prisma from '../config/db.js';
import { VehicleValidators } from '../validators/vehicleValidators.js';

const vehicleController = {
  addVehicle: async (req, res) => {
    const {
      brand,
      model,
      year,
      registrationPlate,
      status,
      seatCount,
      doorCount,
      color,
      fuelType,
      transmissionType,
      airConditioning,
      dailyRate,
    } = req.body;

    try {
      // Vérifier l'unicité de la plaque d'immatriculation
      await VehicleValidators.checkUniqueRegistrationPlate(registrationPlate);

      const vehicle = await prisma.vehicle.create({
        data: {
          brand,
          model,
          year,
          registrationPlate,
          status,
          seatCount,
          doorCount,
          color,
          fuelType,
          transmissionType,
          airConditioning,
          dailyRate,
        },
      });

      return res.status(201).json(vehicle);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
  updateVehicle: async (req, res) => {
    const { id } = req.params;
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: parseInt(id) },
      });

      if (!vehicle) {
        return res.status(404).json({ error: 'Véhicule non trouvé' });
      }
      if (req.body.registrationPlate) {
        await VehicleValidators.checkUniqueRegistrationPlate(
          req.body.registrationPlate,
          id
        );
      }
      const updatedVehicle = await prisma.vehicle.update({
        where: { id: parseInt(id) },
        data: {
          ...req.body,
        },
      });

      return res.status(200).json(updatedVehicle);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Supprimer un véhicule
  deleteVehicle: async (req, res) => {
    const { id } = req.params;

    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: parseInt(id) },
      });

      if (!vehicle) {
        return res.status(404).json({ error: 'Véhicule non trouvé' });
      }

      // Vérifier s'il y a des réservations ou tickets associés au véhicule
      const existingReservations = await prisma.reservation.findMany({
        where: { id_vehicle: parseInt(id) },
      });
      const existingTickets = await prisma.ticket.findMany({
        where: { id_vehicle: parseInt(id) },
      });

      if (existingReservations.length > 0 || existingTickets.length > 0) {
        return res.status(400).json({
          error:
            'Impossible de supprimer un véhicule lié à des réservations ou tickets',
        });
      }

      await prisma.vehicle.delete({ where: { id: parseInt(id) } });
      return res.status(200).json({ message: 'Véhicule supprimé avec succès' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Récupérer tous les véhicules
  getAllVehicles: async (req, res) => {
    try {
      const vehicles = await prisma.vehicle.findMany();
      return res.status(200).json(vehicles);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Récupérer un véhicule par ID
  getVehicleById: async (req, res) => {
    const { id } = req.params;

    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: parseInt(id) },
      });

      if (!vehicle) {
        return res.status(404).json({ error: 'Véhicule non trouvé' });
      }

      return res.status(200).json(vehicle);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
};

export default vehicleController;
