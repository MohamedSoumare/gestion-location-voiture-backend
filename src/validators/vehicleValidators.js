import prisma from '../config/db.js';
import { check, validationResult } from 'express-validator';

export const VehicleValidators = {
  checkUniqueRegistrationPlate: async (registrationPlate, vehicleId = null) => {
    const vehicle = await prisma.vehicle.findUnique({
      where: { registrationPlate },
    });
    if (vehicle && vehicle.id !== vehicleId) {
      throw new Error(
        'Ce numéro immatriculation est déjà utilisé pour un autre véhicule.'
      );
    }
  },
};

export const validateVehicleData = [
  check('brand').optional().notEmpty().withMessage('La marque est requise.'),
  check('model').optional().notEmpty().withMessage('Le modèle est requis.'),
  check('year')
    .optional()
    .isNumeric()
    .withMessage('Année doit être un nombre.'),

  check('registrationPlate')
    .optional()
    .notEmpty()
    .withMessage('Le numéro immatriculation est requis.')
    .custom(async (registrationPlate, { req }) => {
      await VehicleValidators.checkUniqueRegistrationPlate(
        registrationPlate,
        req.params.id
      );
    }),

  check('status')
    .optional()
    .notEmpty()
    .withMessage('Le statut du véhicule est requis.'),

  check('seatCount')
    .optional()
    .isNumeric()
    .withMessage('Le nombre de sièges doit être un nombre.'),
    
  check('doorCount')
    .optional()
    .isNumeric()
    .withMessage('Le nombre de portes doit être un nombre.'),
  check('dailyRate')
    .optional()
    .isNumeric()
    .withMessage('Le tarif journalier doit être un nombre décimal.'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
