import prisma from '../config/db.js';
import { CustomerValidators } from '../validators/customerValidators.js';

const customerController = {
    addCustomer: async (req, res) => {
        const { fullName, address, phoneNumber, nni, dateOfBirth, drivingLicense } = req.body;
    
        try {
          // Validate and check unique constraints
          await CustomerValidators.checkUniquePhoneNumber(phoneNumber);
          await CustomerValidators.checkUniqueNni(nni);
          await CustomerValidators.checkUniqueDrivingLicense(drivingLicense);
    
          // Check if dateOfBirth is a valid date string
          const parsedDate = new Date(dateOfBirth);
          if (isNaN(parsedDate)) {
            throw new Error('Invalid birth date format');
          }

          const customer = await prisma.customer.create({
            data: {
              fullName,
              address,
              phoneNumber,
              nni,
              birthDate: parsedDate,  
              drivingLicense
            }
          });
    
          return res.status(201).json(customer);
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }
      },
      
  updateCustomer: async (req, res) => {
    const { id } = req.params;
    const { fullName, address, phoneNumber, nni, birthDate, drivingLicense } = req.body;
    
    try {
      const customer = await prisma.customer.findUnique({ where: { id: parseInt(id) } });
      
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // Validate unique constraints
      if (phoneNumber) await CustomerValidators.checkUniquePhoneNumber(phoneNumber, id);
      if (nni) await CustomerValidators.checkUniqueNni(nni, id);
      if (drivingLicense) await CustomerValidators.checkUniqueDrivingLicense(drivingLicense, id);
      
      const updatedData = {
        fullName: fullName || customer.fullName,
        address: address || customer.address,
        phoneNumber: phoneNumber || customer.phoneNumber,
        nni: nni || customer.nni,
        birthDate: birthDate ? new Date(birthDate) : customer.birthDate, // Ensure to use 'birthDate'
        drivingLicense: drivingLicense || customer.drivingLicense,
      };

      const updatedCustomer = await prisma.customer.update({
        where: { id: parseInt(id) },
        data: updatedData,
      });

      return res.status(200).json(updatedCustomer);

    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  getAllCustomers: async (req, res) => {
    try {
      const customers = await prisma.customer.findMany();
      return res.status(200).json(customers);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  getCustomerById: async (req, res) => {
    const { id } = req.params;
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: parseInt(id) }
      });
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      return res.status(200).json(customer);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  deleteCustomer: async (req, res) => {
    const { id } = req.params;
    try {
      const existingReservations = await prisma.reservation.findMany({
        where: { id_customer: parseInt(id) }
      });

      if (existingReservations.length > 0) {
        return res.status(400).json({ error: 'Cannot delete customer with active reservations' });
      }

      await prisma.customer.delete({ where: { id: parseInt(id) } });
      return res.status(200).json({ message: 'Customer deleted successfully' });

    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  getCustomerHistory: async (req, res) => {
    const { id } = req.params;
    try {
      const reservations = await prisma.reservation.findMany({
        where: { id_customer: parseInt(id) }
      });
      return res.status(200).json(reservations);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
};

export default customerController;
