import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs'; // Import File System to automate folder creation
import { fileURLToPath } from 'url';
import documentController from '../controllers/documentController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Resolve absolute paths cleanly within ES Modules context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure local folder directory parameters absolutely
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Points safely to your server absolute root: /backend/uploads/documents/
        const targetPath = path.join(__dirname, '../../uploads/documents/');
        
        // Safety guard: Automatically create the folder if it does not exist yet
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }
        
        cb(null, targetPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `DOC-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Structural boundary validation filter configurations 
const fileFilter = (req, file, cb) => {
    const isMimeValid = [
        'image/jpeg', 
        'image/png', 
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ].includes(file.mimetype);
    
    if (isMimeValid) {
        cb(null, true);
    } else {
        cb(new Error('Invalid archive type parameter. Only JPEG, PNG, PDF, and DOCX matrices are cleared.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Maximum File Size Limit Parameters
});

// --- 1. Static Customer Routes ---
router.post('/submit', verifyToken, upload.single('document'), documentController.uploadDocument);
router.get('/my-logs', verifyToken, documentController.getCustomerDocuments);

// --- 2. Static Admin Routes ---
router.get('/admin/all', verifyToken, verifyAdmin, documentController.getAllDocumentsForAdmin);

// --- 3. Dynamic Parameter Routes ---
router.put('/admin/status/:id', verifyToken, verifyAdmin, documentController.updateDocumentStatus);

export default router;