// backend/src/controllers/MessageController.js
import db from '../config/db.js';
import { logAction } from '../utils/logger.js'; // Import the unified audit utility

// 1. Visitor Submits Message from landing page contact form (Public Route)
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
        const [result] = await db.execute(query, [fullname, email, message]);
        const insertedId = result.insertId;

        // 📡 REAL-TIME EMIT: Instantly alert the admin dashboard of a new visitor message
        const io = req.app.get('socketio');
        if (io) {
            io.emit('new_visitor_message', {
                id: insertedId,
                fullname,
                email,
                message,
                status: 'unread',
                created_at: new Date()
            });
        }

        // 📝 AUDIT MATRIX: Log the visitor action
        // Since this route is public, req.user won't exist. logAction handles this context safely.
        try {
            await logAction({
                req: req,
                action: 'VISITOR_MESSAGE_SUBMIT',
                resource: 'messages',
                resourceId: insertedId,
                details: {
                    message: `Visitor "${fullname}" (${email}) submitted a contact form message.`,
                    snippet: message.length > 60 ? `${message.substring(0, 60)}...` : message
                }
            });
        } catch (auditError) {
            console.error("⚠️ Audit Log Writer caught an internal error:", auditError.message);
        }

        return res.status(201).json({ message: "Your message has been sent successfully! Our team will reach out soon." });
    } catch (error) {
        console.error("❌ Error submitting contact form message:", error);
        return res.status(500).json({ message: "Internal server error saving your submission.", error: error.message });
    }
};

// 2. Admin fetches all messages (Protected)
export const getAllMessages = async (req, res) => {
    try {
        const query = `SELECT * FROM messages ORDER BY created_at DESC`;
        const [messages] = await db.execute(query);
        return res.status(200).json(messages);
    } catch (error) {
        console.error("❌ Error retrieving dashboard messages:", error);
        return res.status(500).json({ message: "Failed to gather records from database.", error: error.message });
    }
};

// 3. Admin updates a message status (read / archived) (Protected)
export const updateMessageStatus = async (req, res) => {
    const { messageId } = req.params;
    const { status } = req.body;

    if (!['unread', 'read', 'archived'].includes(status)) {
        return res.status(400).json({ message: "Invalid status state assigned." });
    }

    try {
        // Fetch sender metadata before mutation to build a precise description for the log matrix
        const [rows] = await db.execute('SELECT fullname FROM messages WHERE id = ?', [messageId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Target message not found." });
        }
        const senderName = rows[0].fullname || "Unknown Visitor";

        // Execute status update mutation
        const query = `UPDATE messages SET status = ? WHERE id = ?`;
        await db.execute(query, [status, messageId]);

        // 📡 REAL-TIME EMIT: Inform listening dashboard sessions to sync up status highlights
        const io = req.app.get('socketio');
        if (io) {
            io.emit('message_status_updated', { id: messageId, status });
        }

        // 📝 AUDIT MATRIX: Create a clean record log tracking who changed the message lifecycle status
        try {
            await logAction({
                req: req,
                action: 'UPDATE_MESSAGE_STATUS',
                resource: 'messages',
                resourceId: messageId,
                details: {
                    message: `Admin modified message state to [${status.toUpperCase()}] for message sent by "${senderName}".`,
                    updated_to: status
                }
            });
        } catch (auditError) {
            console.error("⚠️ Audit Log Writer caught an internal error:", auditError.message);
        }

        return res.status(200).json({ message: `Message marked as ${status}.` });
    } catch (error) {
        console.error("❌ Error updating message lifecycle state:", error);
        return res.status(500).json({ message: "Failed to update status.", error: error.message });
    }
};

// 4. Admin drops a message permanently (Protected)
export const deleteMessage = async (req, res) => {
    const { messageId } = req.params;

    try {
        // Capture context metadata parameters before full row erasure sequence executes
        const [rows] = await db.execute('SELECT fullname, email FROM messages WHERE id = ?', [messageId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Target message record does not exist." });
        }
        const senderInfo = `"${rows[0].fullname}" (${rows[0].email})`;

        // Perform target row erasure sequence
        const query = `DELETE FROM messages WHERE id = ?`;
        await db.execute(query, [messageId]);

        // 📡 REAL-TIME EMIT: Instantly remove the card item from front-end state management
        const io = req.app.get('socketio');
        if (io) {
            io.emit('message_deleted', { id: messageId });
        }

        // 📝 AUDIT MATRIX: Triggers the Rose/Red erasure trace badge on your log interface matrix
        try {
            await logAction({
                req: req,
                action: 'DELETE_MESSAGE',
                resource: 'messages',
                resourceId: messageId,
                details: {
                    message: `Permanently purged communication records submitted by ${senderInfo}.`
                }
            });
        } catch (auditError) {
            console.error("⚠️ Audit Log Writer caught an internal error:", auditError.message);
        }

        return res.status(200).json({ message: "Message removed from systems successfully." });
    } catch (error) {
        console.error("❌ Error deleting message record:", error);
        return res.status(500).json({ message: "Failed to purge database row entry.", error: error.message });
    }
};