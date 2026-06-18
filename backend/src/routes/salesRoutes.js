import express from 'express';
import { createSale, getAllSales } from '../controllers/salesController.js'; // Mapped with the 's'

const router = express.Router();

router.post('/create', createSale);
router.get('/all', getAllSales);

export default router;