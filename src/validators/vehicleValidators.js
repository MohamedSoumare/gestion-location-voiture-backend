import { check, validationResult } from 'express-validator';
import prisma from '../config/db.js';

// Middleware pour gérer les erreurs de validation
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      errors: extractedErrors,
    });
  }
  next();
};

export const createVehicleValidators = [
  check('brand')
    .notEmpty()
    .withMessage('La marque est requise.')
    .isString()
    .withMessage('La marque doit être une chaîne de caractères.'),
  
  check('model')
    .notEmpty()
    .withMessage('Le modèle est requis.')
    .isString()
    .withMessage('Le modèle doit être une chaîne de caractères.'),
  
  check('year')
    .notEmpty()
    .withMessage('L\'année est requise.')
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage(`L'année doit être un entier valide entre 1900 et ${new Date().getFullYear()}.`),
  
  check('registrationPlate')
    .notEmpty()
    .withMessage('Le numéro d\'immatriculation est requis.')
    .custom(async (value) => {
      const existingVehicle = await prisma.vehicle.findFirst({
        where: { registrationPlate: value },
      });
      if (existingVehicle) {
        throw new Error('Ce numéro d\'immatriculation est déjà utilisé.');
      }
    }),
  
  check('seatCount')
    .notEmpty()
    .withMessage('Le nombre de sièges est requis.')
    .isInt({ min: 1 })
    .withMessage('Le nombre de sièges doit être un entier positif.'),
  
  check('doorCount')
    .notEmpty()
    .withMessage('Le nombre de portes est requis.')
    .isInt({ min: 1 })
    .withMessage('Le nombre de portes doit être un entier positif.'),
  
  check('color')
    .notEmpty()
    .withMessage('La couleur est requise.')
    .isString()
    .withMessage('La couleur doit être une chaîne de caractères.'),
  
  check('fuelType')
    .notEmpty()
    .withMessage('Le type de carburant est requis.')
    .isString()
    .withMessage('Le type de carburant doit être une chaîne de caractères.'),

  check('transmissionType')
    .notEmpty()
    .withMessage('Le type de transmission est requis.')
    .isString()
    .withMessage('Le type de transmission doit être une chaîne de caractères.'),
  
  check('dailyRate')
    .notEmpty()
    .withMessage('Le tarif journalier est requis.')
    .isDecimal()
    .withMessage('Le tarif journalier doit être un nombre décimal avec jusqu\'à deux décimales.'),
  handleValidationErrors    
];

// Validateurs pour la mise à jour des véhicules
export const updateVehicleValidators = [
  check('brand')
    .optional()
    .isString()
    .withMessage('La marque doit être une chaîne de caractères.'),
  
  check('model')
    .optional()
    .isString()
    .withMessage('Le modèle doit être une chaîne de caractères.'),
  
  check('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage(`L'année doit être un entier valide entre 1900 et ${new Date().getFullYear()}.`),
  
  check('registrationPlate')
    .optional()
    .custom(async (value, { req }) => {
      const vehicleId = parseInt(req.params.id, 10);
      const existingVehicle = await prisma.vehicle.findFirst({
        where: {
          registrationPlate: value,
          id: { not: vehicleId },
        },
      });
      if (existingVehicle) {
        throw new Error('Ce numéro d\'immatriculation est déjà utilisé.');
      }
    }),
  
  check('seatCount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le nombre de sièges doit être un entier positif.'),
  
  check('doorCount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le nombre de portes doit être un entier positif.'),
  
  check('color')
    .optional()
    .isString()
    .withMessage('La couleur doit être une chaîne de caractères.'),
  
  check('fuelType')
    .optional()
    .isString()
    .withMessage('Le type de carburant doit être une chaîne de caractères.'),

  check('transmissionType')
    .optional()
    .isString()
    .withMessage('Le type de transmission doit être une chaîne de caractères.'),
  
  check('dailyRate')
    .optional()
    .isDecimal()
    .withMessage('Le tarif journalier doit être un nombre décimal avec jusqu\'à deux décimales.'),
  handleValidationErrors    
];

// Validateurs pour la suppression des véhicules
export const deleteVehicleValidators = [
  check('id')
    .notEmpty()
    .withMessage('L\'ID du véhicule est requis.')
    .isInt()
    .withMessage('L\'ID doit être un entier valide.')
    .custom(async (id) => {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: parseInt(id, 10) },
      });
      if (!vehicle) {
        throw new Error('Aucun véhicule trouvé avec cet ID.');
      }
    }),
  handleValidationErrors
];
