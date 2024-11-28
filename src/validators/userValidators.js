import { check, validationResult } from 'express-validator';
import prisma from '../config/db.js';

export const UserValidators = {
  checkUniquePhoneNumber: async (phoneNumber, userId = null) => {
    const user = await prisma.user.findUnique({ where: { phoneNumber } });
    if (user && (!userId || user.id !== Number(userId))) {
      throw new Error('Ce numéro de téléphone est déjà associé à un autre compte.');
    }
  },

  checkUniqueEmail: async (email, userId = null) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && (!userId || user.id !== Number(userId))) {
      throw new Error('Cet email est déjà enregistré.');
    }
  },
  
};

export const createUserValidator = [
 
  check('fullName')
    .notEmpty().withMessage('Le nom complet est requis.')
    .isLength({ min: 3, max: 60 })
    .withMessage('Le nom complet doit contenir entre 3 et 60 caractères.')  
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'’-]+$/).withMessage('Le nom doit contenir uniquement des lettres et espaces.'),

  check('email')
    .notEmpty().withMessage('L\'email est requis.')
    .isEmail().withMessage('L\'email doit être valide et ressembler à "exemple@domaine.com".')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).withMessage('L\'email doit contenir un "@" et un domaine valide.')
    .custom(async (email) => {
      await UserValidators.checkUniqueEmail(email);
    }),

  check('phoneNumber')
    .notEmpty().withMessage('Le numéro de téléphone est requis.')
    .isLength({ min: 8, max: 8 }).withMessage('Le numéro doit contenir exactement 8 chiffres.')
    .matches(/^[234]\d{7}$/).withMessage('Le numéro doit commencer par 2, 3 ou 4.')
    .custom(async (phoneNumber) => {
      await UserValidators.checkUniquePhoneNumber(phoneNumber);
    }),

  check('password')
    .notEmpty().withMessage('Le mot de passe est requis.')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/).withMessage(
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, et un chiffre.'
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
    .isLength({ min: 3, max: 60 })
    .withMessage('Le nom complet doit contenir entre 3 et 60 caractères.')  
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'’-]+$/).withMessage('Le nom doit contenir uniquement des lettres et espaces.'),
       
  check('email')
    .optional()
    .isEmail().withMessage('L\'email doit être valide.')
    .custom(async (email, { req }) => {
      const userId = req.params.id;
      await UserValidators.checkUniqueEmail(email, userId);
    }),

  check('phoneNumber')
    .optional()
    .isLength({ min: 8, max: 8 }).withMessage('Le numéro doit contenir exactement 8 chiffres.')
    .custom(async (phoneNumber, { req }) => {
      const userId = req.params.id;
      await UserValidators.checkUniquePhoneNumber(phoneNumber, userId);
    }),    
  check('password')
    .optional()
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/).withMessage(
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, et un chiffre.'
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