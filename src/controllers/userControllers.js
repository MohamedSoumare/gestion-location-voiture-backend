import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { sendResetEmail } from '../utils/emailService.js';

// Register a new user
export const registerUser = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role, status: 'active' }
    });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// User login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token, user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashedPassword } });
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Request password reset
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry
    await prisma.user.update({
      where: { email },
      data: { passwordResetToken: hashedToken, passwordResetExpires: expires }
    });
    await sendResetEmail(email, resetToken);
    return res.status(200).json({ message: 'Reset link sent' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await prisma.user.findFirst({
      where: { passwordResetToken: hashedToken, passwordResetExpires: { gte: new Date() } }
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, passwordResetToken: null, passwordResetExpires: null }
    });
    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  const { userId, newRole } = req.body;
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Only admins can change roles.' });
  }
  try {
    const updatedUser = await prisma.user.update({ where: { id: userId }, data: { role: newRole } });
    return res.status(200).json({ message: 'Role updated successfully', user: updatedUser });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
