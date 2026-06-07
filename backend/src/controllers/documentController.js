// BACKEND/src/controllers/documentController.js
import db from '../config/db.js'; 
import { logAction } from '../utils/logger.js'; 

// Handle single document submission upload pipelines
export const uploadDocument = async (req, res) => {
    try {
        const userId = req.user?.id; // Extracted securely from your JWT middleware
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
        
        db.query(query, [userId, document_title, filename, filePath, mimetype, size], async (err, result) => {
            if (err) {
                console.error("Database schema compilation error:", err);
                return res.status(500).json({ message: "Failed tracking database persistence records." });
            }
            
            try {
                // 📝 AUDIT LOG: Document Submission Creation Trace
                await logAction({
                    req,
                    action: 'DOCUMENT_RECORD_CREATED',
                    resource: 'documents',
                    resourceId: result.insertId,
                    details: `Customer submitted tracking index payload for validation: "${document_title}" (File: ${filename})`
                });
            } catch (logErr) {
                console.error("⚠️ Audit logger failure:", logErr);
            }
            
            return res.status(201).json({ 
                message: "Document entity successfully assigned to verification queue.",
                documentId: result.insertId 
            });
        });

    } catch (error) {
        console.error("🔥 DETAILED UPLOAD CRASH ERROR:", error);
        return res.status(500).json({ 
            message: "Internal server operational exception.",
            error: error.message 
        });
    }
};

// Retrieve history logs for a specific logged-in customer entity
export const getCustomerDocuments = (req, res) => {
    const userId = req.user?.id;
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
export const getAllDocumentsForAdmin = (req, res) => {
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
export const updateDocumentStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Validate incoming status parameters
    if (!['pending', 'verified', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value provided." });
    }

    const query = `UPDATE documents SET status = ? WHERE id = ?`;

    db.query(query, [status, id], async (err, result) => {
        if (err) {
            console.error("Database update error:", err);
            return res.status(500).json({ message: "Failed to update document status." });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Document record not found." });
        }

        try {
            // 📝 AUDIT LOG: Admin Status Moderation Workflow Evaluation
            await logAction({
                req,
                action: `DOCUMENT_STATUS_${status.toUpperCase()}`,
                resource: 'documents',
                resourceId: id,
                details: `Admin changed parameters for item matching ID #${id}. Verification evaluation status altered to "${status}".`
            });
        } catch (logErr) {
            console.error("⚠️ Audit logger failure:", logErr);
        }

        return res.status(200).json({ message: "Document status updated successfully." });
    });
};

// Update document payload configurations securely (Customer Mutation Action)
export const updateDocument = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { document_title } = req.body;

        // 🔍 DEBUG LOGS: Check what the server is reading
        console.log("=== DEBUG: UPDATE DOCUMENT INCOMING DATA ===");
        console.log(`-> Target Document ID (from URL params): ${id} (Type: ${typeof id})`);
        console.log(`-> Logged-in User ID (from JWT token): ${userId} (Type: ${typeof userId})`);
        console.log(`-> New Document Title (from Form body): "${document_title}"`);
        console.log(`-> Is New File Attached?: ${req.file ? "YES - " + req.file.filename : "NO"}`);
        console.log("============================================");

        if (!document_title || document_title.trim() === "") {
            return res.status(400).json({ message: "Document classification title parameter is required." });
        }

        const selectQuery = `SELECT id, user_id, status FROM documents WHERE id = ?`;
        
        db.query(selectQuery, [id], (checkErr, results) => {
            if (checkErr) {
                console.error("Verification indexing crash:", checkErr);
                return res.status(500).json({ message: "Internal record verification query failure." });
            }
            
            if (results.length === 0) {
                console.log(`❌ FAIL: Document ID ${id} does not exist at all in the database.`);
                return res.status(404).json({ message: "Document record does not exist." });
            }

            const activeDoc = results[0];

            if (Number(activeDoc.user_id) !== Number(userId)) {
                return res.status(403).json({ message: "Action Denied: You do not own this document record." });
            }

            if (activeDoc.status !== 'pending') {
                return res.status(403).json({ message: "Action Denied: Document processing under evaluation cycle." });
            }

            // Proceed with updates
            if (req.file) {
                const { filename, path: filePath, mimetype, size } = req.file;
                const updateWithFileQuery = `
                    UPDATE documents 
                    SET document_title = ?, file_name = ?, file_path = ?, mime_type = ?, file_size = ?
                    WHERE id = ?
                `;
                db.query(updateWithFileQuery, [document_title, filename, filePath, mimetype, size, id], async (err) => {
                    if (err) return res.status(500).json({ message: "Failed updating database." });
                    
                    try {
                        // 📝 AUDIT LOG: Full Content Overwrite Trace (Metadata + Media Binary)
                        await logAction({
                            req,
                            action: 'DOCUMENT_RECORD_UPDATED',
                            resource: 'documents',
                            resourceId: id,
                            details: `Customer altered fields matching ID #${id}. Overwrote asset binary with file: ${filename} and reclassified title attribute parameters: ${JSON.stringify(req.body)}`
                        });
                    } catch (logErr) {
                        console.error("⚠️ Audit logger failure:", logErr);
                    }

                    return res.status(200).json({ message: "Document updated cleanly with new file asset." });
                });
            } else {
                const updateTitleQuery = `UPDATE documents SET document_title = ? WHERE id = ?`;
                db.query(updateTitleQuery, [document_title, id], async (err) => {
                    if (err) return res.status(500).json({ message: "Failed updating title attribute." });
                    
                    try {
                        // 📝 AUDIT LOG: Metadata String Variation Mutation Log
                        await logAction({
                            req,
                            action: 'DOCUMENT_RECORD_UPDATED',
                            resource: 'documents',
                            resourceId: id,
                            details: `Customer updated metadata criteria definitions for item ID #${id}. Text alteration details payload: ${JSON.stringify(req.body)}`
                        });
                    } catch (logErr) {
                        console.error("⚠️ Audit logger failure:", logErr);
                    }

                    return res.status(200).json({ message: "Document metadata configurations systematically altered." });
                });
            }
        });

    } catch (error) {
        console.error("🔥 DETAILED UPDATE LOG EXCEPTION:", error);
        return res.status(500).json({ message: "Internal transactional mutation exception.", error: error.message });
    }
};

