import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération des utilisateurs.' });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    user
      ? res.json(user)
      : res.status(404).json({ error: 'Utilisateur non trouvé.' });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération de l\'utilisateur.' });
  }
};

export const createUser = async (req, res) => {
  const { fullName, email, phoneNumber, status, role } = req.body;
  try {
    const user = await prisma.user.create({
      data: { fullName, email, phoneNumber, status, role: role || 'employe' },
    });
    res.status(201).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Erreur lors de la création de l\'utilisateur.' });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { fullName, email, phoneNumber, status, role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { fullName, email, phoneNumber, status, role },
    });
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Erreur lors de la mise à jour de l\'utilisateur.' });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Erreur lors de la suppression de l\'utilisateur.' });
  }
};
