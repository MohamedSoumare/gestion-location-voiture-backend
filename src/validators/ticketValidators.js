import { check } from 'express-validator';
import prisma from '../config/db.js';

export const validateTicketData = [
  check('ticketNumber')
    .notEmpty().withMessage('Ticket number is required.')
    .isLength({ max: 25 }).withMessage('Ticket number cannot exceed 25 characters.'),

  check('exitDate')
    .notEmpty().withMessage('Exit date is required.')
    .isISO8601().toDate().withMessage('Invalid date format.'),

  check('returnDate')
    .optional()
    .isISO8601().toDate().withMessage('Invalid date format for return date.')
    .custom((returnDate, { req }) => {
      const exitDate = new Date(req.body.exitDate);
      if (returnDate && exitDate >= new Date(returnDate)) {
        throw new Error('Return date must be later than exit date.');
      }
      return true;
    }),

  check('vehicle_id')
    .isInt().withMessage('Vehicle ID must be an integer.')
    .custom(async (vehicle_id) => {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicle_id } });
      if (!vehicle) throw new Error('Vehicle ID not found.');
    }),

  check('user_id')
    .isInt().withMessage('User ID must be an integer.')
    .custom(async (user_id) => {
      const user = await prisma.user.findUnique({ where: { id: user_id } });
      if (!user) throw new Error('User ID not found.');
    }),
];
