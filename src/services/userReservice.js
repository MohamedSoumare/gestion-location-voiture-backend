// import { PrismaClient } from '@prisma/client';
// import jwt from 'jsonwebtoken';
// import transporter from '../config/transporter.js';
// import { config } from 'dotenv';
// import bcrypt from 'bcryptjs';

// config();
// const prisma = new PrismaClient();

// export async function getAdminEmails() {
//   const admins = await prisma.users.findMany({
//     where: { role: 'ADMIN' },
//     select: { email: true },
//   });
//   return admins.map(admin => admin.email);
// }

// export async function sendPasswordResetEmail(email) {
//   const user = await prisma.users.findUnique({ where: { email } });
//   if (!user) {
//     throw new Error('Utilisateur non trouvé');
//   }

//   // Génération du token de réinitialisation de mot de passe
//   const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
//     expiresIn: '1h',
//   });
//   const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

//   // Configuration des options de l'email
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: 'Réinitialisation de votre mot de passe',
//     text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetUrl}`,
//     html: `<p>Cliquez sur ce lien pour réinitialiser votre mot de passe : <a href="${resetUrl}">Réinitialiser le mot de passe</a></p>`,
//     headers: {
//       'List-Unsubscribe': '<mailto:unsubscribe@votredomaine.com>',
//     },
//   };

//   // Envoi de l'email
//   await transporter.sendMail(mailOptions);
//   return { message: 'Email de réinitialisation envoyé.' };
// }

// export async function resetPassword(token, newPassword) {
//   try {
//     // Vérification et décodage du token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.id;

//     // Hashage du nouveau mot de passe
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // Mise à jour du mot de passe dans la base de données
//     await prisma.users.update({
//       where: { id: userId },
//       data: { password: hashedPassword },
//     });

//     return { message: 'Mot de passe réinitialisé avec succès.' };
//   } catch (error) {
//     throw new Error('Token invalide ou expiré');
//   }
// }
