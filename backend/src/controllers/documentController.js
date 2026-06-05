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

// Retrieve ALL documents across all users (Admin view)
exports.getAllDocumentsForAdmin = (req, res) => {
    // Selects document fields plus user info from the linked users table
    const query = `
        SELECT 
            d.id,
            d.user_id,
            d.document_title,
            d.file_name,
            d.file_path,
            d.mime_type,
            d.file_size,
            d.status,
            d.created_at,
            u.fullname,
            u.email
        FROM documents d
        INNER JOIN users u ON d.user_id = u.id
        ORDER BY d.created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database retrieval failure for admin:", err);
            return res.status(500).json({ message: "Failed extracting structural document registries." });
        }
        return res.status(200).json(results);
    });
};

// Update the validation status of a document (Admin action)
exports.updateDocumentStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Validate incoming status parameters
    if (!['pending', 'verified', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value provided." });
    }

    const query = `UPDATE documents SET status = ? WHERE id = ?`;

    db.query(query, [status, id], (err, result) => {
        if (err) {
            console.error("Database update error:", err);
            return res.status(500).json({ message: "Failed to update document status." });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Document record not found." });
        }

        return res.status(200).json({ message: "Document status updated successfully." });
    });
};