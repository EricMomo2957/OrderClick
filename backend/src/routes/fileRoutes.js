import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadFile } from '../controllers/fileController.js';

const router = express.Router();

// Configure disk storage parameters for Multer
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        // Appends timestamp to prevent overwriting duplicate filenames
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Single file upload route listening for the key name 'file'
router.post('/upload', upload.single('file'), uploadFile);

export default router;