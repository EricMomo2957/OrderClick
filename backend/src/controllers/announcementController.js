import db from '../config/db.js';

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

// 3. Create Announcement (With Real-Time WebSocket Broadcast)
export const createAnnouncement = async (req, res) => {
    const { title, message } = req.body;
    // Get image path if a file was uploaded by Multer
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !message) {
        return res.status(400).json({ message: "Required fields missing" });
    }

    try {
        // Execute Database Save
        const [result] = await db.promise().execute(
            'INSERT INTO announcements (title, message, image_url, priority, is_active) VALUES (?, ?, ?, ?, ?)',
            [title, message, imageUrl, 'normal', true]
        );

        // Retrieve global socket.io instance from app context
        const io = req.app.get('socketio');
        if (io) {
            // Broadcast the real-time event alert to all online customer dashboards
            io.emit('new_announcement', {
                id: result.insertId,
                title: title,
                message: message,
                imageUrl: imageUrl
            });
        }

        res.status(201).json({ id: result.insertId, title, imageUrl, message: "Broadcast posted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

// 4. Update Announcement (With Real-Time WebSocket Broadcast)
export const updateAnnouncement = async (req, res) => {
    const { id } = req.params;
    const { title, message, is_active } = req.body;

    try {
        // 1. Get the current announcement data first
        const [rows] = await db.promise().execute('SELECT image_url FROM announcements WHERE id = ?', [id]);
        
        if (rows.length === 0) return res.status(404).json({ message: "Not found" });

        // 2. Logic: If a new file is uploaded, use it. If not, KEEP the old image_url.
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : rows[0].image_url;

        // 3. Update the DB
        await db.promise().execute(
            'UPDATE announcements SET title = ?, message = ?, image_url = ?, is_active = ? WHERE id = ?',
            [title, message, imageUrl, is_active || 1, id]
        );

        // 4. Retrieve global socket.io instance and broadcast the modification alert
        const io = req.app.get('socketio');
        if (io) {
            io.emit('new_announcement', {
                id: id,
                title: title,
                message: message,
                imageUrl: imageUrl,
                isUpdate: true
            });
        }

        res.json({ message: "Announcement updated successfully" });
    } catch (error) {
        console.error("SQL Error:", error); 
        res.status(500).json({ message: "Update error", error: error.message });
    }
};

// 5. Delete Announcement
export const deleteAnnouncement = async (req, res) => {
    const { id } = req.params;
    try {
        await db.promise().execute('DELETE FROM announcements WHERE id = ?', [id]);
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Delete error", error: error.message });
    }
};