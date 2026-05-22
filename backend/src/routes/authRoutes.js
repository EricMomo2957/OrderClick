// routes/authRoutes.js
import express from 'express';
import { 
  register, 
  login, 
  requestPasswordReset,
  getPasswordResetRequests,      
  resolvePasswordResetRequest   
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js'; 

const router = express.Router();

// --- EXISTING AUTHENTICATION & PROFILE ROUTES ---
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', requestPasswordReset);
router.put('/update-profile', authMiddleware); 

// --- NEW PASSWORD RESET ADMINISTRATIVE MATRIX ROUTES ---
router.get('/forgot-password-requests', getPasswordResetRequests);
router.put('/forgot-password-requests/:id', resolvePasswordResetRequest);

export default router;