// __tests__/reservationController.spec.js
import request from 'supertest';
import app from '../app';
import { mockPrisma } from './mockPrisma';

describe('Reservation Controller', () => {
  it('should get all reservations', async () => {
    const mockReservations = [
      {
        id: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-10',
        totalAmount: 100.0,
      },
    ];
    mockPrisma.findMany.resolves(mockReservations);

    const response = await request(app).get('/api/reservations');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockReservations);
  });

  it('should get reservation by ID', async () => {
    const mockReservation = {
      id: 1,
      startDate: '2024-01-01',
      endDate: '2024-01-10',
      totalAmount: 100.0,
    };
    mockPrisma.findUnique.resolves(mockReservation);

    const response = await request(app).get('/api/reservations/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockReservation);
  });

  it('should create a new reservation', async () => {
    const newReservation = {
      startDate: '2024-01-01',
      endDate: '2024-01-10',
      totalAmount: 150.0,
    };
    mockPrisma.create.resolves({ id: 2, ...newReservation });

    const response = await request(app)
      .post('/api/reservations')
      .send(newReservation);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 2, ...newReservation });
  });

  it('should update an existing reservation', async () => {
    const updatedReservation = {
      startDate: '2024-01-05',
      endDate: '2024-01-15',
      totalAmount: 200.0,
    };
    mockPrisma.update.resolves({ id: 1, ...updatedReservation });

    const response = await request(app)
      .put('/api/reservations/1')
      .send(updatedReservation);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 1, ...updatedReservation });
  });

  it('should delete a reservation', async () => {
    mockPrisma.delete.resolves();

    const response = await request(app).delete('/api/reservations/1');

    expect(response.status).toBe(204);
  });
});
