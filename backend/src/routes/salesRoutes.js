import express from 'express';
import { createSale, getAllSales } from '../controllers/salesController.js';

const router = express.Router();

router.get('/all', getAllSales);
router.post('/create', createSale);

export default router;