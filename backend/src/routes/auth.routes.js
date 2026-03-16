import express from 'express';
import authController from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

export default router;
