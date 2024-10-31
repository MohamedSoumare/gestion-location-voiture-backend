import { check, validationResult } from 'express-validator';

export const validateCustomerData = [
  check('fullName')
    .notEmpty()
    .withMessage('Full name is required.')
    .isLength({ max: 60 }),
  check('phoneNumber')
    .isNumeric()
    .withMessage('Phone number must be numeric.')
    .isLength({ min: 8, max: 8 }),
  check('nni')
    .isNumeric()
    .withMessage('NNI must be numeric.')
    .isLength({ min: 10, max: 10 }),
  check('drivingLicense')
    .isLength({ min: 10 })
    .withMessage('Driving license must be at least 10 characters long.'),
  check('dateOfBirth').isISO8601().toDate(),
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
