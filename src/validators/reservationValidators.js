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

// Validateurs pour la création des réservations
export const createReservationValidators = [
  check('vehicle_id')
    .notEmpty()
    .withMessage('L\'ID du véhicule est requis.')
    .isInt()
    .withMessage('L\'ID du véhicule doit être un entier.')
    .custom(async (value) => {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: parseInt(value, 10) },
      });
      if (!vehicle) {
        throw new Error('Aucun véhicule trouvé avec cet ID.');
      }
    }),
  check('customer_id')
    .notEmpty()
    .withMessage('L\'ID du client est requis.')
    .isInt()
    .withMessage('L\'ID du client doit être un entier.')
    .custom(async (value) => {
      const customer = await prisma.customer.findUnique({
        where: { id: parseInt(value, 10) },
      });
      if (!customer) {
        throw new Error('Aucun client trouvé avec cet ID.');
      }
    }),
  check('startDate')
    .notEmpty()
    .withMessage('La date de début est requise.')
    .isISO8601()
    .toDate()
    .withMessage('La date de début doit être au format YYYY-MM-DD.'),
  check('endDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('La date de fin doit être au format YYYY-MM-DD.')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error('La date de fin doit être après la date de début.');
      }
      return true;
    }),
  check('totalAmount')
    .optional()
    .isFloat({ min: 0.01, max: 99999999.99 }) // Ajoutez la limite supérieure
    .withMessage('Le montant total doit être compris entre 0.01 et 99,999,999.99.'),

  handleValidationErrors,
];

// Validateurs pour la mise à jour des réservations
export const updateReservationValidators = [
  check('vehicle_id')
    .optional()
    .isInt()
    .withMessage('L\'ID du véhicule doit être un entier.')
    .custom(async (value) => {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: parseInt(value, 10) },
      });
      if (!vehicle) {
        throw new Error('Aucun véhicule trouvé avec cet ID.');
      }
    }),
  check('customer_id')
    .optional()
    .isInt()
    .withMessage('L\'ID du client doit être un entier.')
    .custom(async (value) => {
      const customer = await prisma.customer.findUnique({
        where: { id: parseInt(value, 10) },
      });
      if (!customer) {
        throw new Error('Aucun client trouvé avec cet ID.');
      }
    }),
  check('startDate')
    .optional()
    .isISO8601()  
    .toDate()
    .withMessage('La date de début doit être au format YYYY-MM-DD.'),
  check('endDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('La date de fin doit être au format YYYY-MM-DD.')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error('La date de fin doit être après la date de début.');
      }
      return true;
    }),
  check('totalAmount')
    .optional()
    .isFloat({ min: 0.01, max: 99999999.99 }) // Ajoutez la limite supérieure
    .withMessage('Le montant total doit être compris entre 0.01 et 99,999,999.99.'),
  handleValidationErrors,
];

// Validateurs pour la suppression des réservations
export const deleteReservationValidators = [
  check('id')
    .notEmpty()
    .withMessage('L\'ID de la réservation est requis.')
    .isInt()
    .withMessage('L\'ID de la réservation doit être un entier.')
    .custom(async (id) => {
      const reservation = await prisma.reservation.findUnique({
        where: { id: parseInt(id, 10) },
      });
      if (!reservation) {
        throw new Error('Aucune réservation trouvée avec cet ID.');
      }
    }),
  handleValidationErrors,
];
