// BACKEND/src/routes/productRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import * as productController from '../controllers/productController.js';
// Import authorization and authentication middlewares
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'; 
// Import the receipt functions from your order controller
import { getAllReceipts, updateReceiptStatus, deleteReceipt } from '../controllers/orderController.js';

const router = express.Router();

/**
 * MULTER CONFIGURATION (For Product Images)
 */
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

/**
 * PRODUCT MANAGEMENT ROUTES (Protected with Token Validation & Admin Verification)
 */
// Public route for viewing products (Customers & Admins can access)
router.get('/', productController.getAllProducts);

// Protected administrative actions for mutating inventory records
router.post('/add', verifyToken, isAdmin, upload.single('image'), productController.addProduct);

// 🔥 CRITICAL SYNC: Ensure this endpoint path matches your frontend request (e.g., /api/products/update/:id or /api/products/:id)
router.put('/update/:id', verifyToken, isAdmin, upload.single('image'), productController.updateProduct);

router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);

/**
 * ADMIN RECEIPT MANAGEMENT ROUTES
 * These will be accessible at /api/products/admin/receipts...
 */
router.get('/admin/receipts', verifyToken, isAdmin, getAllReceipts);
router.patch('/admin/receipts/:id/status', verifyToken, isAdmin, updateReceiptStatus);
router.delete('/admin/receipts/:id', verifyToken, isAdmin, deleteReceipt);

export default router;