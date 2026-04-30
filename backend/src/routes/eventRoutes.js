import express from 'express';
import { 
  // Admin Controllers
  createEvent, 
  getMyEvents, 
  updateEvent, 
  deleteEvent,
  // Customer Controllers
  createCustomerEvent, 
  getMyCustomerEvents, 
  updateCustomerEvent, 
  deleteCustomerEvent 
} from '../controllers/eventController.js';
import { verifyToken } from '../middleware/authMiddleware.js'; 

const router = express.Router();

/**
 * ==========================================
 * ADMINISTRATOR EVENT ROUTES
 * ==========================================
 */
router.post('/', verifyToken, createEvent);
router.get('/my-events', verifyToken, getMyEvents);
router.put('/:id', verifyToken, updateEvent);
router.delete('/:id', verifyToken, deleteEvent);

/**
 * ==========================================
 * CUSTOMER EVENT ROUTES
 * ==========================================
 * These match the frontend fetch calls used in your Customer dashboard.
 */
// GET: http://localhost:5000/api/events/customer/my-events
router.get('/customer/my-events', verifyToken, getMyCustomerEvents);

// POST: http://localhost:5000/api/events/customer
router.post('/customer', verifyToken, createCustomerEvent);

// PUT: http://localhost:5000/api/events/customer/:id
router.put('/customer/:id', verifyToken, updateCustomerEvent);

// DELETE: http://localhost:5000/api/events/customer/:id
router.delete('/customer/:id', verifyToken, deleteCustomerEvent);

export default router;