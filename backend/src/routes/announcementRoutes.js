import express from 'express';
import multer from 'multer';
import path from 'path';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import * as announcementController from '../controllers/announcementController.js'; 

const router = express.Router();

// --- 1. DEFINE MULTER CONFIG FIRST ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// This defines the 'upload' variable that was missing
const upload = multer({ storage }); 

// --- 2. PUBLIC ROUTES ---
router.get('/latest', announcementController.getLatest);
router.get('/', announcementController.getAllAnnouncements); 

// --- 3. PROTECTED ADMIN ROUTES ---
// Now 'upload' is defined and can be used here
router.post(
    '/', 
    verifyToken, 
    isAdmin, 
    upload.single('image'), 
    announcementController.createAnnouncement
);

router.put(
    '/:id', 
    verifyToken, 
    isAdmin, 
    upload.single('image'), 
    announcementController.updateAnnouncement
);

router.delete(
    '/:id', 
    verifyToken, 
    isAdmin, 
    announcementController.deleteAnnouncement
);

export default router;