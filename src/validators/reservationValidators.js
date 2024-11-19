import { body, check } from 'express-validator';
// import prisma from '../config/db.js';
// import { validationResult } from 'express-validator';

export const reservationValidators = [
  body('vehicle_id').isInt().withMessage('Vehicle ID must be an integer'),
  body('customer_id').isInt().withMessage('Customer ID must be an integer'),
  body('startDate')
    .isISO8601()
    .toDate()
    .withMessage('La date de début doit être au format YYYY-MM-DD'),
  body('endDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('La date de fin doit être au format YYYY-MM-DD'),
  body('totalAmount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
];
