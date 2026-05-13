import db from '../config/db.js';

const announcementController = {
    getAll: async (req, res) => {
        try {
            const [rows] = await db.promise().execute('SELECT * FROM announcements ORDER BY created_at DESC');
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Error fetching announcements", error: error.message });
        }
    },

    getLatest: async (req, res) => {
        try {
            const [rows] = await db.promise().execute(
                'SELECT * FROM announcements WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1'
            );
            res.json(rows[0] || null);
        } catch (error) {
            res.status(500).json({ message: "Error fetching latest", error: error.message });
        }
    },

    create: async (req, res) => {
        const { title, message } = req.body;
        // Get image path if a file was uploaded
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!title || !message) return res.status(400).json({ message: "Required fields missing" });

        try {
            const [result] = await db.promise().execute(
                'INSERT INTO announcements (title, message, image_url, priority, is_active) VALUES (?, ?, ?, ?, ?)',
                [title, message, imageUrl, 'normal', true]
            );
            res.status(201).json({ id: result.insertId, title, imageUrl });
        } catch (error) {
            res.status(500).json({ message: "Database error", error: error.message });
        }
    },

    update: async (req, res) => {
        const { id } = req.params;
        const { title, message, is_active } = req.body;
        let imageUrl = req.body.image_url; // Keep old image if no new one

        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`; // Set new image path
        }

        try {
            await db.promise().execute(
                'UPDATE announcements SET title = ?, message = ?, image_url = ?, is_active = ? WHERE id = ?',
                [title, message, imageUrl, is_active, id]
            );
            res.json({ message: "Announcement updated successfully" });
        } catch (error) {
            res.status(500).json({ message: "Update error", error: error.message });
        }
    },

    delete: async (req, res) => {
        const { id } = req.params;
        try {
            await db.promise().execute('DELETE FROM announcements WHERE id = ?', [id]);
            res.json({ message: "Deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Delete error", error: error.message });
        }
    }
};

export default announcementController;