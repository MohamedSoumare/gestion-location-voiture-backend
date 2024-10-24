import { ClientValidators } from '../validators/customerValidators.js';
import prisma from '../config/db.js'; 


jest.mock('../config/db.js', () => ({
  customer: {
    findUnique: jest.fn(),
  },
}));

describe('ClientValidators', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear les mocks après chaque test
  });

  it('should pass when email is unique', async () => {
    prisma.customer.findUnique.mockResolvedValue(null); // Simule un email non trouvé
    await expect(ClientValidators.checkUniqueEmail('test@example.com')).resolves.not.toThrow();
  });

  it('should throw an error if email already exists', async () => {
    prisma.customer.findUnique.mockResolvedValue({ id: 1 }); // Simule un email trouvé
    await expect(ClientValidators.checkUniqueEmail('test@example.com')).rejects.toThrow('Email already in use');
  });

  it('should pass when phone number is unique', async () => {
    prisma.customer.findUnique.mockResolvedValue(null); // Simule un numéro de téléphone non trouvé
    await expect(ClientValidators.checkUniquePhoneNumber('1234567890')).resolves.not.toThrow();
  });

  it('should throw an error if phone number already exists', async () => {
    prisma.customer.findUnique.mockResolvedValue({ id: 1 }); // Simule un numéro trouvé
    await expect(ClientValidators.checkUniquePhoneNumber('1234567890')).rejects.toThrow('Phone number already in use');
  });

  it('should pass when NNI is unique', async () => {
    prisma.customer.findUnique.mockResolvedValue(null); // Simule un NNI non trouvé
    await expect(ClientValidators.checkUniqueNni('9876543210')).resolves.not.toThrow();
  });

  it('should throw an error if NNI already exists', async () => {
    prisma.customer.findUnique.mockResolvedValue({ id: 1 }); // Simule un NNI trouvé
    await expect(ClientValidators.checkUniqueNni('9876543210')).rejects.toThrow('NNI already in use');
  });

  it('should pass when driving license is unique', async () => {
    prisma.customer.findUnique.mockResolvedValue(null); // Simule un permis non trouvé
    await expect(ClientValidators.checkUniqueDrivingLicense('DL123456789')).resolves.not.toThrow();
  });

  it('should throw an error if driving license already exists', async () => {
    prisma.customer.findUnique.mockResolvedValue({ id: 1 }); // Simule un permis trouvé
    await expect(ClientValidators.checkUniqueDrivingLicense('DL123456789')).rejects.toThrow('Driving license already in use');
  });
});
