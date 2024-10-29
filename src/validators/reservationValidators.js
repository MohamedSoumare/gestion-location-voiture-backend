import { body, check } from 'express-validator';

export const reservationValidators = [
  body('vehicle_id').isInt().withMessage('Vehicle ID must be an integer'),
  body('customer_id').isInt().withMessage('Customer ID must be an integer'),
  body('startDate').isISO8601().toDate().withMessage('Start date must be a valid date'),
  body('endDate').isISO8601().toDate().withMessage('End date must be a valid date'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  check('status')
    .notEmpty()
    .withMessage('Status is required.')
    .isIn(['active', 'completed', 'cancelled'])
    .withMessage('Invalid status. Allowed values are active, completed, or cancelled.'),
];
