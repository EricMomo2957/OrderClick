import express from 'express';
const router = express.Router();

// Import using ES Modules syntax
import * as eventController from '../controllers/eventController.js'; 
import verifyToken from '../middleware/authMiddleware.js'; 

/**
 * ==========================================
 * ADMINISTRATOR EVENT ROUTES
 * ==========================================
 */
router.post('/', verifyToken, eventController.createEvent);
router.get('/my-events', verifyToken, eventController.getMyEvents);
router.put('/:id', verifyToken, eventController.updateEvent);
router.delete('/:id', verifyToken, eventController.deleteEvent);

/**
 * ==========================================
 * CUSTOMER EVENT ROUTES
 * ==========================================
 */
// Prefixing these with /customer to distinguish them from admin routes
router.post('/customer', verifyToken, eventController.createCustomerEvent);
router.get('/customer/my-events', verifyToken, eventController.getMyCustomerEvents);
router.put('/customer/:id', verifyToken, eventController.updateCustomerEvent);
router.delete('/customer/:id', verifyToken, eventController.deleteCustomerEvent);

export default router;