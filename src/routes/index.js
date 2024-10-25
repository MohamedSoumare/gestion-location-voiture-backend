import express from 'express';
import { UserController } from '../controll';
import {
  userRegistrationValidator,
  userLoginValidator,
  updatePasswordValidator,
} from '../validators/userValidator';
// import { vehicleValidator } from '../validators/vehicleValidator';
import { validate } from '../middlewares/validate.js'; // Middleware to handle validation errors

const router = express.Router();

router.post(
  '/register',
  userRegistrationValidator,
  validate,
  UserController.register
);
router.post('/login', userLoginValidator, validate, UserController.login);
router.post(
  '/password-change',
  updatePasswordValidator,
  validate,
  UserController.changePassword
);
router.post('/password-reset-request', UserController.requestPasswordReset);
router.post('/password-reset', UserController.resetPassword);

router.post('/change-role', UserController.changeUserRole);

// Autres routes...

export default router;
