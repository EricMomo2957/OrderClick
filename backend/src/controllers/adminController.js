// backend/controllers/adminController.js
import db from '../config/db.js'; 

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

        return res.status(200).json({ message: `Order status updated to ${status} successfully.` });
    } catch (error) {
        console.error("Error updating guest order status:", error);
        return res.status(500).json({ message: "Failed to update order status." });
    }
};