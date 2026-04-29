import express from 'express';
const router = express.Router();

// Import using ES Modules syntax
import * as eventController from '../controllers/eventController.js'; 
import verifyToken from '../middleware/authMiddleware.js'; 

router.post('/', verifyToken, eventController.createEvent);
router.get('/my-events', verifyToken, eventController.getMyEvents);
router.put('/:id', verifyToken, eventController.updateEvent);
router.delete('/:id', verifyToken, eventController.deleteEvent);

export default router; // Use export default instead of module.exports