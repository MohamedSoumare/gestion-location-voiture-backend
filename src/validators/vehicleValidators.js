import { check, validationResult } from 'express-validator';
import prisma from '../config/db.js';

// Middleware pour gérer les erreurs de validation
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.param,
      message: err.msg,
    }));
    return res.status(400).json({
      success: false,
      message:
        'Certains champs contiennent des erreurs. Veuillez les corriger.',
      errors: extractedErrors,
    });
  }
  next();
};

export const createVehicleValidators = [
  // Validation de la marque
  check('brand')
    .notEmpty()
    .withMessage('La marque est obligatoire.')
    .matches(/^[A-Za-z]+( [A-Za-z]+)*$/)
    .withMessage('La marque ne peut contenir que des lettres et des espaces.'),

  // Validation du modèle
  check('model')
    .notEmpty()
    .withMessage('Le modèle est obligatoire.')
    .matches(/^(?=.*[A-Za-z0-9])[A-Za-z0-9. ]+$/)
    .withMessage(
      'Le modèle ne peut contenir que des lettres, chiffres, espaces, et points, et doit inclure au moins un caractère alphanumérique.'
    ),

  // Validation de l'année
  check('year')
    .notEmpty()
    .withMessage('L\'année du véhicule est obligatoire.')
    .isInt({ min: 2000, max: new Date().getFullYear() })
    .withMessage(
      `L'année doit être un entier compris entre 2000 et ${new Date().getFullYear()}.`
    ),

  // Validation de la plaque d'immatriculation
  check('registrationPlate')
    .notEmpty()
    .withMessage('La plaque d\'immatriculation est obligatoire.')
    .matches(/^\d{4}\s[A-Z]{2}\s\d{2}$/i)
    .withMessage(
      'Le numéro d\'immatriculation doit suivre le format 1234 XX 00 (4 chiffres, 2 lettres alphabétiques, puis 2 chiffres).'
    )
    .custom(async (value) => {
      const existingVehicle = await prisma.vehicle.findFirst({
        where: { registrationPlate: value },
      });
      if (existingVehicle) {
        throw new Error('Cette plaque d\'immatriculation est déjà utilisée.');
      }
    }),

  // Validation du nombre de sièges
  check('seatCount')
    .notEmpty()
    .withMessage('Le nombre de sièges est obligatoire.')
    .isInt({ min: 1 })
    .withMessage('Le nombre de sièges doit être un entier positif.'),

  // Validation du nombre de portes
  check('doorCount')
    .notEmpty()
    .withMessage('Le nombre de portes est obligatoire.')
    .isInt({ min: 1 })
    .withMessage('Le nombre de portes doit être un entier positif.'),

  // Validation de la couleur
  check('color')
    .notEmpty()
    .withMessage('La couleur est obligatoire.')
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/)
    .withMessage('La couleur doit être une chaîne de caractères valide.'),

  check('fuelType')
    .notEmpty()
    .withMessage('Le type de carburant est obligatoire.')
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/)
    .withMessage(
      'Le type de carburant doit être une chaîne de caractères valide.'
    ),

  // Validation du type de transmission
  check('transmissionType')
    .notEmpty()
    .withMessage('Le type de transmission est obligatoire.')
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/)
    .withMessage(
      'Le type de transmission doit être une chaîne de caractères valide.'
    ),

  check('dailyRate')
    .notEmpty()
    .withMessage('Le tarif journalier est obligatoire.')
    .isFloat({ min: 0.01 })
    .withMessage(
      'Le tarif journalier doit être un nombre décimal valide supérieur à zéro.'
    ),

  handleValidationErrors,
];

export const updateVehicleValidators = [
  check('brand')
    .optional()
    .matches(/^[A-Za-z]+( [A-Za-z]+)*$/)
    .withMessage('La marque ne peut contenir que des lettres et des espaces.'),

  check('model')
    .optional()
    .matches(/^(?=.*[A-Za-z0-9])[A-Za-z0-9. ]+$/)
    .withMessage(
      'Le modèle ne peut contenir que des lettres, chiffres, espaces, et points, et doit inclure au moins un caractère alphanumérique.'
    ),

  check('year')
    .optional()
    .isInt({ min: 2000, max: new Date().getFullYear() })
    .withMessage(
      `L'année doit être un entier compris entre 2000 et ${new Date().getFullYear()}.`
    ),

  check('registrationPlate')
    .optional()
    .matches(/^\d{4}\s[A-Z]{2}\s\d{2}$/i)
    .withMessage(
      'Le numéro d\'immatriculation doit suivre le format 1234 XX 00 (4 chiffres, 2 lettres alphabétiques, puis 2 chiffres).'
    )
    .custom(async (value, { req }) => {
      const vehicleId = parseInt(req.params.id, 10);
      const existingVehicle = await prisma.vehicle.findFirst({
        where: {
          registrationPlate: value,
          id: { not: vehicleId },
        },
      });
      if (existingVehicle) {
        throw new Error('Cette plaque d\'immatriculation est déjà utilisée.');
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
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/)
    .withMessage('La couleur doit être une chaîne de caractères valide.'),

  check('fuelType')
    .optional()
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/)
    .withMessage(
      'Le type de carburant doit être une chaîne de caractères valide.'
    ),

  check('transmissionType')
    .optional()
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/)
    .withMessage(
      'Le type de transmission doit être une chaîne de caractères valide.'
    ),

  check('dailyRate')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage(
      'Le tarif journalier doit être un nombre décimal valide supérieur à zéro.'
    ),

  handleValidationErrors,
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

  handleValidationErrors,
];
