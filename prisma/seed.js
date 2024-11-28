import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Fonction pour hacher les mots de passe
  async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  // Suppression des données existantes
  await prisma.contract.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log('Données existantes supprimées.');

  // Création des utilisateurs
  const adminUser = await prisma.user.create({
    data: {
      fullName: 'Admin',
      email: 'admin@admin.com',
      phoneNumber: '49491916',
      password: await hashPassword('admin1234'),
      status: true,
      role: 'ADMIN',
    },
  });

  const employeUser = await prisma.user.create({
    data: {
      fullName: 'Employé',
      email: 'employe@example.com',
      phoneNumber: '41112742',
      password: await hashPassword('employe123'),
      status: true,
      role: 'EMPLOYE',
    },
  });

  // Création des clients
  const customer1 = await prisma.customer.create({
    data: {
      fullName: 'John Doe',
      address: '123 Main St',
      nni: '0304121300',
      birthDate: new Date('1990-01-01'),
      drivingLicense: 'MR-1234567',
      phoneNumber: '34331412',
      user_id: adminUser.id,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      fullName: 'Jane Smith',
      address: '456 Oak Ave',
      nni: '8390654020',
      birthDate: new Date('1985-05-15'),
      drivingLicense: 'MR-6543210',
      phoneNumber: '42112727',
      user_id: employeUser.id,
    },
  });

  // Création des véhicules
  const vehicle1 = await prisma.vehicle.create({
    data: {
      brand: 'Toyota',
      model: 'Corolla',
      year: 2021,
      registrationPlate: 'AA-123-BB',
      status: 'Disponible',
      seatCount: 5,
      doorCount: 4,
      color: 'Blanc',
      fuelType: 'Essence',
      transmissionType: 'Automatique',
      airConditioning: true,
      dailyRate: 50.00,
      user_id: adminUser.id,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      brand: 'Ford',
      model: 'Focus',
      year: 2020,
      registrationPlate: 'CC-456-DD',
      status: 'Maintenance',
      seatCount: 5,
      doorCount: 4,
      color: 'Bleu',
      fuelType: 'Diesel',
      transmissionType: 'Manuelle',
      airConditioning: false,
      dailyRate: 45.00,
      user_id: employeUser.id,
    },
  });

  // Création des réservations
  const reservation1 = await prisma.reservation.create({
    data: {
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      totalAmount: 350.00,
      status: 'CONFIRMER',
      vehicle_id: vehicle1.id,
      customer_id: customer1.id,
      user_id: adminUser.id,
    },
  });

  const reservation2 = await prisma.reservation.create({
    data: {
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 3)),
      totalAmount: 135.00,
      status: 'EN_ATTENTE',
      vehicle_id: vehicle2.id,
      customer_id: customer2.id,
      user_id: employeUser.id,
    },
  });

  // Création des contrats
  const contract1 = await prisma.contract.create({
    data: {
      contractNumber: 'C12345',
      startDate: new Date(),
      returnDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      totalAmount: 350.00,
      status: 'VALIDER',
      vehicle_id: vehicle1.id,
      customer_id: customer1.id,
      user_id: adminUser.id,
    },
  });

  const contract2 = await prisma.contract.create({
    data: {
      contractNumber: 'C67890',
      startDate: new Date(),
      returnDate: null,
      totalAmount: 200.00,
      status: 'EN_ATTENTE',
      vehicle_id: vehicle2.id,
      customer_id: customer2.id,
      user_id: employeUser.id,
    },
  });

  console.log('Données de seed ajoutées avec succès.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
