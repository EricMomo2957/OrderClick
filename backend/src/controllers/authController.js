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
 * UPDATE PROFILE CONTROLLER (SECURED)
 */
export const updateProfile = async (req, res) => {
  const { fullname, email } = req.body;
  
  // SECURE: Extract id from the token verified by authMiddleware
  // Note: We use 'userId' because that is the key you used in the login jwt.sign
  const id = req.user.userId; 
  
  if (!fullname || !email) {
    return res.status(400).json({ error: "Fullname and email are required." });
  }

  const query = "UPDATE users SET fullname = ?, email = ? WHERE id = ?";
  
  db.query(query, [fullname, email, id], (err, result) => {
    if (err) {
      console.error("Update Error:", err);
      return res.status(500).json({ error: "Database error during profile update." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    // Success Response
    res.json({ 
      message: "Profile updated successfully!", 
      user: { 
        id: id, 
        fullname: fullname,
        name: fullname, // Alias for frontend dashboard compatibility
        email: email,
        role: 'customer' 
      } 
    });
  });
};