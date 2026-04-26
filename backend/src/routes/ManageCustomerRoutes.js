import express from 'express';
const router = express.Router();
import { getAllCustomers } from '../controllers/ManageCustomerController.js';

router.get('/customers', getAllCustomers);

export default router;