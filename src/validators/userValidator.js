import { check, body } from 'express-validator';

// User registration validation
export const userRegistrationValidator = [
  check('email').isEmail().withMessage('Invalid email'),
  check('password')
    .isLength({ min: 8 })
    .matches(/\d/)
    .matches(/[a-zA-Z]/)
    .matches(/[@$!%*?&#]/)
    .withMessage(
      'Password must contain at least 8 characters, including letters, numbers, and special characters.'
    ),
  check('role').isIn(['admin', 'agent']).withMessage('Invalid role'),
];

// User login validation
export const userLoginValidator = [
  check('email').isEmail().withMessage('Invalid email'),
  check('password').isLength({ min: 8 }).withMessage('Invalid password'),
];

// Update password validation
export const updatePasswordValidator = [
  body('oldPassword').exists().withMessage('Old password required'),
  check('newPassword')
    .isLength({ min: 8 })
    .matches(/\d/)
    .matches(/[a-zA-Z]/)
    .matches(/[@$!%*?&#]/)
    .withMessage(
      'New password must contain letters, numbers, and special characters.'
    ),
];
