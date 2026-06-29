// routes/authRoutes.js
import express from 'express';
import { 
  register, 
  login, 
  getProfile, // New controller import for read-only user metrics
  requestPasswordReset,
  getPasswordResetRequests,      
  resolvePasswordResetRequest,
  getUserMetrics 
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js'; 

const router = express.Router();

// --- PUBLIC METRICS & ANALYTICS ROUTES ---
// Static paths must sit above any dynamic /:id routing matrices
router.get('/metrics', getUserMetrics);

// --- AUTHENTICATION & PROFILE ROUTES ---
router.post('/register', register);
router.post('/login', login);

/**
 * READ-ONLY PROFILE FETCH
 * Securely grabs entire engineered profile metadata mapped from token
 */
router.get('/profile', authMiddleware, getProfile); 

// --- ADMINISTRATIVE PASSWORD RESET MATRIX ROUTES ---
router.post('/forgot-password', requestPasswordReset);
router.get('/forgot-password-requests', getPasswordResetRequests);
router.put('/forgot-password-requests/:id', resolvePasswordResetRequest);

export default router;