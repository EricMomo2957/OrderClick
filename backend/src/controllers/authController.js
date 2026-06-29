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
    // Extracted the new fields: location, contact_number, gender, customer_id
    const { fullname, email, password, role, location, contact_number, gender, customer_id } = req.body; 
    
    try {
        // Base authentication validations
        if (!fullname || !email || !password) {
            return res.status(400).json({ error: "All fields (Full Name, Email, Password) are required." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Expanded SQL statement including the newly engineered columns
        const sql = `
            INSERT INTO users (fullname, email, password, role, location, contact_number, gender, customer_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const TargetRole = role || 'customer';
        
        // Safe binding array passing parameters sequentially
        const [result] = await db.execute(sql, [
            fullname, 
            email, 
            hashedPassword, 
            TargetRole,
            location || null,       // Fallback safely to null if empty
            contact_number || null, // Fallback safely to null if empty
            gender || null,         // Fallback safely to null if empty
            customer_id || null     // Fallback safely to null if empty
        ]);

        // ─── 🚀 AUDIT TRACKING TRIGGER: USER REGISTRATION ───────────────────
        try {
            await logAction({
                userId: result.insertId,
                fullname: fullname,
                role: TargetRole,
                action: 'USER_REGISTERED',
                resource: 'users',
                resourceId: result.insertId,
                details: `New account entity registration established for ${fullname} (${email}) initialized with role: [${TargetRole}]. Customer Profile Metadata bound successfully.`,
                req: req
            });
        } catch (logErr) {
            console.error("Non-blocking audit capture error during registration:", logErr);
        }
        // ────────────────────────────────────────────────────────────────────

        return res.status(201).json({ message: "User registered successfully!" });

    } catch (error) {
        // Handle unique constraint breaks for both Email and Customer ID fields
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.sqlMessage && error.sqlMessage.includes('customer_id')) {
                return res.status(400).json({ error: "Registration failed. Customer ID already exists." });
            }
            return res.status(400).json({ error: "Registration failed. Email already exists." });
        }
        console.error("Register Error:", error);
        return res.status(500).json({ error: "Internal server error during registration." });
    }
};

/**
 * LOGIN CONTROLLER
 * POST /api/auth/login
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Await the query directly using the native promise client pool
        // MODIFIED: Explicitly pulling down the registration metrics context + account status flags
        const [users] = await db.execute('SELECT *, is_disabled FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = users[0];

        // ─── 🛑 CHECK: PREVENT DISABLED USERS FROM INTERACTING ────────────────
        if (user.is_disabled === 1) {
            return res.status(403).json({ error: "Your account has been disabled. Please contact support." });
        }
        // ────────────────────────────────────────────────────────────────────

        // 2. Verify password safety hash match
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // 3. Sign authentication session authorization token structure
        const token = jwt.sign(
            { 
                id: user.id,          
                email: user.email, 
                role: user.role,
                fullname: user.fullname 
            },
            process.env.JWT_SECRET || 'secret_key_orderclick',
            { expiresIn: '1d' }
        );

        // 4. ─── 🚀 AUDIT TRACKING TRIGGER: INDEPENDENT USER SIGN-IN ─────────────
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

        // ... top of login controller remains unchanged ...

        return res.json({ 
            message: "Login successful",
            token, 
            user: { 
                id: user.id,
                fullname: user.fullname, 
                email: user.email,
                role: user.role,
                contact_number: user.contact_number,
                gender: user.gender,
                location: user.location,
                customer_id: user.customer_id
            } 
        });

    } catch (error) {
        console.error("🔥 Login Controller Crash Exception:", error);
        return res.status(500).json({ error: "Internal server error" });
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
export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email parameter is required." });
    }

    try {
        const [users] = await db.execute('SELECT id, fullname, role FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: "No account linked to this email address." });
        }

        const targetedUser = users[0];
        const insertSql = 'INSERT INTO password_resets (user_id, email, status) VALUES (?, ?, "pending")';
        
        const [result] = await db.execute(insertSql, [targetedUser.id, email]);
        
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

        return res.status(200).json({ message: "Password reset request submitted successfully." });

    } catch (error) {
        console.error("Password reset request database error:", error);
        return res.status(500).json({ error: "Internal server error during recovery log." });
    }
};

/**
 * GET ALL PASSWORD RESET REQUESTS
 * GET /api/admin/forgot-password-requests
 */
export const getPasswordResetRequests = async (req, res) => {
    const sql = `
        SELECT pr.id, pr.user_id, pr.email, pr.status, pr.created_at, pr.updated_at, u.fullname 
        FROM password_resets pr
        JOIN users u ON pr.user_id = u.id
        ORDER BY pr.created_at DESC
    `;

    try {
        const [results] = await db.execute(sql);
        return res.status(200).json(results);
    } catch (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({ error: "Failed to fetch password reset records." });
    }
};

/**
 * UPDATE A REQUEST TO RESOLVED
 * PUT /api/admin/forgot-password-requests/:id
 */
export const resolvePasswordResetRequest = async (req, res) => {
    const { id } = req.params;
    const status = req.body.status || 'resolved';

    const sql = 'UPDATE password_resets SET status = ?, updated_at = NOW() WHERE id = ?';

    try {
        const [result] = await db.execute(sql, [status, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Password request log entry not found." });
        }

        // ─── 🚀 TRIGGER AUDIT ACTION: PASSWORD RESOLUTION MATRIX ──────────────
        try {
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
        } catch (logErr) {
            console.error("Non-blocking audit logger capture failure on resolve request:", logErr);
        }
        // ──────────────────────────────────────────────────────────────────────

        return res.status(200).json({ message: "Request status updated successfully." });

    } catch (error) {
        console.error("Error updating record:", error);
        return res.status(500).json({ error: "Failed to complete resolution transaction." });
    }
};

/**
 * ============================================================================
 * 3. PUBLIC/METRIC SUMMARY CONTROLLERS
 * ============================================================================
 */

/**
 * GET USER METRICS FOR LANDING PAGE
 * GET /api/auth/metrics
 */
export const getUserMetrics = async (req, res) => {
    try {
        // Query 1: Count all registered customers/students
        const studentSql = "SELECT COUNT(*) AS totalStudents FROM users WHERE role = 'customer'";
        const [studentResult] = await db.execute(studentSql);
        
        // Query 2: Count approved members
        const memberSql = "SELECT COUNT(*) AS totalMembers FROM users WHERE role = 'member' OR role = 'admin'"; 
        const [memberResult] = await db.execute(memberSql);

        return res.status(200).json({
            registeredStudents: studentResult[0].totalStudents,
            approvedMembers: memberResult[0].totalMembers
        });

    } catch (error) {
        console.error("🔥 Error fetching user metrics:", error);
        return res.status(500).json({ error: "Failed to fetch user metrics." });
    }
};

/**
 * GET CURRENT LOGGED IN USER PROFILE
 * GET /api/auth/profile
 * Requires authMiddleware / verifyToken on the route
 */
export const getProfile = async (req, res) => {
    try {
        // req.user.id is injected here by your verification middleware token decode step
        const [users] = await db.execute(
            'SELECT id, fullname, email, role, location, contact_number, gender, customer_id, is_disabled FROM users WHERE id = ?', 
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: "User profile entity not found." });
        }

        const user = users[0];

        if (user.is_disabled === 1) {
            return res.status(403).json({ error: "Account has been disabled." });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error("🔥 Profile Fetch Exception:", error);
        return res.status(500).json({ error: "Internal server error fetching customer context." });
    }
};