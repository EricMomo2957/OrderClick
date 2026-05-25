// backend/routes/adminRoutes.js
import express from 'express';
import { 
    getStats, 
    getAllCustomers,
    getRevenueSummary, 
    getRecentOrders,   
    getTopProducts 
} from '../controllers/ManageCustomerController.js';

// Import your guest order handlers and middleware
import { getGuestOrders, updateGuestOrderStatus } from '../controllers/adminController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Existing Dashboard & Customer Endpoints ---
router.get('/stats', verifyToken, isAdmin, getStats);
router.get('/customers', verifyToken, isAdmin, getAllCustomers);
router.get('/revenue-summary', verifyToken, isAdmin, getRevenueSummary);
router.get('/recent-orders', verifyToken, isAdmin, getRecentOrders);
router.get('/top-products', verifyToken, isAdmin, getTopProducts);

// --- Guest Order Request Endpoints ---
router.get('/guest-orders', verifyToken, isAdmin, getGuestOrders);
router.put('/guest-orders/:orderId/status', verifyToken, isAdmin, updateGuestOrderStatus);

export default router;