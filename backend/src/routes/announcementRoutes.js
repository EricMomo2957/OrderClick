import express from 'express';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'; // Import your middleware
// ... other imports (multer, controller)

const router = express.Router();

// Public: Customers can see these
router.get('/latest', announcementController.getLatest);
router.get('/', announcementController.getAll); 

// Protected: Only Admins can do these
router.post('/', verifyToken, isAdmin, upload.single('image'), announcementController.create);
router.put('/:id', verifyToken, isAdmin, upload.single('image'), announcementController.update);
router.delete('/:id', verifyToken, isAdmin, announcementController.delete);

export default router;