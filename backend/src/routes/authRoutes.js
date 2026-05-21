// routes/authRoutes.js
import express from 'express';
import { 
  register, 
  login, 
  requestPasswordReset,
  getPasswordResetRequests,      // 💡 Import your existing controller
  resolvePasswordResetRequest   // 💡 Import your existing controller
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Token validation middleware

const router = express.Router();

// --- EXISTING AUTHENTICATION & PROFILE ROUTES ---
router.post('/register', register);
router.post('/login', login);

// New public endpoint for customer request hook
router.post('/forgot-password', requestPasswordReset);

// Only a user with a valid token can hit this route now
router.put('/update-profile', authMiddleware); 


// --- NEW PASSWORD RESET ADMINISTRATIVE MATRIX ROUTES ---

// 💡 GET ALL PASSWORD RESET REQUESTS (Called by ManageForgotPassword.tsx)
// Uses your controller which correctly performs a JOIN with the users table to get the fullname!
router.get('/forgot-password-requests', getPasswordResetRequests);

// 💡 UPDATE A REQUEST TO RESOLVED (Called when clicking "Mark as Resolved")
// Uses your controller to securely handle parameter validation and SQL execution callbacks
router.put('/forgot-password-requests/:id', resolvePasswordResetRequest);

export default router;