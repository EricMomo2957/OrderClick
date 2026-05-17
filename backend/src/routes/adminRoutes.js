// backend/routes/adminRoutes.js
import express from 'express';
import { 
    getStats, 
    getAllCustomers,
    getRevenueSummary, // 👈 Imported
    getRecentOrders,   // 👈 Imported
    getTopProducts     // 👈 Imported
} from '../controllers/ManageCustomerController.js';

const router = express.Router();

// Existing endpoints
router.get('/stats', getStats);
router.get('/customers', getAllCustomers);

// 🚀 NEW: Registered endpoints matching your frontend fetch targets!
router.get('/revenue-summary', getRevenueSummary);
router.get('/recent-orders', getRecentOrders);
router.get('/top-products', getTopProducts);

export default router;