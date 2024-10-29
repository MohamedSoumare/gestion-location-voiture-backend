import contractController from '../controllers/contractController.js';
import prisma from '../config/db.js';

describe('Contract Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jasmine.createSpy('status').and.returnValue({
        json: jasmine.createSpy('json'),
      }),
      json: jasmine.createSpy('json'),
    };
  });

  describe('addContract', () => {
    it('should add a new contract and return a success message', async () => {
      req.body = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        totalAmount: 1000,
        status: 'active',
        vehicle_id: 1,
        customer_id: 2,
        user_id: 3,
        reservation_id: 4,
      };

      const createdContract = { id: 1, ...req.body };
      spyOn(prisma.contract, 'create').and.returnValue(
        Promise.resolve(createdContract)
      );

      await contractController.addContract(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.status().json).toHaveBeenCalledWith({
        message: 'Contract created successfully.',
        contract: createdContract,
      });
    });

    it('should return an error if contract creation fails', async () => {
      req.body = {
        startDate: 'invalid date',
      };

      spyOn(prisma.contract, 'create').and.returnValue(
        Promise.reject(new Error('Invalid date format'))
      );
      await contractController.addContract(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.status().json).toHaveBeenCalledWith({
        error:
          'An error occurred while creating the contract. Please try again.',
      });
    });
  });

  describe('updateContract', () => {
    it('should update an existing contract and return a success message', async () => {
      req.params = { id: 1 };
      req.body = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        totalAmount: 1200,
        status: 'active',
        vehicle_id: 1,
        customer_id: 2,
        user_id: 3,
        reservation_id: 4,
      };

      const existingContract = { id: 1, ...req.body };
      spyOn(prisma.contract, 'findUnique').and.returnValue(
        Promise.resolve(existingContract)
      );
      spyOn(prisma.contract, 'update').and.returnValue(
        Promise.resolve(existingContract)
      );

      await contractController.updateContract(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status().json).toHaveBeenCalledWith({
        message: 'Contract updated successfully.',
        updatedContract: existingContract,
      });
    });

    it('should return an error if contract to update is not found', async () => {
      req.params = { id: 99 };

      spyOn(prisma.contract, 'findUnique').and.returnValue(
        Promise.resolve(null)
      );

      await contractController.updateContract(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.status().json).toHaveBeenCalledWith({
        error: 'Contract not found. Please provide a valid contract ID.',
      });
    });
  });

  describe('deleteContract', () => {
    it('should delete a contract and return a success message', async () => {
      req.params = { id: 1 };
      spyOn(prisma.contract, 'findUnique').and.returnValue(
        Promise.resolve({ id: 1 })
      );
      spyOn(prisma.contract, 'delete').and.returnValue(Promise.resolve());

      await contractController.deleteContract(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status().json).toHaveBeenCalledWith({
        message: 'Contract deleted successfully.',
      });
    });

    it('should return an error if contract to delete is not found', async () => {
      req.params = { id: 99 };

      spyOn(prisma.contract, 'findUnique').and.returnValue(
        Promise.resolve(null)
      );

      await contractController.deleteContract(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.status().json).toHaveBeenCalledWith({
        error: 'Contract not found. Please provide a valid contract ID.',
      });
    });
  });

  describe('getAllContracts', () => {
    it('should fetch all contracts and return them', async () => {
      const contracts = [{ id: 1, totalAmount: 1000, status: 'active' }];
      spyOn(prisma.contract, 'findMany').and.returnValue(
        Promise.resolve(contracts)
      );

      await contractController.getAllContracts(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status().json).toHaveBeenCalledWith(contracts);
    });

    it('should return an error if fetching contracts fails', async () => {
      spyOn(prisma.contract, 'findMany').and.returnValue(
        Promise.reject(new Error('Database error'))
      );

      await contractController.getAllContracts(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.status().json).toHaveBeenCalledWith({
        error: 'An error occurred while fetching contracts. Please try again.',
      });
    });
  });

  describe('getContractById', () => {
    it('should fetch a specific contract by ID', async () => {
      req.params = { id: 1 };
      const contract = { id: 1, totalAmount: 1000, status: 'active' };
      spyOn(prisma.contract, 'findUnique').and.returnValue(
        Promise.resolve(contract)
      );

      await contractController.getContractById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status().json).toHaveBeenCalledWith(contract);
    });

    it('should return an error if contract by ID is not found', async () => {
      req.params = { id: 99 };
      spyOn(prisma.contract, 'findUnique').and.returnValue(
        Promise.resolve(null)
      );

      await contractController.getContractById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.status().json).toHaveBeenCalledWith({
        error: 'Contract not found. Please provide a valid contract ID.',
      });
    });
  });
});
