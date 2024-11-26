import { check, validationResult } from 'express-validator';
import prisma from '../config/db.js';

// Middleware pour gérer les erreurs de validation
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
        suggestion: 'Veuillez vérifier et corriger ce champ.',
      })),
    });
  }
  next();
};

// Validateurs pour la création
export const createValidators = [
  check('fullName')
    .notEmpty()
    .withMessage('Veuillez entrer un nom complet.')
    .matches(/^[A-Za-z]+( [A-Za-z]+)*$/)
    .withMessage(
      'Le nom complet doit contenir uniquement des lettres, des espaces (exemple : Jean Dupont).'
    )
    .isLength({ min: 3, max: 60 })
    .withMessage(
      'Le nom complet doit avoir entre 3 et 60 caractères (exemple : Marie-Anne Dupuis).'
    ),

  check('phoneNumber')
    .isNumeric()
    .withMessage('Le numéro de téléphone doit contenir uniquement des chiffres.')
    .isLength({ min: 8, max: 8 })
    .withMessage('Le numéro de téléphone doit comporter exactement 8 chiffres.'),

  check('nni')
    .isNumeric()
    .withMessage('Le NNI doit être un nombre.')
    .isLength({ min: 10, max: 10 })
    .withMessage('Le NNI doit comporter exactement 10 chiffres.')
    .custom(async (nni, { req }) => {
      const existingCustomer = await prisma.customer.findFirst({
        where: { nni: String(nni), user_id: req.user?.user_id },
      });
      if (existingCustomer) {
        throw new Error('Ce NNI est déjà utilisé. Veuillez vérifier vos informations.');
      }
      return true;
    }),

  check('birthDate')
    .notEmpty()
    .withMessage('Veuillez entrer une date de naissance.')
    .isISO8601()
    .withMessage(
      'La date de naissance doit être au format ISO : YYYY-MM-DD (exemple : 1990-05-20).'
    )
    .custom((birthDate) => {
      const birthYear = new Date(birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (birthYear >= 2005 && birthYear <= currentYear) {
        throw new Error(
          'Vous devez être né avant 2005. Vérifiez la date saisie.'
        );
      }
      return true;
    }),

  check('drivingLicense')
    .optional()
    .matches(/^(MR-\d{7}|\d{8,10})$/)
    .withMessage(
      'Le permis doit commencer par "MR-" suivi de 7 chiffres, ou être un numéro entre 8 et 10 chiffres.')
    .custom(async (drivingLicense, { req }) => {
      const existingLicense = await prisma.customer.findFirst({
        where: { drivingLicense: String(drivingLicense), user_id: req.user?.user_id },
      });
      if (existingLicense) {
        throw new Error(
          'Ce numéro de permis est déjà utilisé. Veuillez vérifier vos informations.'
        );
      }
      return true;
    }),
];

// Validateurs pour la mise à jour
export const updateValidators = [
  check('id')
    .notEmpty()
    .withMessage('L\'ID du client est requis.')
    .isNumeric()
    .withMessage('L\'ID doit être un nombre.')
    .custom(async (id) => {
      const customer = await prisma.customer.findUnique({ where: { id: parseInt(id, 10) } });
      if (!customer) {
        throw new Error('Aucun client trouvé avec cet ID. Vérifiez l\'ID saisi.');
      }
      return true;
    }),

  check('fullName')
    .optional()
    .matches(/^[A-Za-z]+( [A-Za-z]+)*$/)
    .withMessage(
      'Le nom complet doit contenir uniquement des lettres, des espaces (exemple : Jean Dupont).'
    )
    .isLength({ min: 3, max: 60 })
    .withMessage('Le nom complet doit avoir entre 3 et 60 caractères.'),

  check('phoneNumber')
    .optional()
    .isNumeric()
    .withMessage('Le numéro de téléphone doit être un nombre.')
    .isLength({ min: 8, max: 8 })
    .withMessage('Le numéro de téléphone doit comporter exactement 8 chiffres.'),

  check('nni')
    .optional()
    .isNumeric()
    .withMessage('Le NNI doit être un nombre.')
    .isLength({ min: 10, max: 10 })
    .withMessage('Le NNI doit comporter exactement 10 chiffres.')
    .custom(async (nni, { req }) => {
      const customerId = parseInt(req.params.id, 10);
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          nni: String(nni),
          user_id: req.user?.user_id,
          id: { not: customerId },
        },
      });
      if (existingCustomer) {
        throw new Error(
          'Ce NNI est déjà utilisé par un autre client. Veuillez vérifier vos informations.'
        );
      }
      return true;
    }),

  check('birthDate')
    .optional()
    .isISO8601()
    .withMessage(
      'La date de naissance doit être au format ISO : YYYY-MM-DD.'
    ),

  check('drivingLicense')
    .optional()
    .matches(/^(MR-\d{7}|\d{8,10})$/)
    .withMessage(
      'Le permis doit commencer par "MR-" suivi de 7 chiffres, ou être un numéro entre 8 et 10 chiffres.'
    )
    .custom(async (drivingLicense, { req }) => {
      const customerId = parseInt(req.params.id, 10);
      const existingLicense = await prisma.customer.findFirst({
        where: {
          drivingLicense: String(drivingLicense),
          user_id: req.user?.user_id,
          id: { not: customerId },
        },
      });
      if (existingLicense) {
        throw new Error(
          'Ce permis est déjà utilisé par un autre client. Veuillez vérifier vos informations.'
        );
      }
      return true;
    }),
];

// Validateurs pour la suppression
export const deleteValidators = [
  check('id')
    .notEmpty()
    .withMessage('L\'ID du client est requis pour la suppression.')
    .isNumeric()
    .withMessage('L\'ID doit être un nombre.')
    .custom(async (id) => {
      const customer = await prisma.customer.findUnique({ where: { id: parseInt(id, 10) } });
      if (!customer) {
        throw new Error(
          'Aucun client trouvé avec cet ID. Impossible de procéder à la suppression.'
        );
      }
      return true;
    }),
];
