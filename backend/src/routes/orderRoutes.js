import express from 'express';
import { 
    placeExternalOrder, 
    placeOrder, 
    getUserOrders, 
    getAllReceipts, 
    updateReceiptStatus, 
    deleteReceipt,
    placeCheckoutOrder 
} from '../controllers/orderController.js';

// Import authorization middleware
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- PUBLIC ROUTES (No Login Required) ---

// Route for OrderNow.tsx (Outside / Guest Customers)
router.post('/external-order', placeExternalOrder);

// Unified checkout endpoint (Handles references and returns modal data)
router.post('/checkout', placeCheckoutOrder); 


// --- PROTECTED ROUTES (Requires Login) ---

// Regular registered customer order placement
router.post('/place', verifyToken, placeOrder);

// Fetch purchase history for a specific logged-in customer
router.get('/user/:userId', verifyToken, getUserOrders);


// --- ADMIN ROUTES (Requires Login + Admin Role) ---

// Fetch all receipts for the Admin Panel Dashboard
router.get('/all', verifyToken, isAdmin, getAllReceipts);

// Update order verification status (e.g., pending -> verified)
router.put('/status/:id', verifyToken, isAdmin, updateReceiptStatus);

// Delete a receipt transaction log record
router.delete('/:id', verifyToken, isAdmin, deleteReceipt);

export default router;