import express from 'express';
import { UserController } from '../controll';
import {
  userRegistrationValidator,
  userLoginValidator,
  updatePasswordValidator,
} from '../validators/userValidators.js';
// import { vehicleValidator } from '../validators/vehicleValidator';
import { validate } from '../middlewares/validate.js';

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

export default router;
