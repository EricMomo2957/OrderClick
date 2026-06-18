// backend/src/controllers/orderController.js
import db from '../config/db.js';
import { logActivity } from '../utils/logger.js';

// ==========================================
// ---        ORDER PLACEMENT             ---
// ==========================================

/**
 * REGISTERED USER ORDER
 * Handles orders for logged-in users, including payment reference tracking.
 */
export const placeOrder = async (req, res) => {
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
    
    try {
        const [result] = await db.execute(orderSql, [userId, productId, quantity, totalPrice, referenceNumber, paymentMethod]);
        const orderId = result.insertId;

        // Log entry tracking for registered customer account placement
        try {
            logActivity({
                req,
                action: 'CUSTOMER_ORDER_PLACE',
                resource: 'receipts',
                resourceId: orderId,
                details: `Customer placed order #${orderId} via ${paymentMethod || 'Cash'}. Total: ₱${Number(totalPrice).toLocaleString()}`
            });
        } catch (logErr) {
            console.error("Non-blocking activity logging error:", logErr);
        }

        // Deduct stock from products table
        try {
            const updateStockSql = 'UPDATE products SET stock = stock - ? WHERE id = ?';
            await db.execute(updateStockSql, [quantity, productId]);
        } catch (updateErr) {
            console.error("Stock Update Error:", updateErr);
        }

        return res.status(200).json({ 
            message: 'Order placed successfully!', 
            orderId: orderId,
            reference: referenceNumber
        });

    } catch (err) {
        console.error("Order Insertion Error:", err);
        return res.status(500).json({ 
            message: "Database error during order placement",
            error: err.message 
        });
    }
};

/**
 * GUEST / EXTERNAL ORDER
 * Handles rapid checkouts directly from landing components for unregistered users.
 */
export const placeExternalOrder = async (req, res) => {
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

    let savedOrderIds = [];
    let cumulativeTotal = 0;

    try {
        // Sequentially process items using sync-safe loops to avoid thread blocks
        for (const item of items) {
            const orderSql = `
                INSERT INTO receipts 
                (user_id, product_id, quantity, total_price, reference_number, payment_method, status, guest_name, guest_email, guest_phone, guest_address) 
                VALUES (NULL, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
            `;
            const totalPrice = item.price * item.qty;
            cumulativeTotal += totalPrice;

            const [result] = await db.execute(orderSql, [
                item.id, 
                item.qty, 
                totalPrice, 
                reference_number || null, 
                payment_method,          
                guest_name, 
                guest_email, 
                guest_phone, 
                guest_address
            ]);

            savedOrderIds.push(result.insertId);

            const updateStockSql = 'UPDATE products SET stock = stock - ? WHERE id = ?';
            await db.execute(updateStockSql, [item.qty, item.id]);
        }

        const trackingOrderId = savedOrderIds.length > 0 ? savedOrderIds[0] : null;

        // Public visitor submission logs to system audit registry stream
        try {
            logActivity({
                req,
                action: 'VISITOR_MESSAGE_SUBMIT', 
                resource: 'messages',
                resourceId: trackingOrderId,
                details: `Visitor "${guest_name}" (${guest_email}) submitted a landing check-out order. Total: ₱${cumulativeTotal.toLocaleString()}`
            });
        } catch (logErr) {
            console.error("Non-blocking external activity logging error:", logErr);
        }

        return res.status(200).json({ 
            message: "Order placed and stock updated successfully!",
            orderId: savedOrderIds.length > 0 ? `ORD-${savedOrderIds[0]}` : null
        });

    } catch (error) {
        console.error("External Checkout Error:", error);
        return res.status(500).json({ 
            message: "Order processed with some database errors.",
            error: error.message 
        });
    }
};

/**
 * UNIFIED CHECKOUT ORDER
 * Seamlessly handles references, payment tracking, and returns structured payload for confirmation modals.
 */
