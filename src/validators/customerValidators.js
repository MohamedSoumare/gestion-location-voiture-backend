import { check, validationResult } from 'express-validator';
import prisma from '../config/db.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
        suggestion: 'Veuillez fournir une entrée valide.',
      })),
    });
  }
  next();
};

export const createValidators = [
  check('fullName')
    .notEmpty()
    .withMessage('Le nom complet est requis.')
    .isLength({ max: 60 })
    .withMessage('Le nom complet ne peut pas dépasser 60 caractères.'),
  check('phoneNumber')
    .isNumeric()
    .withMessage('Le numéro de téléphone doit être numérique.')
    .isLength({ min: 8, max: 8 })
    .withMessage('Le numéro de téléphone doit comporter exactement 8 chiffres.'),
  check('nni')
    .isNumeric()
    .withMessage('Le NNI doit être numérique.')
    .isLength({ min: 10, max: 10 })
    .withMessage('Le NNI doit comporter exactement 10 chiffres.')
    .custom(async (nni, { req }) => {
      const existingCustomer = await prisma.customer.findFirst({
        where: { nni: String(nni), user_id: req.user?.user_id },
      });
      if (existingCustomer) {
        throw new Error('Le NNI est déjà utilisé.');
      }
      return true;
    }),
  check('birthDate')
    .notEmpty()
    .withMessage('La date de naissance est requise.')
    .isISO8601()
    .withMessage('La date de naissance doit être au format YYYY-MM-DD.'),
  check('drivingLicense')
    .optional()
    .matches(/^(MR-\d{7}|\d{8,10})$/)
    .withMessage('Le permis de conduire doit commencer par "MR-" suivi de 7 chiffres.'),
  handleValidationErrors,
];

export const updateValidators = [
  check('fullName')
    .optional()
    .isLength({ max: 60 })
    .withMessage('Le nom complet ne peut pas dépasser 60 caractères.'),
  check('phoneNumber')
    .optional()
    .isNumeric()
    .withMessage('Le numéro de téléphone doit être numérique.')
    .isLength({ min: 8, max: 8 })
    .withMessage('Le numéro de téléphone doit comporter exactement 8 chiffres.'),
  check('nni')
    .optional()
    .isNumeric()
    .withMessage('Le NNI doit être numérique.')
    .isLength({ min: 10, max: 10 })
    .withMessage('Le NNI doit comporter exactement 10 chiffres.')
    .custom(async (nni, { req }) => {
      const customerId = parseInt(req.params.id, 10);
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          nni: String(nni),
          user_id: req.user?.user_id,
          id: { not: customerId }, // Exclure le client actuel de la vérification
        },
      });
      if (existingCustomer) {
        throw new Error('Le NNI est déjà utilisé.');
      }
      return true;
    }),
  check('birthDate')
    .optional()
    .isISO8601()
    .withMessage('La date de naissance doit être au format YYYY-MM-DD.'),
  check('drivingLicense')
    .optional()
    .matches(/^(MR-\d{7}|\d{8,10})$/)
    .withMessage('Le permis de conduire doit commencer par "MR-" suivi de 7 chiffres.'),
  handleValidationErrors,
];

// Validateurs pour la suppression d'un client
export const deleteValidators = [
  check('id')
    .notEmpty()
    .withMessage('L\'ID est requis.')
    .isNumeric()
    .withMessage('L\'ID doit être numérique.'),
  handleValidationErrors,
];
