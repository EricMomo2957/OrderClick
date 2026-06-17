// backend/src/controllers/salesController.js
import db from '../config/db.js';

/**
 * Get all sales transactions with their complete item details
 */
export const getAllSales = async (req, res) => {
    try {
        // We cross-reference sales, users, and the original receipts tables
        const salesSql = `
            SELECT 
                s.*, 
                COALESCE(
                    NULLIF(TRIM(s.guest_name), ''), 
                    NULLIF(TRIM(u.fullname), ''), 
                    NULLIF(TRIM(r.guest_name), ''),
                    CONCAT('User Account #', s.user_id)
                ) AS customer_display_name,
                COALESCE(
                    NULLIF(TRIM(s.guest_email), ''), 
                    NULLIF(TRIM(u.email), ''), 
                    NULLIF(TRIM(r.guest_email), ''),
                    'No Email Registered'
                ) AS customer_email
            FROM sales s
            LEFT JOIN users u ON s.user_id = u.id
            LEFT JOIN receipts r ON s.id = r.id
            ORDER BY s.created_at DESC
        `;
        const [sales] = await db.query(salesSql);
        
        // Fetch child line items
        const [items] = await db.query(`
            SELECT si.*, p.name AS product_name, p.category 
            FROM sale_items si
            INNER JOIN products p ON si.product_id = p.id
        `);

        // Map child line items cleanly into their respective parent rows
        const formattedSales = sales.map(sale => ({
            ...sale,
            // Overwriting these ensures your frontend UI properties show the real names
            customer_name: sale.customer_display_name,
            customer_email: sale.customer_email,
            items: items.filter(item => item.sale_id === sale.id)
        }));

        return res.status(200).json(formattedSales);
    } catch (error) {
        console.error("Sales Controller Error:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Mutate a sale transaction's operational fulfillment status
 */
/**
 * Mutate a sale transaction's operational fulfillment status
 */
export const updateSaleStatus = async (req, res) => {
    const { id } = req.params; // Can be "145" or "ORD-145"
    const { status } = req.body; 

    // 🛡️ VALIDATION BLOCK: Only allow valid states to hit the database
    const validStatuses = ['pending', 'verified', 'rejected'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
            error: `Invalid operational status option. Allowed parameters are: ${validStatuses.join(', ')}` 
        });
    }

    // Extract raw numerical digits if an "ORD-" prefix is sent
    const cleanId = String(id).replace(/^\D+/g, '');

    try {
        // 1. Update status in the sales table
        const [result] = await db.query('UPDATE sales SET status = ? WHERE id = ? OR id = ?', [status, id, cleanId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Target transaction record not found." });
        }

        // 2. BACKWARDS SYNC: Update the source record back inside receipts table
        try {
            await db.query('UPDATE receipts SET status = ? WHERE id = ?', [status, cleanId]);
        } catch (receiptSyncErr) {
            console.error("Non-blocking backwards sync to receipts failed:", receiptSyncErr.message);
        }

        // 🔌 REAL-TIME SYNC: Emit event to all connected administrators automatically
        if (req.io) {
            req.io.emit('sales_status_updated', { id: isNaN(id) ? id : Number(id), status });
            if (!isNaN(cleanId)) {
                req.io.emit('sales_status_updated', { id: Number(cleanId), status });
            }
        }

        return res.status(200).json({ 
            success: true, 
            message: `Transaction status successfully updated to ${status}.` 
        });
    } catch (error) {
        console.error("Fulfillment operational patch update failed:", error.message);
        return res.status(500).json({ error: error.message });
    }
};