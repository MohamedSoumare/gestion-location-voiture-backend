import {
  createCustomer,
  getCustomer,
  listCustomers,
} from '../controllers/customerControllers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Customer Controller', () => {
  it('should create a new customer', async () => {
    const req = {
      body: {
        fullName: 'John Doe',
        address: '123 Main St',
        nni: 12345678,
        birthDate: '1990-01-01',
        drivingLicense: 'DL123',
        phoneNumber: '1234567890',
      },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await createCustomer(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: 'John Doe' })
    );
  });

  it('should retrieve a list of customers', async () => {
    const req = {};
    const res = { json: jest.fn() };

    await listCustomers(req, res);
    expect(res.json).toHaveBeenCalled();
    expect(Array.isArray(res.json.mock.calls[0][0])).toBe(true);
  });

  it('should retrieve a single customer by ID', async () => {
    const req = { params: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await getCustomer(req, res);
    if (res.status.mock.calls.length) {
      expect(res.status).toHaveBeenCalledWith(404);
    } else {
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    }
  });
});
