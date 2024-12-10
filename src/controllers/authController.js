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
  if (!decoded)
    return res
      .status(401)
      .json({ message: 'Refresh token invalide ou expiré.' });

  const user = await prisma.user.findUnique({ where: { id: decoded.user_id } });
  if (!user)
    return res.status(404).json({ message: 'Utilisateur non trouvé.' });

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
      return res
        .status(403)
        .json({ error: 'Compte inactif. Contactez l\'administrateur.' });
    }

    // Génération des tokens
    const token = generateToken(user, process.env.JWT_SECRET, '7h');
    const refreshToken = generateToken(
      user,
      process.env.JWT_REFRESH_SECRET,
      '7d'
    );

    // Réponse avec les informations utilisateur et les tokens
    res.status(200).json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        status: user.status,
        role: user.role,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

export const resetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });

    // Générer un OTP aléatoire
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString(); // Un nombre à 6 chiffres
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // Expire dans 10 minutes

    // Stocker l'OTP et sa date d'expiration dans la base de données
    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiration },
    });

    // Envoyer l'OTP par email
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
      subject: 'Code OTP pour réinitialisation de mot de passe',
      text: `Votre code OTP est : ${otp}. Il est valable pour 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ message: 'Code OTP envoyé à votre adresse email.' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'OTP :', error);
    return res
      .status(500)
      .json({ message: 'Erreur lors de l\'envoi de l\'OTP.' });
  }
};

export const updateResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    // Rechercher l'utilisateur par email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    // Vérifier l'OTP et sa validité
    if (user.otp !== otp || new Date() > new Date(user.otpExpiration)) {
      return res.status(400).json({ error: 'OTP invalide ou expiré.' });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe et réinitialiser l'OTP
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiration: null,
      },
    });

    // Réponse de succès
    return res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error) {
    // Gérer les erreurs
    console.error('Erreur lors de la réinitialisation du mot de passe :', error);
    return res.status(500).json({ message: 'Erreur lors de la réinitialisation.' });
  }
};
