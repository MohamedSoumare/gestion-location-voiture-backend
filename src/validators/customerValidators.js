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
        suggestion: 'Veuillez corriger ce champ.',
      })),
    });
  }
  next();
};

// Validateurs pour la création
export const createValidators = [
  check('fullName')
    .notEmpty()
    .withMessage('Le nom complet est requis.')
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/)
    .withMessage('Le nom complet ne doit contenir que des lettres et des espaces.')
    .isLength({min: 3, max: 60 })
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
        throw new Error('Le NNI est déjà enregistré.');
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
    .withMessage('Le permis de conduire doit commencer par "MR-" suivi de 7 chiffres ou contenir entre 8 et 10 chiffres.')
    .custom(async (drivingLicense, { req }) => {
      const existingLicense = await prisma.customer.findFirst({
        where: { drivingLicense: String(drivingLicense), user_id: req.user?.user_id },
      });
      if (existingLicense) {
        throw new Error('Ce permis de conduire est déjà utilisé.');
      }
      return true;
    }),
];

// Validateurs pour la mise à jour
export const updateValidators = [
  check('fullName')
    .optional()
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/)
    .withMessage('Le nom complet ne doit contenir que des lettres et des espaces.')
    .isLength({ min:3, max: 60 })
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
          id: { not: customerId },
        },
      });
      if (existingCustomer) {
        throw new Error('Le NNI est déjà enregistré.');
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
    .withMessage('Le permis de conduire doit commencer par "MR-" suivi de 7 chiffres ou contenir entre 8 et 10 chiffres.')
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
        throw new Error('Ce permis de conduire est déjà utilisé.');
      }
      return true;
    }),
];

// Validateurs pour la suppression
export const deleteValidators = [
  check('id')
    .notEmpty()
    .withMessage('L\'ID est requis.')
    .isNumeric()
    .withMessage('L\'ID doit être numérique.')
    .custom(async (id) => {
      const customer = await prisma.customer.findUnique({ where: { id: parseInt(id, 10) } });
      if (!customer) {
        throw new Error('Aucun client trouvé avec cet ID.');
      }
      return true;
    })
];
