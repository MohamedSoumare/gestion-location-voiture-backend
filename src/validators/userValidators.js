import { check, validationResult } from 'express-validator';
import prisma from '../config/db.js';

export const UserValidators = {
  checkUniquePhoneNumber: async (phoneNumber, userId = null) => {
    try {
      const user = await prisma.user.findUnique({ where: { phoneNumber } });
      if (user && user.id !== userId) {
        throw new Error('Ce numéro de téléphone est déjà associé à un autre compte.');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du numéro de téléphone :', error);
      throw new Error('Erreur interne. Veuillez réessayer plus tard.');
    }
  },
  checkUniqueEmail: async (email, userId = null) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.id !== userId) {
      throw new Error('Cet email est déjà enregistré.');
    }
  },
};

// Validator for creating a user
export const createUserValidator = [
  check('fullName')
    .notEmpty()
    .withMessage('Le nom complet est requis.')
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/)
    .withMessage('Le nom complet ne doit contenir que des lettres et des espaces .')
    .isLength({ max: 60 })
    .withMessage('Le nom complet ne peut pas dépasser 60 caractères.'),
  check('email')
    .notEmpty()
    .withMessage('L\'email est requis.')
    .isEmail()
    .withMessage('L\'email doit être une adresse email valide.')
    .custom(async (email) => {
      await UserValidators.checkUniqueEmail(email);
    }),
  check('phoneNumber')
    .notEmpty()
    .withMessage('Le numéro de téléphone est requis.')
    .isNumeric()
    .withMessage('Le numéro de téléphone doit être numérique.')
    .isLength({ min: 8, max: 8 })
    .withMessage('Le numéro de téléphone doit contenir exactement 8 chiffres.')
    .matches(/^[234]\d{7}$/)
    .withMessage('Le numéro de téléphone doit commencer par 2, 3 ou 4.')
    .custom(async (phoneNumber) => {
      await UserValidators.checkUniquePhoneNumber(phoneNumber);
    }),
  
  check('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis.')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).*$/, 'i')
    .withMessage(
      'Le mot de passe doit contenir au moins une lettre minuscule, une lettre majuscule, un chiffre, et ne doit pas contenir d\'espaces.'
    ),
  check('role')
    .optional()
    .isString()
    .withMessage('Le rôle doit être une chaîne de caractères.')
  // .isIn(['admin', 'employe'])
  // .withMessage('Le rôle doit être soit "admin" soit "employe".'),
];

// Validator for updating a user
export const updateUserValidator = [
  check('id')
    .notEmpty()
    .withMessage('L\'ID de l\'utilisateur est requis.')
    .isInt()
    .withMessage('L\'ID doit être un entier valide.'),
  check('fullName')
    .optional()
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/)
    .withMessage('Le nom complet ne doit contenir que des lettres et des espaces .')
    .isLength({ max: 60 })
    .withMessage('Le nom complet ne peut pas dépasser 60 caractères.'),
  check('email')
    .optional()
    .isEmail()
    .withMessage('L\'email doit être une adresse email valide.')
    .custom(async (email, { req }) => {
      if (email) await UserValidators.checkUniqueEmail(email, req.params.id);
    }),

  check('phoneNumber')
    .optional()
    .isNumeric()
    .withMessage('Le numéro de téléphone doit être numérique.')
    .isLength({ min: 8, max: 8 })
    .withMessage('Le numéro de téléphone doit contenir exactement 8 chiffres.')
    .matches(/^[234]\d{7}$/)
    .withMessage('Le numéro de téléphone doit commencer par 2, 3 ou 4.')
    .custom(async (phoneNumber, { req }) => {
      if (phoneNumber) await UserValidators.checkUniquePhoneNumber(phoneNumber, req.params.id);
    }),
  check('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).*$/, 'i')
    .withMessage(
      'Le mot de passe doit contenir au moins une lettre minuscule, une lettre majuscule, un chiffre, et ne doit pas contenir d\'espaces.'
    ),
  check('role')
    .optional()
    .isString()
    .withMessage('Le rôle doit être une chaîne de caractères.')
   
  
];

// Validator for deleting a user
export const deleteUserValidator = [
  check('id')
    .notEmpty()
    .withMessage('L\'ID de l\'utilisateur est requis.')
    .isInt()
    .withMessage('L\'ID doit être un entier valide.')
    .custom(async (id) => {
      const user = await prisma.user.findUnique({ where: { id: parseInt(id, 10) } });
      if (!user) {
        throw new Error('L\'utilisateur avec cet ID n\'existe pas.');
      }
    }),
  
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};