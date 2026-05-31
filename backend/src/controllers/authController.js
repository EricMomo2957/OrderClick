// backend/src/controllers/authController.js
import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { logAction } from '../utils/logger.js';

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
    const TargetRole = role || 'customer';
    
    db.query(sql, [fullname, email, hashedPassword, TargetRole], async (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: "Registration failed. Email already exists." });
        }
        return res.status(500).json({ error: "Database error during registration." });
      }

      // ─── 🚀 AUDIT TRACKING TRIGGER: USER REGISTRATION ───────────────────
      try {
        await logAction({
          userId: result.insertId,
          fullname: fullname,
          role: TargetRole,
          action: 'USER_REGISTERED',
          resource: 'users',
          resourceId: result.insertId,
          details: `New account entity registration established for ${fullname} (${email}) initialized with role: [${TargetRole}].`,
          req: req
        });
      } catch (logErr) {
        console.error("Non-blocking audit capture error during registration:", logErr);
      }
      // ────────────────────────────────────────────────────────────────────

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

      const token = jwt.sign(
        { 
          id: user.id,          
          email: user.email, 
          role: user.role,
          fullname: user.fullname // Ensured fullname payload is present for downstream middleware matching
        },
        process.env.JWT_SECRET || 'secret_key_orderclick',
        { expiresIn: '1d' }
      );

      // ─── 🚀 AUDIT TRACKING TRIGGER: INDEPENDENT USER SIGN-IN ─────────────
      // Since req.user is not yet mounted on public login endpoints, we pass a custom override identity frame
      try {
        await logAction({
          userId: user.id,
          fullname: user.fullname,
          role: user.role,
          action: user.role === 'admin' ? 'ADMIN_LOGIN' : 'CUSTOMER_LOGIN',
          resource: 'users',
          resourceId: user.id,
          details: `User identity verified. Session signature token successfully generated for '${user.fullname}'.`,
          req: req
        });
      } catch (logErr) {
        console.error("Non-blocking audit capture error during authentication:", logErr);
      }
      // ────────────────────────────────────────────────────────────────────

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
 * 2. ADMINISTRATIVE PASSWORD RECOVERY CONTROLLERS
 * ============================================================================
 */

/**
 * CUSTOMER SUBMIT REQUEST
 * POST /api/admin/forgot-password
 */
export const requestPasswordReset = (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email parameter is required." });
  }

  db.query('SELECT id, fullname, role FROM users WHERE email = ?', [email], (err, users) => {
    if (err) return res.status(500).json({ error: "Database lookup failure." });
    if (users.length === 0) {
      return res.status(404).json({ error: "No account linked to this email address." });
    }

    const targetedUser = users[0];
    const insertSql = 'INSERT INTO password_resets (user_id, email, status) VALUES (?, ?, "pending")';
    
    db.query(insertSql, [targetedUser.id, email], async (insertErr, result) => {
      if (insertErr) return res.status(500).json({ error: "Failed to store recovery record." });
      
      // ─── 🚀 AUDIT TRACKING TRIGGER: PASSWORD RESET SUBMISSION ────────────
      try {
        await logAction({
          userId: targetedUser.id,
          fullname: targetedUser.fullname,
          role: targetedUser.role,
          action: 'PASSWORD_RESET_REQUESTED',
          resource: 'password_resets',
          resourceId: result.insertId,
          details: `An account recovery ticket has been logged for ${targetedUser.fullname} (${email}). Status set to pending admin resolution.`,
          req: req
        });
      } catch (logErr) {
        console.error("Non-blocking audit error:", logErr);
      }
      // ────────────────────────────────────────────────────────────────────

      res.status(200).json({ message: "Password reset request submitted successfully." });
    });
  });
};

/**
 * GET ALL PASSWORD RESET REQUESTS
 * GET /api/admin/forgot-password-requests
 */
export const getPasswordResetRequests = (req, res) => {
  const sql = `
    SELECT pr.id, pr.user_id, pr.email, pr.status, pr.created_at, pr.updated_at, u.fullname 
    FROM password_resets pr
    JOIN users u ON pr.user_id = u.id
    ORDER BY pr.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Failed to fetch password reset records." });
    }
    res.status(200).json(results);
  });
};

/**
 * UPDATE A REQUEST TO RESOLVED
 * PUT /api/admin/forgot-password-requests/:id
 */
export const resolvePasswordResetRequest = (req, res) => {
  const { id } = req.params;
  const status = req.body.status || 'resolved';

  const sql = 'UPDATE password_resets SET status = ?, updated_at = NOW() WHERE id = ?';

  db.query(sql, [status, id], async (err, result) => {
    if (err) {
      console.error("Error updating record:", err);
      return res.status(500).json({ error: "Failed to complete resolution transaction." });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Password request log entry not found." });
    }

    // ─── 🚀 TRIGGER AUDIT ACTION: PASSWORD RESOLUTION MATRIX ──────────────
    await logAction({
        userId: req.user?.id,        
        fullname: req.user?.fullname,
        role: 'admin',
        action: 'RESOLVED_PASSWORD_REQUEST',
        resource: 'password_resets', 
        resourceId: id,
        details: `Resolved account recovery ticket for request ID #${id}`,
        req: req                    
    });
    // ──────────────────────────────────────────────────────────────────────

    res.status(200).json({ message: "Request status updated successfully." });
  });
};