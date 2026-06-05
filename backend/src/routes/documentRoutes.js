const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const documentController = require('../controllers/documentController');
const { verifyToken } = require('../middleware/authMiddleware'); // Path to your auth structural guard middleware

// Configure local folder directory parameters
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/documents/'); // Make sure this folder path exists structurally in your server root!
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `DOC-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Structural boundary validation filter configurations 
const fileFilter = (req, file, cb) => {
    const allowedExtensions = /.\.(jpeg|jpg|png|pdf|docx)$/i;
    const isMimeValid = ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype);
    
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

// Secure endpoint routing entries mapping logic
router.post('/submit', verifyToken, upload.single('document'), documentController.uploadDocument);
router.get('/my-logs', verifyToken, documentController.getCustomerDocuments);

module.exports = router;