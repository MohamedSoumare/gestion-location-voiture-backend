import { check, validationResult } from 'express-validator';
import prisma from '../config/db.js';

export const contractValidators = [
  // check('contractNumber')
  //   .notEmpty()
  //   .withMessage('Contract number is required.')
  //   .custom(async (contractNumber) => {
  //     const existingContract = await prisma.contract.findUnique({ where: { contractNumber } });
  //     if (existingContract) throw new Error('Contract number already exists.');
  //   }),
  // check('startDate')
  //   .notEmpty()
  //   .withMessage('Start date is required.')
  //   .isISO8601()
  //   .toDate()
  //   .withMessage('Invalid date format for start date.'),
  // check('returnDate')
  //   .optional()
  //   .isISO8601()
  //   .toDate()
  //   .withMessage('Invalid date format for return date.')
  //   .custom((returnDate, { req }) => {
  //     if (returnDate && new Date(returnDate) < new Date(req.body.startDate)) {
  //       throw new Error('Return date must be after the start date.');
  //     }
  //     return true;
  //   }),
  // check('status')
  //   .notEmpty()
  //   .withMessage('Status is required.')
  //   .isIn(['validate', 'cancelled'])
  //   .withMessage('Invalid status. Allowed values are validate or cancelled.'),
  // check('customer_id')
  //   .isInt()
  //   .withMessage('Customer ID must be an integer.')
  //   .custom(async (customer_id) => {
  //     const customer = await prisma.customer.findUnique({ where: { id: customer_id } });
  //     if (!customer) throw new Error('Customer not found.');
  //   }),
  // check('vehicle_id')
  //   .isInt()
  //   .withMessage('Vehicle ID must be an integer.')
  //   .custom(async (vehicle_id) => {
  //     const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicle_id } });
  //     if (!vehicle) throw new Error('Vehicle not found.');
  //   }),
  // check('totalAmount')
  //   .isDecimal()
  //   .withMessage('Total amount must be a decimal number.')
  //   .custom((value) => value > 0)
  //   .withMessage('Total amount must be a positive number.'),
];
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
