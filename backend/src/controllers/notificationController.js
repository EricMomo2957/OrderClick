// backend/src/controllers/notificationController.js
import db from '../config/db.js';

// 1. Maintain a global Set of active response objects to prevent duplicate links or array iteration crashes
export const clients = new Set();

/**
 * 2. 📡 SSE Stream Handler for Customers
 */
export const streamNotifications = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // Your Vite Frontend Port
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Add this response handle to our broadcast pool
  clients.add(res);
  console.log(`🔌 New SSE client linked! Active stream count: ${clients.size}`);

  // Send an initial handshake verification frame
  res.write(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);

  // Remove the client pool link cleanly if they refresh or close the tab
  req.on('close', () => {
    clients.delete(res);
    console.log(`❌ SSE client disconnected. Remaining active streams: ${clients.size}`);
  });
};

/**
 * 3. 🏛️ Fetch History Endpoint for Customers
 */
export const getNotificationHistory = async (req, res) => {
  try {
    console.log("📥 Incoming history request hitting backend controller API...");
    
    // Explicitly query rows from system_notifications table
    const [rows] = await db.execute(
      'SELECT id, title, message, type, created_at FROM system_notifications ORDER BY created_at DESC LIMIT 20'
    );
    
    console.log(`✅ Database fetch success! Dispatched ${rows.length} logs to customer client layout.`);
    return res.status(200).json(rows);
  } catch (err) {
    console.error("🔴 Database fetch failure inside getNotificationHistory:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 4. 🚀 Admin Trigger Helper & Broadcast Method
 */
export const broadcastNotification = async (title, message, type = 'info', ioInstance = null) => {
  try {
    // 1. Commit to the database log file asynchronously
    const [result] = await db.execute(
      'INSERT INTO system_notifications (title, message, type) VALUES (?, ?, ?)',
      [title, message, type]
    );

    const payload = {
      id: result.insertId,
      title,
      message,
      type,
      created_at: new Date().toISOString()
    };

    // 2. Push out to all open streaming customer interfaces live using native SSE Set iteration
    const formattedData = `data: ${JSON.stringify(payload)}\n\n`;
    for (const client of clients) {
      client.write(formattedData);
    }
    
    // 3. Dual-cast: If a socket io instance is passed from the controller request context, broadcast over ws channel too
    if (ioInstance) {
      ioInstance.emit('new_product_notification', {
        message: message,
        product: { id: result.insertId, title },
        timestamp: payload.created_at
      });
      console.log("⚡ Shared live notification message out over active Socket.io channel.");
    }
    
    console.log(`📡 Successfully committed row #${result.insertId} to DB and broadcasted alert to ${clients.size} active SSE customer streams.`);
  } catch (err) {
    console.error("🔴 Failed to commit and broadcast notification:", err);
  }
};