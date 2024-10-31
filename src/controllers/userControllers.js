import prisma from '../config/db.js';
import { UserValidators } from '../validators/userValidators.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const userController = {
  addUser: async (req, res) => {
    const { fullName, email, phoneNumber, password, status, role } = req.body;
    const user_id = req.user?.id;

    try {
      // Vérification de l'unicité de l'email et du numéro de téléphone
      await UserValidators.checkUniqueEmail(email);
      await UserValidators.checkUniquePhoneNumber(phoneNumber);

      // Vérification de la présence du mot de passe
      if (!password) {
        return res.status(400).json({ error: 'Le mot de passe est requis' });
      }

      // Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 12);

      // Création de l'utilisateur
      const user = await prisma.user.create({
        data: {
          fullName,
          email,
          phoneNumber,
          password: hashedPassword,
          status: status !== 'inactive',
          role: role || 'employe',
          user_id,
        },
      });
      return res.status(201).json(user);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
      if (error.code === 'P2002') {
        return res
          .status(400)
          .json({ error: 'Email ou numéro de téléphone déjà utilisé.' });
      }
      return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  },

  updateUser: async (req, res) => {
    const { id } = req.params;
    const { fullName, email, phoneNumber, password, status, role } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.' });
      }

      const updatedData = {};
      if (fullName) updatedData.fullName = fullName;
      if (email) {
        await UserValidators.checkUniqueEmail(email, id);
        updatedData.email = email;
      }
      if (phoneNumber) {
        await UserValidators.checkUniquePhoneNumber(phoneNumber, id);
        updatedData.phoneNumber = phoneNumber;
      }
      if (password) updatedData.password = await bcrypt.hash(password, 12);
      if (status) updatedData.status = status === 'active';
      if (role) updatedData.role = role;

      const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: updatedData,
      });
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      return res
        .status(400)
        .json({
          errors: [
            {
              message: error.message,
              suggestion: 'Veuillez réessayer plus tard.',
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
      console.error(error);
      return res
        .status(400)
        .json({
          errors: [
            {
              message: error.message,
              suggestion: 'Veuillez réessayer plus tard.',
            },
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
        return res.status(404).json({ error: 'Utilisateur non trouvé.' });
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res
        .status(400)
        .json({
          errors: [
            {
              message: error.message,
              suggestion: 'Veuillez réessayer plus tard.',
            },
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
        return res.status(404).json({ error: 'Utilisateur non trouvé.' });
      }

      await prisma.user.delete({ where: { id: parseInt(id) } });
      return res
        .status(200)
        .json({ message: 'Utilisateur supprimé avec succès.' });
    } catch (error) {
      console.error(error);
      return res
        .status(400)
        .json({
          errors: [
            {
              message: error.message,
              suggestion: 'Vérifiez l\'utilisateur et réessayez.',
            },
          ],
        });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Email et mot de passe sont obligatoires.' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res
          .status(404)
          .json({ error: 'Informations d’identification incorrectes.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ error: 'Informations d’identification incorrectes.' });
      }

      const token = jwt.sign(
        { user_id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(200).json({ token, role: user.role });
    } catch (error) {
      console.error('Erreur lors de la tentative de connexion:', error);
      return res
        .status(500)
        .json({
          error: 'Une erreur est survenue. Veuillez réessayer plus tard.',
        });
    }
  },

  updatePassword: async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.user_id;

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ error: 'Mot de passe actuel incorrect.' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return res
        .status(200)
        .json({ message: 'Mot de passe mis à jour avec succès.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  },

  resetPassword: async (req, res) => {
    const { email } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.' });
      }

      const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '30m',
      });
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Réinitialisation de votre mot de passe',
        text: `Cliquez sur le lien pour réinitialiser votre mot de passe : ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
      };

      await transporter.sendMail(mailOptions);
      return res
        .status(200)
        .json({ message: 'Lien de réinitialisation envoyé.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  },
};

export default userController;
