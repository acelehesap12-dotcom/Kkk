// 👑 UNIFIED EXCHANGE - USER SERVICE & k99 LEDGER
// Purpose: Membership Management, Auth, and Virtual Currency (k99) Balances

const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection (Supabase/Postgres)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const SECRET_KEY = process.env.JWT_SECRET || "super_secret_k99_key";
const ADMIN_EMAIL = "berkecansuskun1998@gmail.com";

// --- MIDDLEWARE ---

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    next();
};

// --- ROUTES ---

// 1. Registration (Public)
app.post('/auth/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        // Create User
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, role, k99_balance) VALUES ($1, $2, $3, $4) RETURNING id, email',
            [email, hashedPassword, email === ADMIN_EMAIL ? 'admin' : 'user', 1000.00] // Sign-up bonus: 1000 k99
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 2. Login (Public)
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(400).json({ error: "User not found" });

        const user = result.rows[0];
        if (await bcrypt.compare(password, user.password_hash)) {
            const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY);
            res.json({ token, role: user.role });
        } else {
            res.status(403).json({ error: "Invalid password" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. User Profile & Balance (Protected)
app.get('/user/profile', authenticateToken, async (req, res) => {
    const result = await pool.query('SELECT id, email, k99_balance, is_frozen FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
});

// 4. ADMIN PANEL: List All Users
app.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    const result = await pool.query('SELECT id, email, k99_balance, is_frozen, created_at FROM users');
    res.json(result.rows);
});

// 5. ADMIN PANEL: Freeze/Unfreeze User
app.post('/admin/users/:id/freeze', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { freeze } = req.body; // true or false
    await pool.query('UPDATE users SET is_frozen = $1 WHERE id = $2', [freeze, id]);
    res.json({ message: `User ${id} frozen status: ${freeze}` });
});

// 6. ADMIN PANEL: Mint k99 (Central Bank)
app.post('/admin/mint', authenticateToken, requireAdmin, async (req, res) => {
    const { userId, amount } = req.body;
    await pool.query('UPDATE users SET k99_balance = k99_balance + $1 WHERE id = $2', [amount, userId]);
    res.json({ message: `Minted ${amount} k99 to user ${userId}` });
});

// --- INIT DB ---
const initDB = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            k99_balance DECIMAL(20, 8) DEFAULT 0,
            is_frozen BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW()
        );
    `);
    console.log(">>> User DB Initialized");
};

app.listen(3000, async () => {
    console.log("👑 USER SERVICE STARTED on :3000");
    await initDB();
});
