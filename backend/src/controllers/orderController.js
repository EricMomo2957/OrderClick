import db from '../config/db.js';
import { logActivity } from '../utils/logger.js';

// ==========================================
// ---          ORDER PLACEMENT           ---
// ==========================================

/**
 * REGISTERED USER ORDER
 * Handles orders for logged-in users, including payment reference tracking.
 */
export const placeOrder = (req, res) => {
    const { 
        userId, 
        productId, 
        quantity, 
        totalPrice, 
        referenceNumber, 
        paymentMethod 
    } = req.body;

    if (!userId || !productId) {
        return res.status(400).json({ message: "Missing User ID or Product ID" });
    }

    const orderSql = `
        INSERT INTO receipts 
        (user_id, product_id, quantity, total_price, reference_number, payment_method, status) 
        VALUES (?, ?, ?, ?, ?, ?, "pending")
    `;
    
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

            const orderId = result.insertId;

            // Log entry tracking for registered customer account placement
            logActivity({
                req,
                action: 'CUSTOMER_ORDER_PLACE',
                resource: 'receipts',
                resourceId: orderId,
                details: `Customer placed order #${orderId} via ${paymentMethod || 'Cash'}. Total: ₱${Number(totalPrice).toLocaleString()}`
            });

            // Deduct stock from products table
            const updateStockSql = 'UPDATE products SET stock = stock - ? WHERE id = ?';
            db.query(updateStockSql, [quantity, productId], (updateErr) => {
                if (updateErr) {
                    console.error("Stock Update Error:", updateErr);
                }

                res.status(200).json({ 
                    message: 'Order placed successfully!', 
                    orderId: orderId,
                    reference: referenceNumber
                });
            });
        }
    );
};

/**
 * GUEST / EXTERNAL ORDER
 * Handles rapid checkouts directly from landing components for unregistered users.
 */
export const placeExternalOrder = (req, res) => {
    const { 
        guest_name, 
        guest_email, 
        guest_phone, 
        guest_address, 
        payment_method, 
        reference_number, 
        items 
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "No items selected for the order." });
    }

    let completed = 0;
    let hasError = false;
    let savedOrderIds = [];
    let cumulativeTotal = 0;

    items.forEach((item) => {
        const orderSql = `
            INSERT INTO receipts 
            (user_id, product_id, quantity, total_price, reference_number, payment_method, status, guest_name, guest_email, guest_phone, guest_address) 
            VALUES (NULL, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
        `;
        const totalPrice = item.price * item.qty;
        cumulativeTotal += totalPrice;

        db.query(
            orderSql, 
            [
                item.id, 
                item.qty, 
                totalPrice, 
                reference_number || null, 
                payment_method,          
                guest_name, 
                guest_email, 
                guest_phone, 
                guest_address
            ], 
            (err, result) => {
                if (err) {
                    console.error("Insert External Order Error:", err);
                    hasError = true;
                } else {
                    savedOrderIds.push(result.insertId);
                }

                const updateStockSql = 'UPDATE products SET stock = stock - ? WHERE id = ?';
                db.query(updateStockSql, [item.qty, item.id], (updateErr) => {
                    if (updateErr) {
                        console.error("Stock Update Error:", updateErr);
                        hasError = true;
                    }

                    completed++;
                    if (completed === items.length) {
                        if (hasError) {
                            return res.status(500).json({ message: "Order processed with some database errors." });
                        }
                        
                        const trackingOrderId = savedOrderIds.length > 0 ? savedOrderIds[0] : null;

                        // Public visitor submission logs to system audit registry stream
                        logActivity({
                            req,
                            action: 'VISITOR_MESSAGE_SUBMIT', 
                            resource: 'messages',
                            resourceId: trackingOrderId,
                            details: `Visitor "${guest_name}" (${guest_email}) submitted a landing check-out order. Total: ₱${cumulativeTotal.toLocaleString()}`
                        });

                        return res.status(200).json({ 
                            message: "Order placed and stock updated successfully!",
                            orderId: savedOrderIds.length > 0 ? `ORD-${savedOrderIds[0]}` : null
                        });
                    }
                });
            }
        );
    });
};