export const placeCheckoutOrder = async (req, res) => {
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

    try {
        const [result] = await db.execute(orderSql, values);
        const orderId = result.insertId;
        const orderIdString = `ORD-${orderId}`;

        // Polymorphic Logger Evaluation
        try {
            logActivity({
                req,
                action: userId ? 'CUSTOMER_ORDER_PLACE' : 'VISITOR_MESSAGE_SUBMIT',
                resource: userId ? 'receipts' : 'messages',
                resourceId: orderId,
                details: `${userId ? 'Registered Customer' : `Guest Form "${guestName || 'Anonymous'}"`} processed transaction ${orderIdString}. Total Amount: ₱${Number(totalPrice).toLocaleString()}`
            });
        } catch (logErr) {
            console.error("Non-blocking checkout activity logging error:", logErr);
        }

        try {
            const updateStockSql = 'UPDATE products SET stock = stock - ? WHERE id = ?';
            await db.execute(updateStockSql, [quantity, productId]);
        } catch (updateErr) {
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

    } catch (err) {
        console.error("Checkout Insertion Error:", err);
        return res.status(500).json({ 
            success: false,
            message: "Database error during checkout placement",
            error: err.message 
        });
    }
};

// ==========================================
// ---            DATA FETCHING           ---
// ==========================================

/**
 * GET USER PURCHASE HISTORY
 */
export const getUserOrders = async (req, res) => {
    const { userId } = req.params;
    const sql = `
        SELECT r.*, p.name as product_name 
        FROM receipts r 
        JOIN products p ON r.product_id = p.id 
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
    `;

    try {
        const [results] = await db.execute(sql, [userId]);
        return res.json(results);
    } catch (err) {
        console.error("Fetch Orders Error:", err);
        return res.status(500).json({ error: "Failed to fetch purchase history" });
    }
};

/**
 * GET ALL RECEIPTS (Admin Panel View)
 */
export const getAllReceipts = async (req, res) => {
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
    
    try {
        const [results] = await db.execute(sql);
        return res.json(results);
    } catch (err) {
        console.error("Fetch All Receipts Error:", err);
        return res.status(500).json({ error: "Failed to fetch all orders." });
    }
};

// ==========================================
// ---         UPDATE & DELETE            ---
// ==========================================

/**
 * UPDATE RECEIPT STATUS (Polymorphic Cross-Table Sync Edition)
 * Fixed to align perfectly with auto-incrementing IDs and explicit invoice matching.
 */
export const updateReceiptStatus = async (req, res) => {
    const { id } = req.params; // The receipt ID from client request
    const { status } = req.body; 
    
    const validStatuses = ['pending', 'verified', 'rejected'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
            error: `Invalid status option. Allowed parameters are: ${validStatuses.join(', ')}` 
        });
    }

    try {
        // 1. Update status in the baseline receipts table
        await db.execute('UPDATE receipts SET status = ? WHERE id = ?', [status, id]);

        // 2. FETCH THE UPDATED RECEIPT ROW DATA
        const [receiptRows] = await db.execute('SELECT * FROM receipts WHERE id = ?', [id]);
        if (receiptRows.length > 0 && status === 'verified') {
            const receipt = receiptRows[0];
            
            // Build a clean invoice number layout matching your string design
            const generatedInvoiceNumber = `INV-${id}`;

            // Check if this sale already exists in the sales table via invoice sequence to prevent duplication
            const [existingSale] = await db.execute('SELECT * FROM sales WHERE invoice_number = ?', [generatedInvoiceNumber]);
            
            if (existingSale.length === 0) {
                // FIXED SQL: We let 'id' auto-increment naturally and explicitly include 'invoice_number'
                const insertSaleSql = `
                    INSERT INTO sales 
                    (invoice_number, user_id, total_amount, payment_method, reference_number, status, guest_name, guest_phone, guest_email, guest_address)
                    VALUES (?, ?, ?, ?, ?, 'verified', ?, ?, ?, ?)
                `;
                
                const [saleResult] = await db.execute(insertSaleSql, [
                    generatedInvoiceNumber,
                    receipt.user_id, // Stays null perfectly if guest
                    receipt.total_price,
                    receipt.payment_method,
                    receipt.reference_number,
                    receipt.guest_name,
                    receipt.guest_phone,
                    receipt.guest_email,
                    receipt.guest_address
                ]);

                const newSaleId = saleResult.insertId;

                // Insert breakdown row matching structural types
                const insertItemSql = `
                    INSERT INTO sale_items (sale_id, product_id, quantity, unit_price)
                    VALUES (?, ?, ?, ?)
                `;
                const unitPrice = receipt.quantity > 0 ? (receipt.total_price / receipt.quantity) : receipt.total_price;
                
                await db.execute(insertItemSql, [
                    newSaleId,
                    receipt.product_id,
                    receipt.quantity,
                    unitPrice
                ]);
            }
        }

        // 3. Keep backwards status updates stable using structural safe matching checks
        try {
            await db.execute(
                'UPDATE sales SET status = ? WHERE invoice_number = ?', 
                [status, `INV-${id}`]
            );
        } catch (salesDbErr) {
            console.error("Non-blocking cross-table sync failure to sales layout:", salesDbErr.message);
        }

        // 4. System Activity Audits log
        try {
            logActivity({
                req,
                action: status === 'verified' ? 'VERIFY_RECEIPT' : 'REJECT_RECEIPT',
                resource: 'receipts',
                resourceId: id,
                details: `Admin processed transaction invoice #${id} as ${status}.`
            });
        } catch (logErr) {
            console.error("Non-blocking status update activity logging error:", logErr);
        }

        // 5. Real-Time WS Socket Push notification broadcasts
        if (req.io) {
            req.io.emit('sales_status_updated', { id: Number(id), status });
            req.io.emit('sales_status_updated', { invoice_number: `INV-${id}`, status });
        }

        return res.json({ success: true, message: `Order and Sales registry status synced to ${status} successfully.` });
    } catch (err) {
        console.error("Critical failure during transaction validation routine:", err.message);
        return res.status(500).json({ error: err.message });
    }
};

/**
 * DELETE RECEIPT
 */
export const deleteReceipt = async (req, res) => {
    const { id } = req.params;
    
    try {
        await db.execute('DELETE FROM receipts WHERE id = ?', [id]);

        try {
            logActivity({
                req,
                action: 'DELETE_MESSAGE',
                resource: 'receipts',
                resourceId: id,
                details: `Permanently removed order transaction record reference matrix ID #${id} from the database.`
            });
        } catch (logErr) {
            console.error("Non-blocking delete activity logging error:", logErr);
        }

        return res.json({ message: "Record deleted" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};