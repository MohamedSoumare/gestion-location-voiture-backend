import express from 'express';
import {
  registerUser,
  loginUser,
  changePassword,
  requestPasswordReset,
  resetPassword,
  updateUserRole,
} from '../controllers/userControllers.js';
import { authMiddleware, checkRole } from '../middlewares/authMiddleware.js';
import {
  userRegistrationValidator,
  userLoginValidator,
  updatePasswordValidator,
} from '../validators/userValidator.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

// Route pour enregistrer un utilisateur
router.post(
  '/users/register',
  userRegistrationValidator,
  validate,
  registerUser
);
// Route pour connecter un utilisateur
router.post('/users/login', userLoginValidator, validate, loginUser);
// Route pour changer de mot de passe (authentification requise)
router.post(
  '/users/password-change',
  authMiddleware,
  updatePasswordValidator,
  validate,
  changePassword
);
// Route pour demander la réinitialisation de mot de passe
router.post('users/password-reset', requestPasswordReset);
// Route pour réinitialiser le mot de passe via un token (ici, on peut imaginer une route GET)
router.post('/users/password-reset/:token', resetPassword);
// Route pour mettre à jour le rôle d'un utilisateur (seulement pour les administrateurs)
router.put(
  '/users/update-role',
  authMiddleware,
  checkRole('admin'),
  updateUserRole
);

export default router;
