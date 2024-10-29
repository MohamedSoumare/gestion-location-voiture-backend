// tests/ticketController.spec.js
import {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
} from '../controllers/ticketController.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Ticket Controller Tests', () => {
  let mockResponse;

  beforeEach(() => {
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it('should retrieve all tickets', async () => {
    await listTickets({}, mockResponse);
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should return an error if ticket not found', async () => {
    const mockRequest = { params: { id: '9999' } };
    await getTicket(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Ticket non trouvé.',
    });
  });

  // Ajoutez d'autres tests pour les fonctionnalités de création, mise à jour et suppression
});
