// backend/src/controllers/notificationController.js
import db from '../config/db.js'; // Importing your MySQL configuration mapping

// 1. Maintain a global Set of active response objects to prevent duplicate links or array iteration crashes
export const clients = new Set();

// 2. 📡 SSE Stream Handler for Customers
export const streamNotifications = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // Your Vite Frontend Port
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Add this response handle to our broadcast pool
  clients.add(res);

  // Send an initial handshake verification frame
  res.write(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);

  // Remove the client pool link cleanly if they refresh or close the tab
  req.on('close', () => {
    clients.delete(res);
  });
};

// 3. 🏛️ Fetch History Endpoint for Customers
export const getNotificationHistory = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, title, message, type, created_at FROM system_notifications ORDER BY created_at DESC LIMIT 20'
    );
    return res.status(200).json(rows);
  } catch (err) {
    console.error("Database fetch failure:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 4. 🚀 Admin Trigger Helper & Broadcast Method (Call this inside productController.js)
export const broadcastNotification = async (title, message, type = 'info') => {
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

    const formattedData = `data: ${JSON.stringify(payload)}\n\n`;
    
    // 2. Push out to all open streaming customer interfaces live using native Set iteration
    for (const client of clients) {
      client.write(formattedData);
    }
    
    console.log(`📡 Successfully committed to DB and broadcasted alert to ${clients.size} active customers.`);
  } catch (err) {
    console.error("Failed to commit and broadcast notification:", err);
  }
};