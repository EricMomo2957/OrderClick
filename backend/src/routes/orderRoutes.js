import express from 'express';
import { 
    placeExternalOrder, 
    placeOrder, 
    getUserOrders, 
    getAllReceipts, 
    updateReceiptStatus, 
    deleteReceipt 
} from '../controllers/orderController.js';

// Import the middleware you just created
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- PUBLIC ROUTES (No Login Required) ---

// Route for OrderNow.tsx (Outside Customers - can remain public)
router.post('/external-order', placeExternalOrder);


// --- PROTECTED ROUTES (Requires Login) ---

// Regular customer order - Added verifyToken
router.post('/place', verifyToken, placeOrder);

// Fetch history for a specific customer - Added verifyToken
router.get('/user/:userId', verifyToken, getUserOrders);


// --- ADMIN ROUTES (Requires Login + Admin Role) ---

// Fetch all receipts - Added verifyToken and isAdmin
router.get('/all', verifyToken, isAdmin, getAllReceipts);

// Update status - Added verifyToken and isAdmin
router.put('/status/:id', verifyToken, isAdmin, updateReceiptStatus);

// Delete a receipt record - Added verifyToken and isAdmin
router.delete('/:id', verifyToken, isAdmin, deleteReceipt);

export default router;