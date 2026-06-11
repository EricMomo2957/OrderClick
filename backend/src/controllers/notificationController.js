import db from '../config/db.js'; // Importing your MySQL configuration mapping

// Keeps track of active live customer client connections
let clients = [];

// 📡 SSE Stream Handler for Customers
export const streamNotifications = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // Your Vite Frontend Port
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Send an initial handshake verification frame
  res.write(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  clients.push(newClient);

  // Remove connection on close
  req.on('close', () => {
    clients = clients.filter(client => client.id !== clientId);
  });
};

// 🏛️ Fetch History Endpoint for Customers
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

// 🚀 Admin Trigger Helper (Call this inside productController.js when a product changes)
export const broadcastNotification = async (title, message, type = 'info') => {
  try {
    // 1. Commit to the database log file
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

    // 2. Push out to all open streaming customer interfaces live
    clients.forEach(client => {
      client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
    });
  } catch (err) {
    console.error("Failed to commit and broadcast notification:", err);
  }
};