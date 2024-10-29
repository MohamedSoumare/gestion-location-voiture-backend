import { check } from 'express-validator';

export const validateVehicleData = [
  check('brand').notEmpty().withMessage('Brand is required'),
  check('model').notEmpty().withMessage('Model is required'),
  check('year').isInt().withMessage('Year must be a valid integer'),
  check('registrationPlate')
    .notEmpty()
    .withMessage('Registration Plate is required'),
  check('seatCount').isInt().withMessage('Seat Count must be an integer'),
  check('doorCount').isInt().withMessage('Door Count must be an integer'),
  check('color').notEmpty().withMessage('Color is required'),
  check('fuelType').notEmpty().withMessage('Fuel Type is required'),
  check('transmissionType')
    .notEmpty()
    .withMessage('Transmission Type is required'),
  check('dailyRate')
    .isDecimal()
    .withMessage('Daily Rate must be a decimal number'),
];
