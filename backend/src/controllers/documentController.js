const db = require('../config/db'); // Path to your MySQL connection pool

// Handle single document submission upload pipelines
exports.uploadDocument = async (req, res) => {
    try {
        const userId = req.user.id; // Extracted securely from your JWT middleware
        const { document_title } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "No document file element detected in payload allocation." });
        }
        if (!document_title || document_title.trim() === "") {
            return res.status(400).json({ message: "Document classification title parameter is required." });
        }

        const { filename, path: filePath, mimetype, size } = req.file;

        const query = `
            INSERT INTO documents (user_id, document_title, file_name, file_path, mime_type, file_size) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.query(query, [userId, document_title, filename, filePath, mimetype, size], (err, result) => {
            if (err) {
                console.error("Database schema compilation error:", err);
                return res.status(500).json({ message: "Failed tracking database persistence records." });
            }
            
            return res.status(201).json({ 
                message: "Document entity successfully assigned to verification queue.",
                documentId: result.insertId 
            });
        });

    } catch (error) {
        console.error("Fatal document upload handling exception:", error);
        return res.status(500).json({ message: "Internal server operational exception." });
    }
};

// Retrieve history logs for a specific logged-in customer entity
exports.getCustomerDocuments = (req, res) => {
    const userId = req.user.id;
    const query = `SELECT id, document_title, file_name, status, created_at FROM documents WHERE user_id = ? ORDER BY created_at DESC`;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Database extraction failure:", err);
            return res.status(500).json({ message: "Failed extracting structural document registries." });
        }
        return res.status(200).json(results);
    });
};