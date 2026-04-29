// Inside your routes/authRoutes.js
import express from 'express';
import { register, login } from '../controllers/authController.js';
import { updateProfile } from '../controllers/authController.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Add this line if it's missing! 
// This must be .put to match the frontend call
router.put('/update-profile', updateProfile); 

export default router;