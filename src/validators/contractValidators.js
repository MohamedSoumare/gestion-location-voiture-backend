import { check, validationResult } from 'express-validator';
import prisma from '../config/db.js';
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      erreurs: errors.array().map(err => ({
        champ: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};
const validateDateNotPast = (date, fieldName) => {
  if (new Date(date) < new Date()) {
    throw new Error(`La ${fieldName} ne peut pas être dans le passé.`);
  }
};

const validateDatesNotEqual = (startDate, returnDate) => {
  if (new Date(startDate).toISOString() === new Date(returnDate).toISOString()) {
    throw new Error('La date de début et la date de retour ne peuvent pas être identiques.');
  }
};

// Validations pour la création de contrat
export const contractValidators = [
  check('contractNumber')
    .notEmpty().withMessage('Le numéro de contrat ne peut pas être vide.')
    .matches(/^MRN-CTR-\d{5}$/)
    .withMessage(
      'Le numéro de contrat doit commencer par "MRN-CTR-" suivi de 5 chiffres.'
    )
    .custom(async (contractNumber, { req }) => {
      const existingContract = await prisma.contract.findUnique({
        where: { contractNumber },
      });
      if (existingContract && existingContract.id !== Number(req.params.id)) {
        throw new Error('Un autre contrat avec ce numéro existe déjà.');
      }
    }),
  check('startDate')
    .notEmpty().withMessage('La date de début est obligatoire.')
    .isISO8601().toDate().withMessage('Le format de la date de début est invalide.')
    .custom((startDate) => {
      validateDateNotPast(startDate, 'date de début');
      return true;
    }),
  check('returnDate')
    .optional()
    .isISO8601().toDate().withMessage('Le format de la date de retour est invalide.')
    .custom((returnDate, { req }) => {
      const startDate = req.body.startDate;
      if (returnDate) {
        validateDateNotPast(returnDate, 'date de retour');
        if (startDate) {
          validateDatesNotEqual(startDate, returnDate);
          if (new Date(returnDate) < new Date(startDate)) {
            throw new Error('La date de retour doit être postérieure à la date de début.');
          }
        }
      }
      return true;
    }),
  check('status')
    .notEmpty().withMessage('Le statut est obligatoire.')
    .isIn(['VALIDER', 'ANNULER', 'EN_ATTENTE']).withMessage('Statut invalide. Les valeurs acceptées sont "VALIDER", "ANNULER" ou "EN_ATTENTE".'),
  check('customer_id')
    .isInt().withMessage('L\'identifiant du client doit être un entier.')
    .custom(async (customer_id) => {
      const customer = await prisma.customer.findUnique({
        where: { id: customer_id },
      });
      if (!customer) {
        throw new Error('Le client avec cet identifiant n\'existe pas.');
      }
    }),
  check('vehicle_id')
    .isInt().withMessage('L\'identifiant du véhicule doit être un entier.')
    .custom(async (vehicle_id) => {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicle_id },
      });
      if (!vehicle) {
        throw new Error('Le véhicule avec cet identifiant n\'existe pas.');
      }
    }),
  check('totalAmount')
    .notEmpty()
    .withMessage('Le montant est obligatoire.')
    .custom((value) => {
      // Convertir la valeur en nombre
      const num = parseFloat(value);
      // Vérifier si c'est un nombre, s'il est supérieur à zéro et s'il n'est pas NaN
      if (isNaN(num) || num <= 0) {
        throw new Error('Le montant total doit être un nombre positif supérieur à zéro.');
      }
      return true; // La validation réussit
    }),

  
  handleValidationErrors,
];

// Validations pour la mise à jour de contrat
export const updateValidatorsContract = [
  check('contractNumber')
    .optional()
    .matches(/^MRN-CTR-\d{5}$/)
    .withMessage(
      'Le numéro de contrat doit commencer par "MRN-CTR-" suivi de 5 chiffres.'
    )
    .custom(async (contractNumber, { req }) => {
      const existingContract = await prisma.contract.findUnique({
        where: { contractNumber },
      });
      if (existingContract && existingContract.id !== Number(req.params.id)) {
        throw new Error('Un autre contrat avec ce numéro existe déjà.');
      }
    }),
  check('startDate')
    .optional()
    .isISO8601().toDate().withMessage('La date de début doit être au format valide (AAAA-MM-JJ).'),
  check('returnDate')
    .optional()
    .isISO8601().toDate().withMessage('La date de retour doit être au format valide (AAAA-MM-JJ).')
    .custom((returnDate, { req }) => {
      const startDate = req.body.startDate;
      if (returnDate) {
        validateDateNotPast(returnDate, 'date de retour');
        if (startDate) {
          validateDatesNotEqual(startDate, returnDate);
          if (new Date(returnDate) < new Date(startDate)) {
            throw new Error('La date de retour doit être postérieure à la date de début.');
          }
        }
      }
      return true;
    }),
  check('status')
    .optional()
    .isIn(['VALIDER', 'ANNULER', 'EN_ATTENTE']).withMessage('Statut invalide. Les valeurs acceptées sont "VALIDER", "ANNULER" ou "EN_ATTENTE".'),
  check('customer_id')
    .optional()
    .isInt().withMessage('L\'identifiant du client doit être un entier.')
    .custom(async (customer_id) => {
      if (customer_id) {
        const customer = await prisma.customer.findUnique({
          where: { id: customer_id },
        });
        if (!customer) {
          throw new Error('Le client avec cet identifiant n\'existe pas.');
        }
      }
    }),
  check('vehicle_id')
    .optional()
    .isInt().withMessage('L\'identifiant du véhicule doit être un entier.')
    .custom(async (vehicle_id) => {
      if (vehicle_id) {
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: vehicle_id },
        });
        if (!vehicle) {
          throw new Error('Le véhicule avec cet identifiant n\'existe pas.');
        }
      }
    }),

  check('totalAmount')
    .optional() // Rend la validation facultative si le champ est vide
    .custom((value) => {
      // Convertir la valeur en nombre
      const num = parseFloat(value);
      // Vérifier si c'est un nombre, s'il est supérieur à zéro et s'il n'est pas NaN
      if (isNaN(num) || num <= 0) {
        throw new Error('Le montant total doit être un nombre positif supérieur à zéro.');
      }
      return true; // La validation réussit
    }),

  handleValidationErrors,
];

// Validations pour la suppression de contrat
export const deleteValidatorsContract = [
  check('id')
    .isInt().withMessage('L\'identifiant du contrat doit être un entier.')
    .custom(async (id) => {
      const existingContract = await prisma.contract.findUnique({
        where: { id: Number(id) },
      });
      if (!existingContract) {
        throw new Error('Le contrat avec cet identifiant n\'existe pas.');
      }
    }),
  handleValidationErrors,
];
