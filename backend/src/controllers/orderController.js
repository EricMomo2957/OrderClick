import db from '../config/db.js';

export const placeOrder = (req, res) => {
    const { userId, productId, quantity, totalPrice } = req.body;

    // 1. Check if user and product data exists
    if (!userId || !productId) {
        return res.status(400).json({ message: "Missing User ID or Product ID" });
    }

    // 2. Insert into receipts table
    const orderSql = 'INSERT INTO receipts (user_id, product_id, quantity, total_price, status) VALUES (?, ?, ?, ?, "pending")';
    
    db.query(orderSql, [userId, productId, quantity, totalPrice], (err, result) => {
        if (err) {
            console.error("Order Error:", err);
            return res.status(500).json({ message: "Database error during order placement" });
        }

        // 3. Deduct stock from products table
        const updateStockSql = 'UPDATE products SET stock = stock - ? WHERE id = ?';
        db.query(updateStockSql, [quantity, productId], (updateErr) => {
            if (updateErr) {
                console.error("Stock Update Error:", updateErr);
                // We don't return error here because the receipt was already created
            }
            
            res.status(200).json({ message: 'Order placed successfully!' });
        });
    });
};

export const getUserOrders = (req, res) => {
    const { userId } = req.params;
    
    // Join with products table to get the name of what was bought
    const sql = `
        SELECT r.*, p.name as product_name 
        FROM receipts r 
        JOIN products p ON r.product_id = p.id 
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Fetch Orders Error:", err);
            return res.status(500).json({ error: "Failed to fetch purchase history" });
        }
        res.json(results);
    });
};

// Fetch all receipts with customer names
export const getAllReceipts = (req, res) => {
    const sql = `
        SELECT r.*, p.name as product_name, u.fullname as customer_name 
        FROM receipts r 
        JOIN products p ON r.product_id = p.id 
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Update status
export const updateReceiptStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'verified' or 'rejected'
    const sql = 'UPDATE receipts SET status = ? WHERE id = ?';
    db.query(sql, [status, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `Order ${status} successfully` });
    });
};

// Delete record
export const deleteReceipt = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM receipts WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Record deleted" });
    });
};