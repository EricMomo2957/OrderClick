import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * REGISTER CONTROLLER
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
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'secret_key_orderclick',
        { expiresIn: '1d' }
      );

      // FIXED: Added 'id' and changed 'fullname' to match what the frontend expects
      res.json({ 
        message: "Login successful",
        token, 
        user: { 
          id: user.id, // CRITICAL: This was missing
          name: user.fullname, // Matches 'getUserData().name' in your dashboard
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
 * UPDATE PROFILE CONTROLLER
 */
export const updateProfile = async (req, res) => {
  const { id, fullname, email } = req.body;

  try {
    // 1. Basic Validation
    if (!id || !fullname || !email) {
      return res.status(400).json({ error: "ID, Full Name, and Email are required." });
    }

    // 2. Update Query matching your 'users' table structure
    const sql = 'UPDATE users SET fullname = ?, email = ? WHERE id = ?';
    
    db.query(sql, [fullname, email, id], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: "Email is already taken by another user." });
        }
        return res.status(500).json({ error: "Database error during profile update." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found." });
      }

      // 3. Optional: Generate a new token if your frontend relies on token payload for display
      // If you don't need a new token, just send the success message.
      const newToken = jwt.sign(
        { userId: id, fullname: fullname }, // You can add updated info here
        process.env.JWT_SECRET || 'secret_key_orderclick',
        { expiresIn: '1d' }
      );

      res.status(200).json({ 
        message: "Profile updated successfully!",
        token: newToken,
        user: { id, name: fullname, email } // Sending back updated 'name' for frontend
      });
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ error: "Internal server error during update." });
  }
};