import express from 'express';

// --- Controller Imports ---
import { 
    getStats, 
    getAllCustomers,
    getRevenueSummary, 
    getRecentOrders,   
    getTopProducts,
    updateCustomer // 👈 IMPORTED: Your customer profile modification controller
} from '../controllers/ManageCustomerController.js';

import { 
    getGuestOrders, 
    updateGuestOrderStatus,
    deleteCustomerProfile,       // Unified administration import hook
    disableCustomerProfile,      // 🛑 IMPORTED: Your new disable controller hook
    resolveForgotPasswordRequest // 🚀 FIXED NAME MATCH: Pointing to your resolution handler
} from '../controllers/adminController.js'; 

import { 
    getPasswordResetRequests
} from '../controllers/authController.js'; 

import { 
    submitMessage, 
    getAllMessages, 
    updateMessageStatus, 
    deleteMessage 
} from '../controllers/MessageController.js';

import { 
    getAuditLogs, 
    clearAuditLogs 
} from '../controllers/ManageAuditLogController.js';

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

// 🛠️ FIXED: Updated path to match front-end request URL pattern and linked the correct controller
router.put('/customers/:id', verifyToken, isAdmin, updateCustomer);

router.delete('/delete-customer/:id', verifyToken, isAdmin, deleteCustomerProfile);
// 🛑 NEW: PUT request to handle account state blocking cleanly
router.put('/disable-customer/:id', verifyToken, isAdmin, disableCustomerProfile);

// --- Guest Order Checkouts ---
router.get('/guest-orders', verifyToken, isAdmin, getGuestOrders);
router.put('/guest-orders/:orderId/status', verifyToken, isAdmin, updateGuestOrderStatus);

// --- Visitor Approaches / Message Center ---
router.get('/messages/all', verifyToken, isAdmin, getAllMessages);
router.put('/messages/:messageId/status', verifyToken, isAdmin, updateMessageStatus);
router.delete('/messages/:messageId', verifyToken, isAdmin, deleteMessage);

// --- Account Recovery Matrix ---
// GET requests to render rows cleanly into your dashboard component grid
router.get('/forgot-password-requests', verifyToken, isAdmin, getPasswordResetRequests);
// PUT requests to handle state mutation hooks securely
router.put('/forgot-password-requests/:id', verifyToken, isAdmin, resolveForgotPasswordRequest); // 🚀 FIXED

// --- System Operations Audit Trails ---
// Feeds the dynamic immutable transaction table view in your UI dashboard panel
router.get('/audit-logs', verifyToken, isAdmin, getAuditLogs);
router.delete('/audit-logs/purge', verifyToken, isAdmin, clearAuditLogs);

export default router;