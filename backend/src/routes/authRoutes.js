import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// Routes
router.post('/register', register);
router.post('/login', login);

// THIS IS THE MISSING LINE:
export default router;