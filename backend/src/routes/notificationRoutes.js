import express from 'express';
import { streamNotifications, getNotificationHistory } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/stream', streamNotifications);
router.get('/history', getNotificationHistory);

export default router;