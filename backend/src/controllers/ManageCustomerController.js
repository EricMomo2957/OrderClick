import db from '../config/db.js';

// Fetch all registered customers
export const getAllCustomers = (req, res) => {
    const query = "SELECT id, fullname, email, created_at FROM users WHERE role = 'customer'";
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching customers:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.status(200).json(results);
    });
};

// Fetch Dashboard Overview Statistics
export const getAdminStats = (req, res) => {
    // We combine three queries into one string
    const query = `
        SELECT SUM(total_price) as revenue FROM receipts WHERE status = 'verified';
        SELECT COUNT(*) as receipts FROM receipts;
        SELECT COUNT(*) as products FROM products;
    `;

    db.query(query, (err, results) => {
    if (err) {
        console.error("Error fetching stats:", err);
        return res.status(500).json({ error: "Database error" });
    }

    // Add checks ( || {} ) to prevent crashing if a table is empty
    const revenueData = results[0][0] || { revenue: 0 };
    const receiptData = results[1][0] || { receipts: 0 };
    const productData = results[2][0] || { products: 0 };

    res.json({
        revenue: revenueData.revenue || 0,
        receipts: receiptData.receipts || 0,
        products: productData.products || 0,
        lowStock: 0
    });
});
};