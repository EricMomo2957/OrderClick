// src/routes/ManageCustomerRoutes.js
import express from 'express';
const router = express.Router();

// Import the new functions from your controller
import { 
    getAllCustomers, 
    getStats, 
    getCustomerById, 
    updateCustomer 
} from '../controllers/ManageCustomerController.js';

// --- Existing Routes ---
router.get('/customers', getAllCustomers);
router.get('/stats', getStats);

// ==========================================
// NEW: --- Customer Inspection & Update Routes ---
// ==========================================
// :id acts as a dynamic parameter that passes the database user ID to req.params
router.get('/customers/:id', getCustomerById);
router.put('/customers/:id', updateCustomer);

export default router;