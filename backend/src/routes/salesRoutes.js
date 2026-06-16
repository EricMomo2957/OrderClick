import express from 'express';
import { getAllSales, updateSaleStatus } from '../controllers/salesController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, isAdmin, getAllSales);
router.patch('/:id/status', verifyToken, isAdmin, updateSaleStatus);

export default router;