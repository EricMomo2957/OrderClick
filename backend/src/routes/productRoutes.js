import express from 'express';
import multer from 'multer';
import path from 'path';
import * as productController from '../controllers/productController.js';
// Import the receipt functions from your order controller
import { getAllReceipts, updateReceiptStatus, deleteReceipt } from '../controllers/orderController.js';
import { getAllAdminReceipts } from '../controllers/productController.js';
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
 * PRODUCT MANAGEMENT ROUTES
 */
router.get('/', productController.getAllProducts);
router.post('/add', upload.single('image'), productController.addProduct);
router.put('/:id', upload.single('image'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

/**
 * ADMIN RECEIPT MANAGEMENT ROUTES
 * These will be accessible at /api/products/admin/receipts...
 */
router.get('/admin/receipts', getAllAdminReceipts);
router.patch('/admin/receipts/:id/status', updateReceiptStatus);
router.delete('/admin/receipts/:id', deleteReceipt);

export default router;