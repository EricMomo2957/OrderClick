// src/routes/notificationRoutes.js
import express from 'express';
import { streamNotifications } from '../controllers/notificationController.js';

const router = express.Router();

// Route mapping tracking active streams
router.get('/stream', streamNotifications);

export default router;