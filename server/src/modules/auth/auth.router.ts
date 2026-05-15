import { Router } from 'express';
import * as controller from './auth.controller';
import { loginSchema, registerSchema } from './auth.schema';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.get('/profile', authenticate, controller.getProfile);

export default router;