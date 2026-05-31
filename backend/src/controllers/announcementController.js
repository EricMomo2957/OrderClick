// BACKEND/src/controllers/announcementController.js
import db from '../config/db.js';
import { logAction } from '../utils/logger.js'; // Import the unified audit utility

// 1. Get Latest Announcement
export const getLatest = async (req, res) => {
    try {
        const [rows] = await db.promise().execute(
            'SELECT * FROM announcements WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1'
        );
        res.json(rows[0] || null);
    } catch (error) {
        res.status(500).json({ message: "Error fetching latest", error: error.message });
    }
};

// 2. Get All Announcements
export const getAllAnnouncements = async (req, res) => {
    try {
        const [rows] = await db.promise().execute('SELECT * FROM announcements ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error fetching announcements", error: error.message });
    }
};

// 3. Create Announcement (With Schema Adaptation & FK Fallbacks)
export const createAnnouncement = async (req, res) => {
    const { title, message, content, priority } = req.body;
    const finalMessage = message || content;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !finalMessage) {
        return res.status(400).json({ message: "Required fields missing: title and message/content are required." });
    }

    try {
        // ✅ FIXED DATABASE INSERT: Removed non-existent column 'created_by' to perfectly match table schema
        const [result] = await db.promise().execute(
            'INSERT INTO announcements (title, message, image_url, priority, is_active) VALUES (?, ?, ?, ?, ?)',
            [title, finalMessage, imageUrl, priority || 'normal', true]
        );

        const announcementId = result.insertId;

        // Live Broadcast Delivery
        const io = req.app.get('socketio');
        if (io) {
            io.emit('new_announcement', {
                id: announcementId,
                title: title,
                message: finalMessage,
                imageUrl: imageUrl
            });
        }

        // Trace Matrix Entry Creation
        try {
            await logAction({
                req: req,
                action: 'CREATE_ANNOUNCEMENT', 
                resource: 'announcements',    
                resourceId: announcementId,
                details: {
                    message: `Created announcement title: "${title}"`,
                    payload: { title, message: finalMessage, image_url: imageUrl }
                }
            });
        } catch (auditError) {
            console.error("⚠️ Audit Log Writer caught an internal error:", auditError.message);
        }

        return res.status(201).json({ id: announcementId, title, imageUrl, message: "Broadcast posted successfully!" });
    } catch (error) {
        console.error("❌ SQL Database Core Error:", error);
        return res.status(500).json({ message: "Database error during placement", error: error.message });
    }
};

// 4. Update Announcement (Robust Error Handling & Fallbacks)
export const updateAnnouncement = async (req, res) => {
    const { id } = req.params;
    const { title, message, content, is_active } = req.body;
    const finalMessage = message || content;

    try {
        // 1. Fetch current data to preserve existing text values if form payloads are clean fragments
        const [rows] = await db.promise().execute('SELECT title, message, image_url, is_active FROM announcements WHERE id = ?', [id]);
        
        if (rows.length === 0) return res.status(404).json({ message: "Target announcement index framework not found" });

        // 2. Set strict fallbacks so SQL won't crash on undefined properties
        const validatedTitle = title !== undefined ? title : rows[0].title;
        const validatedMessage = finalMessage !== undefined ? finalMessage : rows[0].message;
        const validatedActive = is_active !== undefined ? is_active : rows[0].is_active;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : rows[0].image_url;

        // 3. Update the Database safely
        await db.promise().execute(
            'UPDATE announcements SET title = ?, message = ?, image_url = ?, is_active = ? WHERE id = ?',
            [validatedTitle, validatedMessage, imageUrl, validatedActive, id]
        );

        // 4. WebSocket Emit Channel Update
        const io = req.app.get('socketio');
        if (io) {
            io.emit('new_announcement', {
                id: id,
                title: validatedTitle,
                message: validatedMessage,
                imageUrl: imageUrl,
                isUpdate: true
            });
        }

        // 5. 📝 SECURE AUDIT MATRIX WRITER
        await logAction({
            req: req,
            action: 'UPDATE_ANNOUNCEMENT',
            resource: 'announcements',
            resourceId: id,
            details: {
                message: `Admin modified parameters for broadcast channel matching ID #${id}.`,
                title: validatedTitle,
                updated_at: new Date(),
                updated_fields: { title: validatedTitle, message: validatedMessage, is_active: validatedActive, image_url: imageUrl }
            }
        });

        res.json({ message: "Announcement updated successfully" });
    } catch (error) {
        console.error("SQL/Audit Error:", error); 
        res.status(500).json({ message: "Update transaction sequence error", error: error.message });
    }
};

// 5. Delete Announcement (With Audit Logging)
export const deleteAnnouncement = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Grab announcement title parameters before full deletion for descriptive metadata logging context
        const [rows] = await db.promise().execute('SELECT title FROM announcements WHERE id = ?', [id]);
        
        if (rows.length === 0) return res.status(404).json({ message: "Target announcement row structure does not exist" });
        
        const announcementTitle = rows[0].title || 'Unknown Broadcast';

        // 2. Perform target row erasure sequence
        await db.promise().execute('DELETE FROM announcements WHERE id = ?', [id]);

        // 3. 📝 AUDIT MATRIX: Write permanent records into storage tracking logs
        await logAction({
            req: req,
            action: 'DELETE_ANNOUNCEMENT',
            resource: 'announcements',
            resourceId: id,
            details: {
                message: `Permanently removed announcement: "${announcementTitle}"`,
                deleted_resource_title: announcementTitle
            }
        });

        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Delete sequence pipeline error", error: error.message });
    }
};