// src/routes/ManageCustomerRoutes.js
import express from 'express';
const router = express.Router();

// CHANGE THIS LINE: Change getAdminStats to getStats
import { getAllCustomers, getStats } from '../controllers/ManageCustomerController.js';

router.get('/customers', getAllCustomers);

// CHANGE THIS LINE: Change getAdminStats to getStats
router.get('/stats', getStats);

export default router;