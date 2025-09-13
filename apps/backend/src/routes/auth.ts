import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import auth from '../middleware/auth';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);

export default router;