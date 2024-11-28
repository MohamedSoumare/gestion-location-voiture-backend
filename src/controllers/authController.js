import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import nodemailer from 'nodemailer';


const generateToken = (user, secret, expiresIn) => {
  return jwt.sign({ user_id: user.id, role: user.role }, secret, { expiresIn });
};
  
// Vérification des tokens JWT
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

export const refreshToken = async (req, res) => {
  const { token: refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token manquant.' });
  }
  
  const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
  if (!decoded) return res.status(401).json({ message: 'Refresh token invalide ou expiré.' });
  
  const user = await prisma.user.findUnique({ where: { id: decoded.user_id } });
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
  
  const newAuthToken = generateToken(user, process.env.JWT_SECRET, '1h');
  res.json({ authToken: newAuthToken });
};
  
// Connexion de l'utilisateur
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Recherche de l'utilisateur par email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Email incorrect.' });
    }

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mot de passe incorrect.' });
    }

    // Vérification du statut de l'utilisateur
    if (!user.status) {
      return res.status(403).json({ error: 'Compte inactif. Contactez l\'administrateur.' });
    }

    // Génération des tokens
    const token = generateToken(user, process.env.JWT_SECRET, '1h');
    const refreshToken = generateToken(user, process.env.JWT_REFRESH_SECRET, '7d');

    // Réponse avec les informations utilisateur et les tokens
    res.status(200).json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};
  
// Réinitialisation du mot de passe
export const resetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
  
    const resetToken = generateToken(user, process.env.JWT_SECRET, '30m');
  
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
      subject: 'Réinitialisation de mot de passe',
      text: `Cliquez ici pour réinitialiser votre mot de passe : ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
    };
  
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Lien de réinitialisation envoyé.' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email.' });
  }
};