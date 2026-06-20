// BACKEND/src/routes/announcementRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import * as announcementController from '../controllers/announcementController.js'; 
import { getAllAnnouncements } from '../controllers/announcementController.js';
const router = express.Router();

// --- 1. DEFINE MULTER STORAGE CONFIGURATION ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Instance configuration processing multi-part form payloads
const upload = multer({ storage }); 

// --- 2. PUBLIC CONSUMER DASHBOARD STREAM ENDPOINTS ---
router.get('/latest', announcementController.getLatest);
router.get('/', announcementController.getAllAnnouncements); 
router.get('/all', getAllAnnouncements);
// --- 3. PROTECTED ADMINISTRATIVE PIPELINE ROUTING CRITERIA ---
// Authentication & multi-part storage interception occur before database mutations/audit entries execute
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