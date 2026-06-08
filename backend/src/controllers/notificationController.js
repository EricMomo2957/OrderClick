// src/controllers/notificationController.js

// Array to track active connection streams for logged-in customers
let customerClients = [];

/**
 * 1. Establish the persistent SSE connection stream pipe
 */
export const streamNotifications = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*' // Matches your standard cors configuration parameters
  });

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  customerClients.push(newClient);

  // Send initial handshake transmission packet back to the client side browser frame
  res.write(`data: ${JSON.stringify({ status: "connected", message: "OrderClick Core Stream Active" })}\n\n`);

  // Garbage collection: clean up if the consumer drops off or logs out
  req.on('close', () => {
    customerClients = customerClients.filter(client => client.id !== clientId);
  });
};

/**
 * 2. Unified broadcaster utility engine to push events down to clients
 */
export const sendNotificationBroadcast = (payload) => {
  customerClients.forEach(client => {
    try {
      client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (streamErr) {
      console.error(`Failed pushing bits to client handle connection ${client.id}:`, streamErr);
    }
  });
};