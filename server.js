import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // Bind to all interfaces
const DATA_FILE = path.join(__dirname, 'risks.json');

// Enable CORS for all origins so LAN access works
app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Initialize data file if it doesn't exist
const initData = async () => {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
  }
};

const readData = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return [];
  }
};

const writeData = async (data) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
};

// API Routes
app.get('/api/risks', async (req, res) => {
  try {
    const risks = await readData();
    res.json(risks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch risks' });
  }
});

app.post('/api/risks', async (req, res) => {
  try {
    console.log('Received POST /api/risks with body:', req.body);
    const risks = await readData();
    const newRisk = req.body;
    risks.unshift(newRisk);
    await writeData(risks);
    res.status(201).json(newRisk);
  } catch (err) {
    console.error('Error saving risk:', err);
    res.status(500).json({ error: 'Failed to save risk' });
  }
});

app.put('/api/risks/:id', async (req, res) => {
  try {
    const risks = await readData();
    const index = risks.findIndex(r => r.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    risks[index] = { ...risks[index], ...req.body };
    await writeData(risks);
    res.json(risks[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update risk' });
  }
});

app.delete('/api/risks/:id', async (req, res) => {
  try {
    const risks = await readData();
    const filteredRisks = risks.filter(r => r.id !== req.params.id);
    await writeData(filteredRisks);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete risk' });
  }
});

// Start Server
initData().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`\n🚀 Backend Server running on http://${HOST}:${PORT}`);
    console.log(`📂 Data stored in ${DATA_FILE}\n`);
  });
});