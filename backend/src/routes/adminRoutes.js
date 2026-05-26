// backend/routes/adminRoutes.js
import express from 'express';

// --- Controller Imports ---
import { 
    getStats, 
    getAllCustomers,
    getRevenueSummary, 
    getRecentOrders,   
    getTopProducts 
} from '../controllers/ManageCustomerController.js';

import { 
    getGuestOrders, 
    updateGuestOrderStatus 
} from '../controllers/adminController.js';

import { 
    submitMessage, 
    getAllMessages, 
    updateMessageStatus, 
    deleteMessage 
} from '../controllers/MessageController.js';

// --- Middleware Import ---
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==========================================
// 🌍 PUBLIC ENDPOINTS (Landing Page Form)
// ==========================================
router.post('/messages/submit', submitMessage);


// ==========================================
// 🔐 PROTECTED ADMINISTRATIVE ENDPOINTS
// ==========================================

// --- Dashboard Overview & Analytics ---
router.get('/stats', verifyToken, isAdmin, getStats);
router.get('/revenue-summary', verifyToken, isAdmin, getRevenueSummary);
router.get('/recent-orders', verifyToken, isAdmin, getRecentOrders);
router.get('/top-products', verifyToken, isAdmin, getTopProducts);

// --- User Directory ---
router.get('/customers', verifyToken, isAdmin, getAllCustomers);

// --- Guest Order Checkouts ---
router.get('/guest-orders', verifyToken, isAdmin, getGuestOrders);
router.put('/guest-orders/:orderId/status', verifyToken, isAdmin, updateGuestOrderStatus);

// --- Visitor Approaches / Message Center ---
router.get('/messages/all', verifyToken, isAdmin, getAllMessages);
router.put('/messages/:messageId/status', verifyToken, isAdmin, updateMessageStatus);
router.delete('/messages/:messageId', verifyToken, isAdmin, deleteMessage);

export default router;