// backend/src/config/db.js
import mysql from 'mysql2/promise'; // Clean promise-based wrapper for async/await
import dotenv from 'dotenv';

dotenv.config();

// Create a promise-compatible connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'orderclick_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection using async/await pool handshake
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ Connected to MySQL Database via Promises.');
        connection.release(); // Return back to the pool instantly
    } catch (err) {
        console.error('❌ Database connection verification failed:', err.message);
    }
})();

export default db;