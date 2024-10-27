import prisma from '../config/db.js';
import { validationResult } from 'express-validator';

const ticketController = {
  addTicket: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ticketNumber, exitDate, returnDate, vehicle_id, user_id } = req.body;

    try {
      const [user, vehicle] = await Promise.all([
        prisma.user.findUnique({ where: { id: user_id } }),
        prisma.vehicle.findUnique({ where: { id: vehicle_id } }),
      ]);

      if (!user) return res.status(404).json({ error: 'User not found.' });
      if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });

      const ticket = await prisma.ticket.create({
        data: {
          ticketNumber,
          exitDate: new Date(exitDate),
          returnDate: returnDate ? new Date(returnDate) : null,
          vehicle_id,
          user_id,
        },
      });

      return res.status(201).json(ticket);
    } catch (error) {
      console.error('Error creating ticket:', error.message);
      return res.status(500).json({ error: 'Error creating ticket.' });
    }
  },

  updateTicket: async (req, res) => {
    const { id } = req.params;
    const { ticketNumber, exitDate, returnDate, vehicle_id, user_id } = req.body;

    try {
      const ticket = await prisma.ticket.findUnique({ where: { id: parseInt(id) } });
      if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

      const updatedTicket = await prisma.ticket.update({
        where: { id: parseInt(id) },
        data: {
          ticketNumber,
          exitDate: new Date(exitDate),
          returnDate: returnDate ? new Date(returnDate) : null,
          vehicle_id,
          user_id,
        },
      });

      return res.status(200).json(updatedTicket);
    } catch (error) {
      console.error('Error updating ticket:', error.message);
      return res.status(500).json({ error: 'Error updating ticket.' });
    }
  },

  deleteTicket: async (req, res) => {
    const { id } = req.params;

    try {
      const ticket = await prisma.ticket.findUnique({ where: { id: parseInt(id) } });
      if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

      await prisma.ticket.delete({ where: { id: parseInt(id) } });
      return res.status(200).json({ message: 'Ticket deleted successfully.' });
    } catch (error) {
      console.error('Error deleting ticket:', error.message);
      return res.status(500).json({ error: 'Error deleting ticket.' });
    }
  },

  getAllTickets: async (req, res) => {
    try {
      const tickets = await prisma.ticket.findMany();
      return res.status(200).json(tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error.message);
      return res.status(500).json({ error: 'Error fetching tickets.' });
    }
  },

  getTicketById: async (req, res) => {
    const { id } = req.params;
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: parseInt(id) },
        include: {
          vehicle: true,
          user: true,
        },
      });
      if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

      return res.status(200).json(ticket);
    } catch (error) {
      console.error('Error fetching ticket:', error.message);
      return res.status(500).json({ error: 'Error fetching ticket.' });
    }
  },
};

export default ticketController;
