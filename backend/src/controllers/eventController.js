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
    try {
        const { title, description, event_date, location } = req.body;
        
        // Check both common naming conventions for the ID to prevent null errors
        const admin_id = req.user?.id || req.user?.userId; 

        if (!admin_id) {
            return res.status(400).json({ error: "User ID not found in token." });
        }

        const query = 'INSERT INTO events (admin_id, title, description, event_date, location) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(query, [admin_id, title, description, event_date, location]);
        
        return res.status(201).json({ message: "Event published to portal!", eventId: result.insertId });
    } catch (err) {
        console.error("❌ Error creating admin event:", err);
        return res.status(500).json({ error: err.message });
    }
};

/**
 * GET MY EVENTS (Admin)
 */
export const getMyEvents = async (req, res) => {
    try {
        const admin_id = req.user?.id || req.user?.userId;

        if (!admin_id) {
            return res.status(400).json({ error: "User ID not found in token." });
        }

        const query = 'SELECT * FROM events WHERE admin_id = ? ORDER BY event_date ASC';
        const [results] = await db.execute(query, [admin_id]);
        
        return res.json(results);
    } catch (err) {
        console.error("❌ Error fetching admin events:", err);
        return res.status(500).json({ error: err.message });
    }
};

/**
 * UPDATE EVENT (Admin)
 */
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, event_date, location } = req.body;
        const admin_id = req.user?.id || req.user?.userId;

        if (!admin_id) {
            return res.status(400).json({ error: "User ID not found in token." });
        }

        const query = 'UPDATE events SET title=?, description=?, event_date=?, location=? WHERE id=? AND admin_id=?';
        const [result] = await db.execute(query, [title, description, event_date, location, id, admin_id]);
        
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: "Unauthorized or event not found" });
        }
        
        return res.json({ message: "Event updated successfully" });
    } catch (err) {
        console.error("❌ Error updating admin event:", err);
        return res.status(500).json({ error: err.message });
    }
};

/**
 * DELETE EVENT (Admin)
 */
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const admin_id = req.user?.id || req.user?.userId;

        if (!admin_id) {
            return res.status(400).json({ error: "User ID not found in token." });
        }

        const query = 'DELETE FROM events WHERE id=? AND admin_id=?';
        const [result] = await db.execute(query, [id, admin_id]);
        
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: "Unauthorized or event not found" });
        }
        
        return res.json({ message: "Event deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting admin event:", err);
        return res.status(500).json({ error: err.message });
    }
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
    try {
        const { title, description, event_date, location } = req.body;
        
        // Extracting user ID from token
        const customer_id = req.user?.id || req.user?.userId; 

        if (!customer_id) {
            return res.status(400).json({ error: "User ID not found in token." });
        }

        // Using customer_id for the admin_id column
        const query = 'INSERT INTO events (admin_id, title, description, event_date, location) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(query, [customer_id, title, description, event_date, location]);
        
        return res.status(201).json({ message: "Your event has been created!", eventId: result.insertId });
    } catch (err) {
        console.error("❌ Error creating customer event:", err);
        return res.status(500).json({ error: err.message });
    }
};

/**
 * GET MY CUSTOMER EVENTS
 */
export const getMyCustomerEvents = async (req, res) => {
    try {
        const customer_id = req.user?.id || req.user?.userId;

        if (!customer_id) {
            return res.status(400).json({ error: "User ID not found in token." });
        }

        const query = 'SELECT * FROM events WHERE admin_id = ? ORDER BY event_date ASC';
        const [results] = await db.execute(query, [customer_id]);
        
        return res.json(results);
    } catch (err) {
        console.error("❌ Error fetching customer events:", err);
        return res.status(500).json({ error: err.message });
    }
};

/**
 * UPDATE CUSTOMER EVENT
 */
export const updateCustomerEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, event_date, location } = req.body;
        const customer_id = req.user?.id || req.user?.userId;

        if (!customer_id) {
            return res.status(400).json({ error: "User ID not found in token." });
        }

        const query = 'UPDATE events SET title=?, description=?, event_date=?, location=? WHERE id=? AND admin_id=?';
        const [result] = await db.execute(query, [title, description, event_date, location, id, customer_id]);
        
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: "Unauthorized: You can only edit your own events" });
        }
        
        return res.json({ message: "Event updated successfully" });
    } catch (err) {
        console.error("❌ Error updating customer event:", err);
        return res.status(500).json({ error: err.message });
    }
};

/**
 * DELETE CUSTOMER EVENT
 */
export const deleteCustomerEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const customer_id = req.user?.id || req.user?.userId;

        if (!customer_id) {
            return res.status(400).json({ error: "User ID not found in token." });
        }

        const query = 'DELETE FROM events WHERE id=? AND admin_id=?';
        const [result] = await db.execute(query, [id, customer_id]);
        
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: "Unauthorized: You can only delete your own events" });
        }
        
        return res.json({ message: "Event deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting customer event:", err);
        return res.status(500).json({ error: err.message });
    }
};