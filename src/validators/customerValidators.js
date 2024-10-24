import { check, validationResult } from 'express-validator';
import prisma from '../config/db.js';

export const CustomerValidators = {
  // Vérification si le numéro de téléphone est unique
  checkUniquePhoneNumber: async (phoneNumber, customerId = null) => {
    const customer = await prisma.customer.findUnique({
      where: { phoneNumber },
    });
    if (customer && customer.id !== customerId) {
      throw new Error('Phone number is already associated with another account.');
    }
  },
  // Vérification si le NNI est unique
  checkUniqueNni: async (nni, customerId = null) => {
    const customer = await prisma.customer.findUnique({
      where: { nni },
    });
    if (customer && customer.id !== customerId) {
      throw new Error('This NNI is already registered.');
    }
  },
  // Vérification si le permis de conduire est unique
  checkUniqueDrivingLicense: async (drivingLicense, customerId = null) => {
    const customer = await prisma.customer.findUnique({
      where: { drivingLicense },
    });
    if (customer && customer.id !== customerId) {
      throw new Error('This driving license is already in use.');
    }
  },
};

// Middleware pour valider les données du client
export const validateCustomerData = [
  check('fullName')
    .notEmpty().withMessage('Full name is required.')
    .isLength({ max: 60 }).withMessage('Full name cannot exceed 60 characters.'),
  
  check('phoneNumber')
    .isNumeric().withMessage('Phone number must be numeric.')
    .isLength({ min: 8, max: 8 }).withMessage('Phone number must be exactly 8 digits.')
    .custom(async (phoneNumber, { req }) => {
      await CustomerValidators.checkUniquePhoneNumber(phoneNumber, req.params.id);
    }),

  check('nni')
    .isNumeric().withMessage('NNI must be numeric.')
    .isLength({ min: 10, max: 10 }).withMessage('NNI must be exactly 10 digits.')
    .custom(async (nni, { req }) => {
      await CustomerValidators.checkUniqueNni(nni, req.params.id);
    }),

  check('drivingLicense')
    .isLength({ min: 10 }).withMessage('Driving license must be at least 10 characters long.')
    .custom(async (drivingLicense, { req }) => {
      await CustomerValidators.checkUniqueDrivingLicense(drivingLicense, req.params.id);
    }),

  check('dateOfBirth')
    .isISO8601().withMessage('Date of birth must be a valid ISO 8601 date.')
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        suggestion: 'Please provide a valid input.'
      }))
    });
  }
  next();
};
