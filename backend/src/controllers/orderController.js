import db from '../config/db.js';

// --- REGISTERED USER ORDER ---
/**
 * REGISTERED USER ORDER
 * Handles orders for logged-in users, including payment reference tracking.
 */
export const placeOrder = (req, res) => {
    // Destructuring new fields from the request body
    const { 
        userId, 
        productId, 
        quantity, 
        totalPrice, 
        referenceNumber, 
        paymentMethod 
    } = req.body;

    // Validation to ensure critical IDs are present
    if (!userId || !productId) {
        return res.status(400).json({ message: "Missing User ID or Product ID" });
    }

    // SQL updated to include reference_number and payment_method
    const orderSql = `
        INSERT INTO receipts 
        (user_id, product_id, quantity, total_price, reference_number, payment_method, status) 
        VALUES (?, ?, ?, ?, ?, ?, "pending")
    `;
    
    // Execute the order insertion
    db.query(
        orderSql, 
        [userId, productId, quantity, totalPrice, referenceNumber, paymentMethod], 
        (err, result) => {
            if (err) {
                console.error("Order Insertion Error:", err);
                return res.status(500).json({ 
                    message: "Database error during order placement",
                    error: err.message 
                });
            }

            // Successfully inserted into receipts, now deduct stock from products table
            const updateStockSql = 'UPDATE products SET stock = stock - ? WHERE id = ?';
            
            db.query(updateStockSql, [quantity, productId], (updateErr) => {
                if (updateErr) {
                    // We log the error but don't fail the response since the receipt is already created
                    console.error("Stock Update Error:", updateErr);
                }

                // Return success with the new Order ID (result.insertId)
                res.status(200).json({ 
                    message: 'Order placed successfully!', 
                    orderId: result.insertId,
                    reference: referenceNumber
                });
            });
        }
    );
};
// --- GUEST / EXTERNAL ORDER ---
export const placeExternalOrder = (req, res) => {
    const { customerName, email, phone, address, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "No items selected for the order." });
    }

    let completed = 0;
    let hasError = false;

    items.forEach((item) => {
        // 1. Insert into receipts with guest details
        const orderSql = `
            INSERT INTO receipts 
            (user_id, product_id, quantity, total_price, status, guest_name, guest_email, guest_phone, guest_address) 
            VALUES (NULL, ?, ?, ?, 'pending', ?, ?, ?, ?)
        `;
        const totalPrice = item.price * item.qty;

        db.query(orderSql, [item.id, item.qty, totalPrice, customerName, email, phone, address], (err) => {
            if (err) {
                console.error("Insert Error:", err);
                hasError = true;
            }

            // 2. Deduct stock from products table
            const updateStockSql = 'UPDATE products SET stock = stock - ? WHERE id = ?';
            db.query(updateStockSql, [item.qty, item.id], (updateErr) => {
                if (updateErr) {
                    console.error("Stock Update Error:", updateErr);
                    hasError = true;
                }

                completed++;
                // Once all items in the array are processed, send final response
                if (completed === items.length) {
                    if (hasError) {
                        return res.status(500).json({ message: "Order processed with some database errors." });
                    }
                    return res.status(200).json({ message: "Order placed and stock updated successfully!" });
                }
            });
        });
    });
};

// --- FETCHING DATA ---

export const getUserOrders = (req, res) => {
    const { userId } = req.params;
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

// Admin Table Logic: Combines Registered and Guest names
export const getAllReceipts = (req, res) => {
    const sql = `
        SELECT 
            r.*, 
            p.name as product_name, 
            u.fullname as registered_name,
            /* If guest_name exists (from OrderNow form), use it. Otherwise, use registered user's name */
            COALESCE(r.guest_name, u.fullname) as display_name
        FROM receipts r 
        JOIN products p ON r.product_id = p.id 
        LEFT JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Fetch All Receipts Error:", err);
            return res.status(500).json(err);
        }
        res.json(results);
    });
};

// --- UPDATE & DELETE ---

export const updateReceiptStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 
    const sql = 'UPDATE receipts SET status = ? WHERE id = ?';
    db.query(sql, [status, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `Order ${status} successfully` });
    });
};

export const deleteReceipt = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM receipts WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Record deleted" });
    });
};