/**
 * UNIFIED CHECKOUT ORDER
 * Seamlessly handles references, payment tracking, and returns structured payload for confirmation modals.
 */
export const placeCheckoutOrder = (req, res) => {
    const { 
        userId, 
        productId, 
        quantity, 
        totalPrice, 
        paymentMethod, 
        referenceNumber,
        guestName,
        guestPhone,
        guestEmail,
        guestAddress 
    } = req.body;

    const orderSql = `
        INSERT INTO receipts 
        (user_id, product_id, quantity, total_price, reference_number, payment_method, status, guest_name, guest_phone, guest_email, guest_address) 
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
    `;

    const values = [
        userId || null, 
        productId, 
        quantity, 
        totalPrice, 
        referenceNumber || null, 
        paymentMethod || null, 
        guestName || null, 
        guestPhone || null, 
        guestEmail || null, 
        guestAddress || null
    ];

    db.query(orderSql, values, (err, result) => {
        if (err) {
            console.error("Checkout Insertion Error:", err);
            return res.status(500).json({ 
                success: false,
                message: "Database error during checkout placement",
                error: err.message 
            });
        }

        const orderId = result.insertId;
        const orderIdString = `ORD-${orderId}`;

        // Polymorphic Logger Evaluation
        logActivity({
            req,
            action: userId ? 'CUSTOMER_ORDER_PLACE' : 'VISITOR_MESSAGE_SUBMIT',
            resource: userId ? 'receipts' : 'messages',
            resourceId: orderId,
            details: `${userId ? 'Registered Customer' : `Guest Form "${guestName || 'Anonymous'}"`} processed transaction ${orderIdString}. Total Amount: ₱${Number(totalPrice).toLocaleString()}`
        });

        const updateStockSql = 'UPDATE products SET stock = stock - ? WHERE id = ?';
        db.query(updateStockSql, [quantity, productId], (updateErr) => {
            if (updateErr) {
                console.error("Stock Update Error:", updateErr);
            }

            return res.status(201).json({
                success: true,
                message: "Order placed successfully!",
                orderData: {
                    orderId: orderIdString,
                    receiptId: orderId,
                    paymentMethod: paymentMethod,
                    referenceNumber: referenceNumber,
                    totalPaid: totalPrice
                }
            });
        });
    });
};


// ==========================================
// ---          DATA FETCHING             ---
// ==========================================

/**
 * GET USER PURCHASE HISTORY
 */
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

/**
 * GET ALL RECEIPTS (Admin Panel View)
 */
export const getAllReceipts = (req, res) => {
    const sql = `
        SELECT 
            r.*, 
            p.name as product_name, 
            u.fullname as registered_name,
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


// ==========================================
// ---         UPDATE & DELETE            ---
// ==========================================

/**
 * UPDATE RECEIPT STATUS
 */
export const updateReceiptStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 
    
    const sql = 'UPDATE receipts SET status = ? WHERE id = ?';
    db.query(sql, [status, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Reuse your existing logActivity utility here
        logActivity({
            req,
            action: status === 'verified' ? 'VERIFY_RECEIPT' : 'REJECT_RECEIPT',
            resource: 'receipts',
            resourceId: id,
            details: `Admin processed receipt for order #${id} as ${status}.`
        });

        res.json({ message: `Order ${status} successfully` });
    });
};

/**
 * DELETE RECEIPT
 */
export const deleteReceipt = (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM receipts WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Admin permanent removal trace log
        logActivity({
            req,
            action: 'DELETE_MESSAGE',
            resource: 'receipts',
            resourceId: id,
            details: `Permanently removed order transaction record reference matrix ID #${id} from the database.`
        });

        res.json({ message: "Record deleted" });
    });
};