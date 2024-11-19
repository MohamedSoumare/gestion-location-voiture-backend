import { check } from 'express-validator';
import prisma from '../config/db.js';

export const validateVehicleData = [
  check('brand').optional().notEmpty().withMessage('La marque est requise.'),
  check('model')
    .optional()
    .notEmpty()
    .withMessage('Le modèle est requis.')
    .isString()
    .withMessage('Le modèle doit être une chaîne de caractères.'),
  check('year')
    .optional()
    .isInt()
    .withMessage('L\'année doit être un entier valide.'),
  check('registrationPlate')
    .optional()
    .notEmpty()
    .withMessage('Le numéro d\'immatriculation est requis.')
    .custom(async (value, { req }) => {
      const id = req.params.id ? parseInt(req.params.id, 10) : null;

      // Rechercher une plaque d'immatriculation existante sauf pour le véhicule actuel en modification
      const existingVehicle = await prisma.vehicle.findFirst({
        where: {
          registrationPlate: value,
          ...(id ? { id: { not: id } } : {}),
        },
      });

      if (existingVehicle) {
        throw new Error('Ce numéro d\'immatriculation est déjà utilisé.');
      }
    }),
  check('seatCount')
    .optional()
    .isInt()
    .withMessage('Le nombre de sièges doit être un entier.'),
  check('doorCount')
    .optional()
    .isInt()
    .withMessage('Le nombre de portes doit être un entier.'),
  check('color')
    .optional()
    .notEmpty()
    .withMessage('La couleur est requise.')
    .isString()
    .withMessage('La couleur doit être une chaîne de caractères.'),
  check('fuelType')
    .optional()
    .notEmpty()
    .withMessage('Le type de carburant est requis.')
    .isString()
    .withMessage('Le type de carburant doit être une chaîne de caractères.'),
  check('transmissionType')
    .optional()
    .notEmpty()
    .withMessage('Le type de transmission est requis.')
    .isString()
    .withMessage('Le type de transmission doit être une chaîne de caractères.'),
  check('dailyRate')
    .optional()
    .isDecimal()
    .withMessage('Le tarif journalier doit être un nombre décimal.'),
];
