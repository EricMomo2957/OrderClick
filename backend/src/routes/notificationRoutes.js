// backend/src/routes/notificationRoutes.js
import express from 'express';
import { streamNotifications, getNotificationHistory } from '../controllers/notificationController.js';

const router = express.Router();

// Simple endpoint hit-logger middleware for debugging
router.use((req, res, next) => {
  console.log(`🔎 [Notification Route Access]: ${req.method} request hitting "${req.originalUrl}"`);
  next();
});

// Main system entrypoints
router.get('/stream', streamNotifications);
router.get('/history', getNotificationHistory);

export default router;