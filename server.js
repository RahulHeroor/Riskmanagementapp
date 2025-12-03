import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; 
const DB_FILE = path.join(__dirname, 'risks.db');

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
});

// --- Helper Promisify DB ---
const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});
const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) { err ? reject(err) : resolve(this); });
});

// --- API Routes ---

// 1. Get All Risks
app.get('/api/risks', async (req, res) => {
  try {
    const risks = await dbAll("SELECT * FROM risks ORDER BY createdAt DESC");
    res.json(risks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create Risk
app.post('/api/risks', async (req, res) => {
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

// 3. Update Risk
app.put('/api/risks/:id', async (req, res) => {
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

// 4. Delete Risk
app.delete('/api/risks/:id', async (req, res) => {
  try {
    await dbRun("DELETE FROM risks WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete risk' });
  }
});

// --- AI Routes (Backend Proxy) ---

app.post('/api/ai/suggest', async (req, res) => {
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

app.post('/api/ai/treatment', async (req, res) => {
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