import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadFile } from '../controllers/fileController.js';

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), uploadFile);

export default router;