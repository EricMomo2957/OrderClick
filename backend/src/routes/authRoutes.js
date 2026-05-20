import express from 'express';
import db from '../config/db.js'; // Database connection matching your phpMyAdmin setup
import { register, login, requestPasswordReset } from '../controllers/authController.js';
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
router.get('/forgot-password-requests', async (req, res) => {
    try {
        // Query matching your exact password_resets schema columns from phpMyAdmin
        const [rows] = await db.execute(
            'SELECT id, user_id, email, status, created_at, updated_at FROM password_resets'
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching password resets:", error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

// 💡 UPDATE A REQUEST TO RESOLVED (Called when clicking "Mark as Resolved")
router.put('/forgot-password-requests/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Expecting { status: 'resolved' }
    
    try {
        await db.execute(
            'UPDATE password_resets SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, id]
        );
        res.status(200).json({ message: 'Request status updated successfully' });
    } catch (error) {
        console.error("Error updating password reset status:", error);
        res.status(500).json({ error: 'Failed to update database entry' });
    }
});

export default router;