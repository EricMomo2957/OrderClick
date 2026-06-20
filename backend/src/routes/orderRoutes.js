import express from 'express';
import { 
    placeExternalOrder, 
    placeOrder, 
    getUserOrders, // Keeping the correct function name
    getAllReceipts, 
    updateReceiptStatus, 
    deleteReceipt,
    placeCheckoutOrder,
    getTopSellingProducts
} from '../controllers/orderController.js';

// Import authorization middleware
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- PUBLIC ROUTES ---
router.post('/external-order', placeExternalOrder);
router.post('/checkout', placeCheckoutOrder); 

// --- PROTECTED ROUTES (Requires Login) ---
router.post('/place', verifyToken, placeOrder);

// Fetch purchase history (Using the existing verified function)
router.get('/user/:userId', verifyToken, getUserOrders); 

// --- ADMIN ROUTES (Requires Admin Role) ---
router.get('/all', verifyToken, isAdmin, getAllReceipts);
router.put('/status/:id', verifyToken, isAdmin, updateReceiptStatus);
router.delete('/:id', verifyToken, isAdmin, deleteReceipt);

// TOP SELLING PRODUCTS
router.get('/products/top-selling', verifyToken, getTopSellingProducts);

export default router;