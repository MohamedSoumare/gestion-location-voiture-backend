import { check, validationResult } from 'express-validator';
import prisma from '../config/db.js';

export const UserValidators = {
  checkUniquePhoneNumber: async (phoneNumber, userId = null) => {
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });
    if (user && user.id !== userId) {
      throw new Error(
        'Phone number is already associated with another account.'
      );
    }
  },
  checkUniqueEmail: async (email, userId = null) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user && user.id !== userId) {
      throw new Error('This email is already registered.');
    }
  },
  checkValidStatus: (status) => {
    const validStatuses = ['active', 'inactive'];
    if (!validStatuses.includes(status)) {
      throw new Error('Status must be either "active" or "inactive".');
    }
  },
};

// Middleware for validating user data
// Validators/userValidators.js

export const validateUserData = [
  check('fullName')
    .optional()
    .isLength({ max: 60 })
    .withMessage('Full name cannot exceed 60 characters.'),

  check('email')
    .optional()
    .isEmail()
    .withMessage('Email must be a valid email address.')
    .custom(async (email, { req }) => {
      if (email) await UserValidators.checkUniqueEmail(email, req.params.id);
    }),

  check('phoneNumber')
    .optional()
    .isNumeric()
    .withMessage('Phone number must be numeric.')
    .isLength({ min: 8, max: 8 })
    .withMessage('Phone number must be exactly 8 digits.')
    .custom(async (phoneNumber, { req }) => {
      if (phoneNumber)
        await UserValidators.checkUniquePhoneNumber(phoneNumber, req.params.id);
    }),

  check('status')
    .optional()
    .custom((status) => {
      UserValidators.checkValidStatus(status);
      return true;
    }),

  check('role').optional().isString().withMessage('Role must be a string.'),
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