// Permanently delete a pending document entry from tracking ledger
export const deleteDocument = (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;

    const checkQuery = `SELECT status, file_path FROM documents WHERE id = ? AND user_id = ?`;

    db.query(checkQuery, [id, userId], (checkErr, results) => {
        if (checkErr) {
            console.error("Target identification log fetch error:", checkErr);
            return res.status(500).json({ message: "Failed validating record status keys." });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Target document log pointer missing or instance mismatch." });
        }

        const document = results[0];
        if (document.status !== 'pending') {
            return res.status(403).json({ message: "Action Denied: Evaluated registry logs locked for compliance architecture archiving." });
        }

        // Execute deletion safely
        const deleteQuery = `DELETE FROM documents WHERE id = ? AND user_id = ?`;
        db.query(deleteQuery, [id, userId], async (deleteErr, deleteResult) => {
            if (deleteErr) {
                console.error("Database deletion instruction runtime error:", deleteErr);
                return res.status(500).json({ message: "Failed to cleanly remove tracking index allocations." });
            }

            try {
                // 📝 AUDIT LOG: Permanent Record Hard Deletion Purge
                await logAction({
                    req,
                    action: 'DOCUMENT_RECORD_DELETED',
                    resource: 'documents',
                    resourceId: id,
                    details: `Customer terminated tracking allocation instance matching entry identifier ID #${id}. Relational assets removed from storage logs.`
                });
            } catch (logErr) {
                console.error("⚠️ Audit logger failure:", logErr);
            }

            return res.status(200).json({ message: "Document tracking record purged." });
        });
    });
};

// Group everything into a default object export to satisfy documentRoutes.js
const documentController = {
    uploadDocument,
    getCustomerDocuments,
    getAllDocumentsForAdmin,
    updateDocumentStatus,
    updateDocument,
    deleteDocument  
};

export default documentController;