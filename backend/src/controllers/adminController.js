// backend/controllers/adminController.js
import db from '../config/db.js'; 
import { logAction } from '../utils/logger.js'; // Global Audit Logger Utility Hooked Up

/**
 * 1. Fetch all guest orders
 * Endpoint matrix mapping targeting non-authenticated receipt submissions
 */
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

        // Direct call via native async await promise pool structure
        const [orders] = await db.execute(query);
        return res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching guest orders:", error);
        return res.status(500).json({ message: "Internal server error retrieving guest orders." });
    }
};

/**
 * 2. Update order verification status
 * Allows modifying structural verification matrices (Pending, Verified, Rejected)
 */
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
        
        const [result] = await db.execute(query, [status, orderId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Guest order not found." });
        }

        // AUDIT TRIGGER: Record administrative action details safely
        await logAction({
            userId: req.user?.id || 0,
            fullname: req.user?.fullname || 'System Admin',
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

/**
 * 3. Update password reset ticket status (Admin Action)
 */
export const resolveForgotPasswordRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || status !== 'resolved') {
            return res.status(400).json({ error: "Invalid status state transition assignment." });
        }

        const query = `
            UPDATE password_resets 
            SET status = 'resolved' 
            WHERE id = ?
        `;

        const [result] = await db.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Password reset record entry not found." });
        }

        try {
            // 📝 AUDIT LOG: Account Recovery Flag Resolution Log
            await logAction({
                req,
                action: 'ACCOUNT_RECOVERY_RESOLVED',
                resource: 'password_resets',
                resourceId: id,
                details: `Admin marked account recovery request matching entry reference token ID #${id} as systematically resolved.`
            });
        } catch (logErr) {
            console.error("⚠️ Audit logger failure inside admin space:", logErr);
        }

        return res.status(200).json({ message: "Password reset ticket updated to resolved cleanly." });

    } catch (error) {
        console.error("🔥 PASSWORD RESET RESOLUTION CRASH:", error);
        return res.status(500).json({ 
            error: "Internal transactional mutation exception.",
            details: error.message 
        });
    }
};

/**
 * 4. Update a registered customer's full details
 * FIX: Patched safety handlers to handle cases where req.user middleware is missing
 */
export const updateCustomerProfile = async (req, res) => {
    const { id } = req.params;
    const { fullname, email } = req.body;

    if (!fullname || !email) {
        return res.status(400).json({ message: "Fullname and email parameter updates are required." });
    }

    try {
        const query = `UPDATE users SET fullname = ?, email = ? WHERE id = ?`;
        const [result] = await db.execute(query, [fullname, email, parseInt(id, 10)]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Customer account target record not found." });
        }

        // IMUTABLE AUDIT TRIGGER: Fallbacks avoid throwing a 500 crash if token parsing wasn't attached
        await logAction({
            userId: req.user?.id || 0,
            fullname: req.user?.fullname || 'System Admin',
            role: 'admin',
            action: 'UPDATE_USER_DIRECTORY',
            resource: 'users',
            resourceId: id,
            details: `Admin altered account metrics for #USR-${id}. New identity payload: Name: "${fullname}", Email: "${email}".`,
            req: req
        });

        return res.status(200).json({ message: "Customer parameters updated successfully." });
    } catch (error) {
        console.error("Error mutating customer profile sequence:", error);
        return res.status(500).json({ message: "Internal server error altering directory parameters." });
    }
};

/**
 * 5. Permanently drop a registered customer entry context
 * Evaluates row footprints and clears them down via structural execution queries
 */
export const deleteCustomerProfile = async (req, res) => {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    try {
        // 1. Run a check to extract identity values before row clearance for meaningful logs
        const [userCheck] = await db.execute("SELECT fullname, email FROM users WHERE id = ?", [numericId]);
        if (userCheck.length === 0) {
            return res.status(404).json({ message: "Target customer trace entry not found." });
        }
        const targetedName = userCheck[0].fullname;

        // 🚀 2. FIX: Safely decouple active dependencies instead of cascading erasure.
        // Converts associated orders into anonymous "Guest Checkout Orders" so revenue graphs don't break!
        const decoupleQuery = `UPDATE receipts SET user_id = NULL WHERE user_id = ?`;
        await db.execute(decoupleQuery, [numericId]);

        // 3. Delete the target customer account sequence record safely now
        const query = `DELETE FROM users WHERE id = ?`;
        const [result] = await db.execute(query, [numericId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Failed execution. Record footprint absent." });
        }

        // 4. IMMUTABLE AUDIT TRIGGER: Track the complete erasure sequence safely
        await logAction({
            userId: req.user?.id || 0,
            fullname: req.user?.fullname || 'System Admin',
            role: 'admin',
            action: 'DELETE_USER_RECORD',
            resource: 'users',
            resourceId: id,
            details: `Permanently expunged customer identifier signature "${targetedName}" (#USR-${id}) from active system entries. Decoupled orders archived to guest records.`,
            req: req
        });

        return res.status(200).json({ message: "Customer trace dropped from database successfully." });
    } catch (error) {
        console.error("Database compilation error processing account deletion drops:", error);
        return res.status(500).json({ message: "Failed to purge targeted database entry context." });
    }
};