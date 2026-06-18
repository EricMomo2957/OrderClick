import db from '../config/db.js';

// 1. CREATE A NEW TRANSACTION (Checkout)
const createSale = async (req, res) => {
    const {
        invoice_number,
        user_id,
        guest_name,
        guest_email,
        guest_phone,
        guest_address, 
        payment_method,
        status,
        reference_number,
        items
    } = req.body;

    if (!invoice_number || !payment_method || !items || items.length === 0) {
        return res.status(400).json({ message: "Missing required invoice fields or items." });
    }

    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        let totalAmount = 0;
        const verifiedItems = [];

        for (const item of items) {
            const [products] = await connection.query(
                "SELECT price, stock, name FROM products WHERE id = ?", 
                [item.product_id]
            );

            if (products.length === 0) {
                throw new Error(`Product ID ${item.product_id} not found.`);
            }

            const product = products[0];

            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product: ${product.name}. Available: ${product.stock}`);
            }

            const itemSubtotal = product.price * item.quantity;
            totalAmount += itemSubtotal;

            verifiedItems.push({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: product.price
            });
        }

        const [saleResult] = await connection.query(
            `INSERT INTO sales 
            (invoice_number, user_id, guest_name, guest_email, guest_phone, location, total_amount, payment_method, status, reference_number) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [invoice_number, user_id || null, guest_name || null, guest_email || null, guest_phone || null, guest_address || null, totalAmount, payment_method, status || 'PENDING', reference_number || null]
        );

        const saleId = saleResult.insertId;

        for (const item of verifiedItems) {
            await connection.query(
                "INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
                [saleId, item.product_id, item.quantity, item.unit_price]
            );

            await connection.query(
                "UPDATE products SET stock = stock - ? WHERE id = ?",
                [item.quantity, item.product_id]
            );
        }

        await connection.commit();
        res.status(201).json({ message: "Sale processed successfully!", saleId });

    } catch (error) {
        await connection.rollback();
        console.error("🔴 Checkout Transaction Failure Error Log:", error);
        res.status(500).json({ message: "Transaction failed, database rolled back.", error: error.message });
    } finally {
        connection.release();
    }
};

// 2. GET UNIFIED REGISTRY DATA FOR FRONTEND PANELS
// ... (Your code remains the same)

// 2. GET UNIFIED REGISTRY DATA FOR FRONTEND PANELS
// In salesController.js
const getAllSales = async (req, res) => {
    try {
        const query = `
            SELECT 
                r.id,
                CONCAT('INV-', r.id) AS invoice_number,
                COALESCE(u.fullname, r.guest_name) AS customer_name,
                COALESCE(u.email, r.guest_email) AS customer_email,
                r.guest_phone,
                r.guest_address AS location, 
                r.total_price AS total_amount,
                r.payment_method,
                r.status,
                r.reference_number,
                r.created_at
            FROM receipts r
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC;
        `;
        
        const [sales] = await db.query(query);
        res.status(200).json(sales);
    } catch (error) {
        console.error("🔴 DATABASE FETCH FAILURE LOG:", error.message);
        res.status(500).json({ message: "Failed to retrieve records.", error: error.message });
    }
};

// ... (all your function code above)

export {
    createSale,
    getAllSales
};