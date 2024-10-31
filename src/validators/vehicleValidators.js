import { body, check } from 'express-validator';

export const reservationValidators = [
  body('vehicle_id').isInt().withMessage('Vehicle ID must be an integer'),
  body('customer_id').isInt().withMessage('Customer ID must be an integer'),
  body('startDate')
    .isISO8601()
    .toDate()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('End date must be a valid date'),
  body('totalAmount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  check('status')
    .notEmpty()
    .withMessage('Status is required.')
    .isIn(['confirmed', 'completed', 'cancelled'])
    .withMessage(
      'Invalid status. Allowed values are confirmed, completed, or cancelled.'
    ),
];

export const validateVehicleData = [
  check('brand').optional().notEmpty().withMessage('Brand is required'),
  check('model').optional().notEmpty().withMessage('Model is required'),
  check('year').optional().isInt().withMessage('Year must be a valid integer'),
  check('registrationPlate')
    .optional()
    .notEmpty()
    .withMessage('Registration Plate is required'),
  check('seatCount')
    .optional()
    .isInt()
    .withMessage('Seat Count must be an integer'),
  check('doorCount')
    .optional()
    .isInt()
    .withMessage('Door Count must be an integer'),
  check('color').optional().notEmpty().withMessage('Color is required'),
  check('fuelType').optional().notEmpty().withMessage('Fuel Type is required'),
  check('transmissionType')
    .optional()
    .notEmpty()
    .withMessage('Transmission Type is required'),
  check('dailyRate')
    .optional()
    .isDecimal()
    .withMessage('Daily Rate must be a decimal number'),
  check('user_id').optional().isInt().withMessage('User ID must be an integer'),
];
