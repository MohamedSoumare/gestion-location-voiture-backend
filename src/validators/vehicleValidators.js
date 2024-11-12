import { body, check } from 'express-validator';

export const validateVehicleData = [
  check('brand').optional().notEmpty().withMessage('La marque est requise.'),
  check('model').optional().notEmpty().withMessage('Le modèle est requis.'),
  check('year')
    .optional()
    .isInt()
    .withMessage('L\'année doit être un entier valide.'),
  check('registrationPlate')
    .optional()
    .notEmpty()
    .withMessage('Le numéro d\'immatriculation est requis.'),
  check('seatCount')
    .optional()
    .isInt()
    .withMessage('Le nombre de sièges doit être un entier.'),
  check('doorCount')
    .optional()
    .isInt()
    .withMessage('Le nombre de portes doit être un entier.'),
  check('color').optional().notEmpty().withMessage('La couleur est requise.'),
  check('fuelType')
    .optional()
    .notEmpty()
    .withMessage('Le type de carburant est requis.'),
  check('transmissionType')
    .optional()
    .notEmpty()
    .withMessage('Le type de transmission est requis.'),
  check('dailyRate')
    .optional()
    .isDecimal()
    .withMessage('Le tarif journalier doit être un nombre décimal.'),
];
