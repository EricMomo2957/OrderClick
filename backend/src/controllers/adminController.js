// backend/controllers/adminController.js
import db from '../config/db.js'; 
import { logAction } from '../utils/logger.js'; // Global Audit Logger Utility Hooked Up

// Fetch all guest orders
export const getGuestOrders = async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                guest_name,
                guest_email,
                guest_phone,
                guest_address,
                product_id,
                quantity,
                total_price,
                reference_number,
                payment_method,
                status,
                created_at
            FROM receipts
            WHERE user_id IS NULL 
               OR user_id = 0 
               OR user_id = ''
               OR guest_name IS NOT NULL
            ORDER BY created_at DESC
        `;

        // 🚀 FIX: Using db.promise().query ensures it safely evaluates as an async iterable array
        const [orders] = await db.promise().query(query);
        return res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching guest orders:", error);
        return res.status(500).json({ message: "Internal server error retrieving guest orders." });
    }
};

// Update order verification status (Pending, Verified, Rejected)
export const updateGuestOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value provided." });
    }

    try {
        const query = `
            UPDATE receipts 
            SET status = ? 
            WHERE id = ? 
              AND (user_id IS NULL OR user_id = 0 OR user_id = '' OR guest_name IS NOT NULL)
        `;
        
        // 🚀 FIX: Applied the same .promise().query fix to the status state modification
        const [result] = await db.promise().query(query, [status, orderId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Guest order not found." });
        }

        // 🚀 AUDIT TRIGGER: Automatically record when an admin modifies a guest receipt status
        await logAction({
            userId: req.user?.id,
            fullname: req.user?.fullname,
            role: 'admin',
            action: `UPDATE_GUEST_ORDER_${status.toUpperCase()}`,
            resource: 'receipts',
            resourceId: orderId,
            details: `Admin changed status of guest order reference matrix ID #${orderId} to '${status}'.`,
            req: req
        });

        return res.status(200).json({ message: `Order status updated to ${status} successfully.` });
    } catch (error) {
        console.error("Error updating guest order status:", error);
        return res.status(500).json({ message: "Failed to update order status." });
    }
};

// Account recovery / password resolution function inside adminController.js
export const resolveForgotPasswordRequest = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            UPDATE forgot_password_requests 
            SET status = 'resolved' 
            WHERE id = ?
        `;
        
        const [result] = await db.promise().execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Password request log entry not found." });
        }

        // ─── PASTE THE LOGGER CODE HERE ─────────────────────────────────────
        await logAction({
            userId: req.user.id,        // Set by your authMiddleware.js
            fullname: req.user.fullname,// Set by your authMiddleware.js
            role: 'admin',
            action: 'RESOLVED_PASSWORD_REQUEST',
            resource: 'forgot_password_requests',
            resourceId: id,
            details: `Resolved account recovery ticket for request ID #${id}`,
            req: req                    // Automatically extracts IP and User-Agent
        });
        // ────────────────────────────────────────────────────────────────────

        // Your existing response line:
        return res.json({ message: "Request resolved successfully." });

    } catch (err) {
        console.error("Error patching database entry:", err);
        return res.status(500).json({ error: "Network connectivity issue." });
    }
};