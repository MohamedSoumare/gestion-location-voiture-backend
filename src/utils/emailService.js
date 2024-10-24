import nodemailer from 'nodemailer';

export const sendResetEmail = async (to, token) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // ou tout autre service de messagerie
    auth: {
      user: process.env.EMAIL_USER, // ton email
      pass: process.env.EMAIL_PASS, // ton mot de passe
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Password Reset',
    text: `You requested a password reset. Use this token to reset your password: ${token}`,
  };

  await transporter.sendMail(mailOptions);
};
