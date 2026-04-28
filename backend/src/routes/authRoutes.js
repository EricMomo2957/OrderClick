import express from 'express';
import { register, login, updateProfile } from '../controllers/authController.js';

const router = express.Router();

// Routes
router.post('/register', register);
router.put('/update-profile', updateProfile);
router.post('/login', login);

// THIS IS THE MISSING LINE:
export default router;