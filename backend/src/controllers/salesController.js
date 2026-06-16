import db from '../config/db.js';

/**
 * Get all sales transactions with their complete item details
 */
export const getAllSales = async (req, res) => {
    try {
        // Fetch all parent records
        const [sales] = await db.query('SELECT * FROM sales ORDER BY created_at DESC');
        
        // Fetch all line items with joined product details
        const [items] = await db.query(`
            SELECT si.*, p.name AS product_name, p.category 
            FROM sale_items si
            INNER JOIN products p ON si.product_id = p.id
        `);

        // Map child line items cleanly into their respective parent rows
        const formattedSales = sales.map(sale => ({
            ...sale,
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
export const updateSaleStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'pending', 'verified', 'rejected'

    try {
        const [result] = await db.query('UPDATE sales SET status = ? WHERE id = ?', [status, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Target transaction record not found." });
        }

        return res.status(200).json({ success: true, message: `Transaction status updated to ${status}` });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};