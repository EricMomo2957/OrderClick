import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool instead of a single connection
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'orderclick_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// For Pools, we don't use .connect(). We use .getConnection() to test it.
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to MySQL Database (Pool).');
        connection.release(); // Release back to pool
    }
});

export default db;