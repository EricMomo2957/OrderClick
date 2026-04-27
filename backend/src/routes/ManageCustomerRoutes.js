import express from 'express';
const router = express.Router();
import { getAllCustomers, getAdminStats } from '../controllers/ManageCustomerController.js';

// Final full paths:
// GET http://localhost:5000/api/admin/customers
router.get('/customers', getAllCustomers);

// GET http://localhost:5000/api/admin/stats
router.get('/stats', getAdminStats);

export default router;