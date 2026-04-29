import express from 'express';
import { register, login, updateProfile } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Import your new middleware

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Only a user with a valid token can hit this route now
router.put('/update-profile', authMiddleware, updateProfile); 

export default router;