// routes/announcementRoutes.js
import express from 'express';
const router = express.Router();
import announcementController from '../controllers/announcementController.js';

// These should just be '/' or '/latest'
router.get('/latest', announcementController.getLatest);
router.get('/', announcementController.getAll); 
router.post('/', announcementController.create);
router.delete('/:id', announcementController.delete);

export default router;