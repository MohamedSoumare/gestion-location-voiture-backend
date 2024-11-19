// userController.js
import prisma from '../config/db.js';
import bcrypt from 'bcrypt';

const userController = {
  addUser: async (req, res) => {
    const { fullName, email, phoneNumber, password, role, status } = req.body;
    const validRoles = ['ADMIN', 'EMPLOYE'];

    try {
    // Vérification du rôle
      if (role && !validRoles.includes(role)) {
        return res.status(400).json({ message: 'Rôle invalide.' });
      }

      // Vérification de l'unicité de l'email
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email déjà utilisé.' });
      }

      // Hashage du mot de passe avec un facteur de coût de 10
      const hashedPassword = await bcrypt.hash(password, 10);

      // Création de l'utilisateur
      const newUser = await prisma.user.create({
        data: {
          fullName,
          email,
          phoneNumber,
          password: hashedPassword,
          status,
          role: role || 'EMPLOYE',
        },
      });

      // Réponse avec les informations utilisateur (sans le mot de passe)
      return res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
        },
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
      if (error.code === 'P2002') {
        return res.status(400).json({ message: 'Email ou numéro de téléphone déjà utilisé.' });
      }
      return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  },


  updateUser: async (req, res) => {
    const userId = Number(req.params.id);
    const { fullName, email, phoneNumber, password, status, role } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.' });
      }

      const updatedData = {};
      if (fullName) updatedData.fullName = fullName;
      if (email) updatedData.email = email;
      if (phoneNumber) updatedData.phoneNumber = phoneNumber;
      if (password) updatedData.password = await bcrypt.hash(password, 12);
      if (role) updatedData.role = role;
      if (status !== undefined) updatedData.status = status;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updatedData,
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      return res.status(200).json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  },

  getUserById: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.' });
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  },

  deleteUser: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.' });
      }

      await prisma.user.delete({ where: { id: parseInt(id) } });
      return res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  },

  getProfile: async (req, res) => {
    const userId = req.user.user_id;
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.' });
      }
      return res.status(200).json({ user });
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  },

  updateProfile: async (req, res) => {
    const userId = req.user.user_id;
    const { fullName, email, phoneNumber, password, status, role } = req.body;

  
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.' });
      }
  
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          fullName: fullName || user.fullName,
          email: email || user.email,
          phoneNumber: phoneNumber || user.phoneNumber,
          // password: password || user.password,
          status: status || user.status,
          role: role || user.role,
        },
      });
  
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error);
      return res.status(500).json({ message: 'Erreur interne du serveur.' });
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
        return res.status(400).json({ error: 'Mot de passe actuel incorrect.' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  },
};

export default userController;
