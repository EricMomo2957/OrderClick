// backend/controllers/MessageController.js
import db from '../config/db.js';

// Visitor Submits Message from landing page contact form
export const submitMessage = async (req, res) => {
    const { fullname, email, message } = req.body;

    if (!fullname || !email || !message) {
        return res.status(400).json({ message: "All input fields are required to approach our team." });
    }

    try {
        const query = `
            INSERT INTO messages (fullname, email, message, status) 
            VALUES (?, ?, ?, 'unread')
        `;
        await db.promise().query(query, [fullname, email, message]);
        return res.status(201).json({ message: "Your message has been sent successfully! Our team will reach out soon." });
    } catch (error) {
        console.error("Error submitting contact form message:", error);
        return res.status(500).json({ message: "Internal server error saving your submission." });
    }
};

// Admin fetches all messages
export const getAllMessages = async (req, res) => {
    try {
        const query = `SELECT * FROM messages ORDER BY created_at DESC`;
        const [messages] = await db.promise().query(query);
        return res.status(200).json(messages);
    } catch (error) {
        console.error("Error retrieving dashboard messages:", error);
        return res.status(500).json({ message: "Failed to gather records from database." });
    }
};

// Admin updates a message status (read / archived)
export const updateMessageStatus = async (req, res) => {
    const { messageId } = req.params;
    const { status } = req.body;

    if (!['unread', 'read', 'archived'].includes(status)) {
        return res.status(400).json({ message: "Invalid status state assigned." });
    }

    try {
        const query = `UPDATE messages SET status = ? WHERE id = ?`;
        const [result] = await db.promise().query(query, [status, messageId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Target message not found." });
        }

        return res.status(200).json({ message: `Message marked as ${status}.` });
    } catch (error) {
        console.error("Error updating message lifecycle state:", error);
        return res.status(500).json({ message: "Failed to update status." });
    }
};

// Admin drops a message permanently
export const deleteMessage = async (req, res) => {
    const { messageId } = req.params;

    try {
        const query = `DELETE FROM messages WHERE id = ?`;
        const [result] = await db.promise().query(query, [messageId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Target message record does not exist." });
        }

        return res.status(200).json({ message: "Message removed from systems successfully." });
    } catch (error) {
        console.error("Error deleting message record:", error);
        return res.status(500).json({ message: "Failed to purge database row entry." });
    }
};