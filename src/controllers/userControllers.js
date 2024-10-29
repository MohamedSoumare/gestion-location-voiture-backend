import prisma from '../config/db.js';
import { UserValidators } from '../validators/userValidators.js';

const userController = {
  addUser: async (req, res) => {
    const { fullName, email, phoneNumber, status, role } = req.body;

    try {
      await UserValidators.checkUniqueEmail(email);
      await UserValidators.checkUniquePhoneNumber(phoneNumber);

      const user = await prisma.user.create({
        data: {
          fullName,
          email,
          phoneNumber,
          status,
          role: role || 'employe',
        },
      });
      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({
        errors: [
          {
            message: error.message,
            suggestion: 'Veuillez entrer une donnée valide.',
          },
        ],
      });
    }
  },

  updateUser: async (req, res) => {
    const { id } = req.params;
    const { fullName, email, phoneNumber, status, role } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.' });
      }

      const errorMessages = [];
      if (email) {
        try {
          await UserValidators.checkUniqueEmail(email, id);
        } catch (error) {
          errorMessages.push({
            message: error.message,
            suggestion: 'Essayez avec un email différent.',
          });
        }
      }
      if (phoneNumber) {
        try {
          await UserValidators.checkUniquePhoneNumber(phoneNumber, id);
        } catch (error) {
          errorMessages.push({
            message: error.message,
            suggestion: 'Essayez avec un numéro de téléphone différent.',
          });
        }
      }

      if (errorMessages.length > 0) {
        return res.status(400).json({ errors: errorMessages });
      }

      // Build updated data only with provided fields
      const updatedData = {};
      if (fullName) updatedData.fullName = fullName;
      if (email) updatedData.email = email;
      if (phoneNumber) updatedData.phoneNumber = phoneNumber;
      if (status) updatedData.status = status;
      if (role) updatedData.role = role;

      const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: updatedData,
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(400).json({
        errors: [
          {
            message: error.message,
            suggestion: 'Please try again later.',
          },
        ],
      });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(400).json({
        errors: [
          { message: error.message, suggestion: 'Please try again later.' },
        ],
      });
    }
  },

  getUserById: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({
        errors: [
          { message: error.message, suggestion: 'Please try again later.' },
        ],
      });
    }
  },

  deleteUser: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      await prisma.user.delete({ where: { id: parseInt(id) } });
      return res.status(200).json({ message: 'User successfully deleted.' });
    } catch (error) {
      return res.status(400).json({
        errors: [
          {
            message: error.message,
            suggestion: 'Vérifiez utilisateur et réessayez.',
          },
        ],
      });
    }
  },
};

export default userController;
