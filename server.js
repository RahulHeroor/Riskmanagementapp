import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { GoogleGenAI, Type } from "@google/genai";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; 
const DB_FILE = path.join(__dirname, 'risks.db');
const JWT_SECRET = process.env.JWT_SECRET || 'secure-enterprise-secret-key-change-me-in-prod';

// --- Configuration ---
const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Database Setup ---
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) console.error('Error opening database:', err.message);
  else console.log(`💾 Connected to SQLite database: ${DB_FILE}`);
});

db.serialize(() => {
  // Create Risks Table
  db.run(`CREATE TABLE IF NOT EXISTS risks (
    id TEXT PRIMARY KEY,
    title TEXT,
    asset TEXT,
    threat TEXT,
    vulnerability TEXT,
    likelihood INTEGER,
    impact INTEGER,
    score INTEGER,
    level TEXT,
    owner TEXT,
    status TEXT,
    treatmentPlan TEXT,
    createdAt TEXT,
    updatedAt TEXT
  )`);

  // Create Users Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    createdAt TEXT
  )`);
});

// --- Helper Promisify DB ---
const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});
const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});
const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) { err ? reject(err) : resolve(this); });
});

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access Denied: No Token Provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Access Denied: Invalid Token" });
    req.user = user;
    next();
  });
};

const authorizeRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Access Denied: Insufficient Permissions" });
  }
  next();
};

// --- Auth Routes ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ error: "Missing fields" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    
    await dbRun(
      `INSERT INTO users (id, username, password, role, createdAt) VALUES (?, ?, ?, ?, ?)`,
      [userId, username, hashedPassword, role, new Date().toISOString()]
    );

    const token = jwt.sign({ id: userId, username, role }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ user: { id: userId, username, role }, token });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: "Username already exists" });
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await dbGet("SELECT * FROM users WHERE username = ?", [username]);
    
    if (!user) return res.status(400).json({ error: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ user: { id: user.id, username: user.username, role: user.role }, token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// --- API Routes (Protected) ---

// 1. Get All Risks (All Authenticated Users)
app.get('/api/risks', authenticateToken, async (req, res) => {
  try {
    const risks = await dbAll("SELECT * FROM risks ORDER BY createdAt DESC");
    res.json(risks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create Risk (Admin, Analyst)
app.post('/api/risks', authenticateToken, authorizeRole(['Admin', 'Analyst']), async (req, res) => {
  try {
    const r = req.body;
    await dbRun(
      `INSERT INTO risks (id, title, asset, threat, vulnerability, likelihood, impact, score, level, owner, status, treatmentPlan, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.title, r.asset, r.threat, r.vulnerability, r.likelihood, r.impact, r.score, r.level, r.owner, r.status, r.treatmentPlan, r.createdAt, r.updatedAt]
    );
    res.status(201).json(r);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save risk' });
  }
});

// 3. Update Risk (Admin, Analyst)
app.put('/api/risks/:id', authenticateToken, authorizeRole(['Admin', 'Analyst']), async (req, res) => {
  try {
    const r = req.body;
    await dbRun(
      `UPDATE risks SET title=?, asset=?, threat=?, vulnerability=?, likelihood=?, impact=?, score=?, level=?, owner=?, status=?, treatmentPlan=?, updatedAt=? WHERE id=?`,
      [r.title, r.asset, r.threat, r.vulnerability, r.likelihood, r.impact, r.score, r.level, r.owner, r.status, r.treatmentPlan, new Date().toISOString(), req.params.id]
    );
    res.json(r);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update risk' });
  }
});

// 4. Delete Risk (Admin Only)
app.delete('/api/risks/:id', authenticateToken, authorizeRole(['Admin']), async (req, res) => {
  try {
    await dbRun("DELETE FROM risks WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete risk' });
  }
});

// --- AI Routes (Backend Proxy - Protected) ---

app.post('/api/ai/suggest', authenticateToken, async (req, res) => {
  if (!ai) return res.status(500).json({ error: "Server missing API Key" });
  
  const { asset, context } = req.body;
  const prompt = `Identify top 5 information security threats and 5 vulnerabilities associated with the asset: "${asset}". Context: ${context}. Return the result in JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            threats: { type: Type.ARRAY, items: { type: Type.STRING } },
            vulnerabilities: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI Generation failed" });
  }
});

app.post('/api/ai/treatment', authenticateToken, async (req, res) => {
  if (!ai) return res.status(500).json({ error: "Server missing API Key" });

  const { title, threat, vulnerability } = req.body;
  const prompt = `Propose a concise, actionable risk treatment plan (mitigation controls) for the following risk in an ISMS context:
    Risk: ${title}
    Threat: ${threat}
    Vulnerability: ${vulnerability}
    Keep it professional and focused on ISO 27001 controls. Max 3 sentences.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    res.json({ plan: response.text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI Generation failed" });
  }
});

// --- Start Server ---
app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Enterprise Backend Server running on http://${HOST}:${PORT}`);
});