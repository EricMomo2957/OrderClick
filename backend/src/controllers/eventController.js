import db from '../config/db.js';

/**
 * CREATE EVENT
 */
export const createEvent = async (req, res) => {
    const { title, description, event_date, location } = req.body;
    
    // Check both common naming conventions for the ID to prevent null errors
    const admin_id = req.user?.id || req.user?.userId; 

    if (!admin_id) {
        return res.status(400).json({ error: "User ID not found in token." });
    }

    const query = 'INSERT INTO events (admin_id, title, description, event_date, location) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [admin_id, title, description, event_date, location], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Event published to portal!", eventId: result.insertId });
    });
};

/**
 * GET MY EVENTS
 */
export const getMyEvents = (req, res) => {
    const admin_id = req.user?.id || req.user?.userId;

    if (!admin_id) {
        return res.status(400).json({ error: "User ID not found in token." });
    }

    const query = 'SELECT * FROM events WHERE admin_id = ? ORDER BY event_date ASC';
    
    db.query(query, [admin_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

/**
 * UPDATE EVENT
 */
export const updateEvent = (req, res) => {
    const { id } = req.params;
    const { title, description, event_date, location } = req.body;
    const admin_id = req.user?.id || req.user?.userId;

    if (!admin_id) {
        return res.status(400).json({ error: "User ID not found in token." });
    }

    const query = 'UPDATE events SET title=?, description=?, event_date=?, location=? WHERE id=? AND admin_id=?';
    db.query(query, [title, description, event_date, location, id, admin_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(403).json({ message: "Unauthorized or event not found" });
        res.json({ message: "Event updated successfully" });
    });
};

/**
 * DELETE EVENT
 */
export const deleteEvent = (req, res) => {
    const { id } = req.params;
    const admin_id = req.user?.id || req.user?.userId;

    if (!admin_id) {
        return res.status(400).json({ error: "User ID not found in token." });
    }

    const query = 'DELETE FROM events WHERE id=? AND admin_id=?';
    db.query(query, [id, admin_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(403).json({ message: "Unauthorized or event not found" });
        res.json({ message: "Event deleted successfully" });
    });
};