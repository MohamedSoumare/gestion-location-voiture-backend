import { check, validationResult } from 'express-validator';

export const validateCustomerData = [
  check('fullName')
    .notEmpty()
    .withMessage('Nom requis.')
    .isLength({ max: 60 }),
  check('phoneNumber')
    .isNumeric()
    .withMessage('Téléphone doit être numérique.')
    .isLength({ min: 8, max: 8 }),
  check('nni')
    .isNumeric()
    .withMessage('NNI doit être numérique.')
    .isLength({ min: 10, max: 10 }),
  check('birthDate')
    .notEmpty().withMessage('Date de naissance requise.')
    .isISO8601().withMessage('Format de date de naissance invalide. Utilisez le format YYYY-MM-DD.'),
  check('drivingLicense')
    .optional()
    .matches(/^(MR-\d{7}|\d{8,10})$/)
    .withMessage('Permis de conduire incorrect.'),
  (req, res, next) => {
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
  },
];
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
        suggestion: 'Please provide a valid input.',
      })),
    });
  }
  next();
};
