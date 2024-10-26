import { body, validationResult } from 'express-validator';

export const validateUser = [
  body('fullName')
    .isLength({ min: 2 })
    .withMessage('Le nom complet doit contenir au moins 2 caractères.'),
  body('email').isEmail().withMessage('Un email valide est requis.'),
  body('phoneNumber')
    .isLength({ min: 8 })
    .withMessage(
      'Le numéro de téléphone est requis et doit contenir au moins 8 chiffres.'
    ),
  body('status').notEmpty().withMessage('Le statut est requis.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
