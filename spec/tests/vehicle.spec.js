// __tests__/vehicleController.spec.js
import request from 'supertest';
import app from '../app';
import { mockPrisma } from './mockPrisma';

describe('Vehicle Controller', () => {
  it('should get all vehicles', async () => {
    const mockVehicles = [
      { id: 1, brand: 'Toyota', model: 'Camry', status: 'available' },
    ];
    mockPrisma.findMany.resolves(mockVehicles);

    const response = await request(app).get('/api/vehicles');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockVehicles);
  });

  it('should get vehicle by ID', async () => {
    const mockVehicle = {
      id: 1,
      brand: 'Toyota',
      model: 'Camry',
      status: 'available',
    };
    mockPrisma.findUnique.resolves(mockVehicle);

    const response = await request(app).get('/api/vehicles/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockVehicle);
  });

  it('should create a new vehicle', async () => {
    const newVehicle = { brand: 'Ford', model: 'Focus', status: 'available' };
    mockPrisma.create.resolves({ id: 2, ...newVehicle });

    const response = await request(app).post('/api/vehicles').send(newVehicle);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 2, ...newVehicle });
  });

  it('should update an existing vehicle', async () => {
    const updatedVehicle = {
      brand: 'Ford',
      model: 'Focus Updated',
      status: 'available',
    };
    mockPrisma.update.resolves({ id: 1, ...updatedVehicle });

    const response = await request(app)
      .put('/api/vehicles/1')
      .send(updatedVehicle);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 1, ...updatedVehicle });
  });

  it('should delete a vehicle', async () => {
    mockPrisma.delete.resolves();

    const response = await request(app).delete('/api/vehicles/1');

    expect(response.status).toBe(204);
  });
});
