import { check, validationResult } from 'express-validator';
import prisma from '../config/db.js';

export const UserValidators = {
  checkUniquePhoneNumber: async (phoneNumber, userId = null) => {
    const user = await prisma.user.findUnique({ where: { phoneNumber } });
    if (user && user.id !== userId) {
      throw new Error(
        'Ce numéro de téléphone est déjà associé à un autre compte.'
      );
    }
  },
  checkUniqueEmail: async (email, userId = null) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.id !== userId) {
      throw new Error('Cet email est déjà enregistré.');
    }
  },
  checkValidStatus: (status) => {
    const validStatuses = ['active', 'inactive'];
    if (!validStatuses.includes(status)) {
      throw new Error('Le statut doit être "active" ou "inactive".');
    }
  },
};

// Middleware pour valider les données d'un utilisateur
export const validateUserData = [
   check('fullName')
   .optional()
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
   .custom(async (phoneNumber, { req }) => {
     if (phoneNumber)
      await UserValidators.checkUniquePhoneNumber(phoneNumber, req.params.id);
   }),
  check('password')
    .optional()
    .isLength({ min: 8 })
  .withMessage('Le mot de passe doit contenir au moins 8 caractères.')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).*$/, 'i')
    .withMessage(
      'Le mot de passe doit contenir au moins une lettre minuscule, une lettre majuscule, un chiffre, et ne doit pas contenir d\'espaces.'
     ),
   check('status')
     .optional()
     .custom((status) => {
      UserValidators.checkValidStatus(status);
    return true;
  }),
  check('role')
    .optional()
    .isString()
  .withMessage('Le rôle doit être une chaîne de caractères.'),
];

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
