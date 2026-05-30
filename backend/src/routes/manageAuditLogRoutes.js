import express from 'express';
import { getAuditLogs, clearAuditLogs } from '../controllers/ManageAuditLogController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'; // Adjust named imports based on your actual middleware

const router = express.Router();

// Both routes protected under strict token validation and admin checks
router.get('/audit-logs', verifyToken, isAdmin, getAuditLogs);
router.delete('/audit-logs/purge', verifyToken, isAdmin, clearAuditLogs);

export default router;