import db from '../config/db.js';

/**
 * ==========================================
 * ADMINISTRATOR EVENT CONTROLLERS
 * ==========================================
 */

/**
 * CREATE EVENT (Admin)
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
 * GET MY EVENTS (Admin)
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
 * UPDATE EVENT (Admin)
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
 * DELETE EVENT (Admin)
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

/**
 * ==========================================
 * CUSTOMER EVENT CONTROLLERS
 * ==========================================
 */

/**
 * CREATE CUSTOMER EVENT
 */
export const createCustomerEvent = async (req, res) => {
    const { title, description, event_date, location } = req.body;
    
    // Extracting user ID from token
    const customer_id = req.user?.id || req.user?.userId; 

    if (!customer_id) {
        return res.status(400).json({ error: "User ID not found in token." });
    }

    // Using customer_id for the admin_id column
    const query = 'INSERT INTO events (admin_id, title, description, event_date, location) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [customer_id, title, description, event_date, location], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Your event has been created!", eventId: result.insertId });
    });
};

/**
 * GET MY CUSTOMER EVENTS
 */
export const getMyCustomerEvents = (req, res) => {
    const customer_id = req.user?.id || req.user?.userId;

    if (!customer_id) {
        return res.status(400).json({ error: "User ID not found in token." });
    }

    const query = 'SELECT * FROM events WHERE admin_id = ? ORDER BY event_date ASC';
    
    db.query(query, [customer_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

/**
 * UPDATE CUSTOMER EVENT
 */
export const updateCustomerEvent = (req, res) => {
    const { id } = req.params;
    const { title, description, event_date, location } = req.body;
    const customer_id = req.user?.id || req.user?.userId;

    if (!customer_id) {
        return res.status(400).json({ error: "User ID not found in token." });
    }

    const query = 'UPDATE events SET title=?, description=?, event_date=?, location=? WHERE id=? AND admin_id=?';
    db.query(query, [title, description, event_date, location, id, customer_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(403).json({ message: "Unauthorized: You can only edit your own events" });
        res.json({ message: "Event updated successfully" });
    });
};

/**
 * DELETE CUSTOMER EVENT
 */
export const deleteCustomerEvent = (req, res) => {
    const { id } = req.params;
    const customer_id = req.user?.id || req.user?.userId;

    if (!customer_id) {
        return res.status(400).json({ error: "User ID not found in token." });
    }

    const query = 'DELETE FROM events WHERE id=? AND admin_id=?';
    db.query(query, [id, customer_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(403).json({ message: "Unauthorized: You can only delete your own events" });
        res.json({ message: "Event deleted successfully" });
    });
};