// announcementController.js
import db from '../config/db.js';

const announcementController = {
    // Get all announcements (For Admin Panel)
    getAll: async (req, res) => {
        try {
            // Added .promise() to handle non-promisified pool connections
            const [rows] = await db.promise().execute(
                'SELECT * FROM announcements ORDER BY created_at DESC'
            );
            res.json(rows);
        } catch (error) {
            console.error("Fetch Error:", error);
            res.status(500).json({ 
                message: "Error fetching announcements", 
                error: error.message 
            });
        }
    },

    // Get only the latest active announcement (For Customer Dashboard)
    getLatest: async (req, res) => {
        try {
            const [rows] = await db.promise().execute(
                'SELECT * FROM announcements WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1'
            );
            res.json(rows[0] || null);
        } catch (error) {
            console.error("Latest Fetch Error:", error);
            res.status(500).json({ 
                message: "Error fetching latest announcement", 
                error: error.message 
            });
        }
    },

    // Create new announcement (Admin Only)
    create: async (req, res) => {
        const { title, message } = req.body;

        // Validation
        if (!title || !message) {
            return res.status(400).json({ message: "Title and message are required" });
        }

        try {
            // Added .promise() and explicit defaults to prevent SQL errors
            const [result] = await db.promise().execute(
                'INSERT INTO announcements (title, message, priority, is_active) VALUES (?, ?, ?, ?)',
                [title, message, 'normal', true]
            );
            
            res.status(201).json({ 
                id: result.insertId, 
                title, 
                message 
            });
        } catch (error) {
            console.error("Database Error:", error);
            res.status(500).json({ 
                message: "Database error", 
                details: error.sqlMessage || error.message 
            });
        }
    },

    // Delete announcement (Admin Only)
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            await db.promise().execute(
                'DELETE FROM announcements WHERE id = ?', 
                [id]
            );
            res.json({ message: "Announcement deleted successfully" });
        } catch (error) {
            console.error("Delete Error:", error);
            res.status(500).json({ 
                message: "Error deleting announcement", 
                error: error.message 
            });
        }
    }
};

export default announcementController;