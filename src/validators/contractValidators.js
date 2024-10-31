import { check, validationResult } from 'express-validator';
import prisma from '../config/db.js';

export const contractValidators = [
  check('startDate')
    .notEmpty()
    .withMessage('Start date is required.')
    .isISO8601()
    .toDate()
    .withMessage('Invalid date format for start date.'),
  check('endDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Invalid date format for end date.')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('End date must be after the start date.');
      }
      return true;
    }),

  check('status')
    .notEmpty()
    .withMessage('Status is required.')
    .isIn(['active', 'completed', 'cancelled'])
    .withMessage(
      'Invalid status. Allowed values are active, completed, or cancelled.'
    ),

  check('customer_id')
    .isInt()
    .withMessage('Customer ID must be an integer.')
    .custom(async (customer_id) => {
      const customer = await prisma.customer.findUnique({
        where: { id: customer_id },
      });
      if (!customer) {
        throw new Error(
          'Customer not found. Please provide a valid customer ID.'
        );
      }
    }),

  check('vehicle_id')
    .isInt()
    .withMessage('Vehicle ID must be an integer.')
    .custom(async (vehicle_id) => {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicle_id },
      });
      if (!vehicle) {
        throw new Error(
          'Vehicle not found. Please provide a valid vehicle ID.'
        );
      }
    }),

  check('reservation_id')
    .optional()
    .custom(async (reservation_id) => {
      if (reservation_id !== null && reservation_id !== undefined) {
        const reservation = await prisma.reservation.findUnique({
          where: { id: reservation_id },
        });
        if (!reservation) {
          throw new Error(
            'Reservation not found. Please provide a valid reservation ID.'
          );
        }
      }
      return true;
    }),

  check('user_id')
    .optional()
    .isInt()
    .withMessage('User ID must be an integer.')
    .custom(async (user_id) => {
      if (user_id) {
        const user = await prisma.user.findUnique({ where: { id: user_id } });
        if (!user) {
          throw new Error('User not found. Please provide a valid user ID.');
        }
      }
    }),

  check('totalAmount')
    .isDecimal()
    .withMessage('Total amount must be a decimal number.')
    .custom((value) => value > 0)
    .withMessage('Total amount must be a positive number.'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
