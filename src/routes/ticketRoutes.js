import express from 'express';
import ticketController from '../controllers/ticketControllers.js';
import { validateTicketData } from '../validators/ticketValidators.js';

const router = express.Router();

router.post(
  '/tickets/add',
  validateTicketData,
  ticketController.addTicket
);

router.put(
  '/tickets/edit/:id',
  validateTicketData,
  ticketController.updateTicket
);

router.delete(
  '/tickets/delete/:id',
  ticketController.deleteTicket
);

router.get('/tickets', ticketController.getAllTickets);
router.get('/tickets/:id', ticketController.getTicketById);

export default router;
