import express from 'express';
import { placeOrder, getUserOrders } from '../controllers/orderController.js';

const router = express.Router();

router.post('/', placeOrder);
router.get('/user/:userId', getUserOrders);

export default router;