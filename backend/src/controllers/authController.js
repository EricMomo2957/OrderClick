import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * ============================================================================
 * 1. CORE AUTHENTICATION CONTROLLERS
 * ============================================================================
 */

/**
 * REGISTER CONTROLLER
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  const { fullname, email, password, role } = req.body; 
  
  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ error: "All fields (Full Name, Email, Password) are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [fullname, email, hashedPassword, role || 'customer'], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: "Registration failed. Email already exists." });
        }
        return res.status(500).json({ error: "Database error during registration." });
      }
      res.status(201).json({ message: "User registered successfully!" });
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Internal server error during registration." });
  }
};

/**
 * LOGIN CONTROLLER
 * POST /api/auth/login
 */
export const login = (req, res) => {
  const { email, password } = req.body;

  try {
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error during login." });
      
      const user = results[0];

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // FIXED: Included 'id' in the token payload to prevent admin_id null errors
      const token = jwt.sign(
        { 
          id: user.id,          // Essential for database relations
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'secret_key_orderclick',
        { expiresIn: '1d' }
      );

      res.json({ 
        message: "Login successful",
        token, 
        user: { 
          id: user.id,
          name: user.fullname, 
          email: user.email,
          role: user.role 
        } 
      });
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * ============================================================================
 * 2. ACCOUNT RECOVERY / FORGOT PASSWORD CONTROLLERS
 * ============================================================================
 */

/**
 * PUBLIC: CUSTOMER SUBMITS FORGOT PASSWORD REQUEST
 * POST /api/auth/forgot-password
 */
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: "Email address is required." });
    }

    // Verify if user exists in the database
    db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
      if (err) return res.status(500).json({ error: "Database error during account verification." });
      
      if (results.length === 0) {
        // Security best practice: don't reveal if an email doesn't exist
        return res.status(200).json({ message: "If the email exists in our system, the administrator will be notified." });
      }

      const userId = results[0].id;

      // Insert a reset ticket into password_resets table
      const sql = 'INSERT INTO password_resets (user_id, email, status) VALUES (?, ?, "pending")';
      db.query(sql, [userId, email], (insertErr) => {
        if (insertErr) {
          return res.status(500).json({ error: "Database error logging recovery request." });
        }
        res.status(201).json({ message: "Password reset request submitted successfully to management." });
      });
    });
  } catch (error) {
    console.error("Forgot Password Request Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * ADMIN ONLY: GET ALL FORGOT PASSWORD REQUESTS (JOINED WITH USERS FOR FULLNAME)
 * GET /api/admin/forgot-password-requests
 */
export const getPasswordResetRequests = (req, res) => {
  // Join tables to get the customer's full name alongside the ticket details
  const sql = `
    SELECT pr.id, pr.user_id, pr.email, pr.status, pr.created_at, u.fullname 
    FROM password_resets pr
    JOIN users u ON pr.user_id = u.id
    ORDER BY pr.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Fetch Reset Requests Error:", err);
      return res.status(500).json({ error: "Database error retrieving ticket logs." });
    }
    res.json(results);
  });
};

/**
 * ADMIN ONLY: UPDATE STATUS VALUE ('pending' -> 'resolved')
 * PUT /api/admin/forgot-password-requests/:id
 */
export const resolvePasswordResetRequest = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['pending', 'resolved'].includes(status)) {
    return res.status(400).json({ error: "Invalid status flag parameter state provided." });
  }

  const sql = 'UPDATE password_resets SET status = ? WHERE id = ?';
  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error("Resolve Request Error:", err);
      return res.status(500).json({ error: "Database error processing resolution status update." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Target recovery request log entry was not found." });
    }

    res.json({ message: "Account recovery status flag updated successfully." });
  });
};