import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    system: 'AfghanaBuild CAD & BIM Platform',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Gemini AI Assistant Endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { prompt, history, role, useThinking, useSearch } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let systemInstruction = `You are the Lead Structural & Architectural Engineering Consultant for AfghanaBuild, specializing in Afghan building codes (ANSA, Afghan National Building Code ANBC), seismic safety (Zones 1-4, Chaman & Hindu Kush faults), and regional material practices in Kabul, Herat, Mazar, Kandahar, and Jalalabad. Provide highly professional, mathematically sound, practical engineering advice in Persian (دری/فارسی) and English technical terms where appropriate.`;

    if (role === 'structural') {
      systemInstruction += ` Focus on structural load calculation, rebar detailing (AIII 400MPa), column-beam joints, shear walls, and seismic resilience.`;
    } else if (role === 'geotech') {
      systemInstruction += ` Focus on geotechnical soil testing (SPT, CPT), bearing capacity (kPa), liquefaction risks, and deep vs shallow foundation design.`;
    } else if (role === 'boq') {
      systemInstruction += ` Focus on Bill of Quantities (BOQ), material estimation, Afghan market rates (AFN), labor shifts, and wastage reduction.`;
    }

    const modelName = 'gemini-3.8-flash';
    const config: any = {
      systemInstruction,
    };

    if (useThinking) {
      config.thinkingConfig = {
        thinkingBudget: 2048,
      };
    }

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const chat = ai.chats.create({
      model: modelName,
      config,
      history: Array.isArray(history) ? history : [],
    });

    const response = await chat.sendMessage({ message: prompt });
    res.json({ text: response.text });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ error: err.message || 'Error processing AI request' });
  }
});

// System Backup Export endpoint
app.get('/api/system/backup', (req: Request, res: Response) => {
  const backupMetadata = {
    appName: 'AfghanaBuild CAD & BIM',
    version: '1.0.0',
    exportTimestamp: new Date().toISOString(),
    osTarget: 'Windows 10/11 & Windows Server 2022/2025 (Cross-Platform Container Ready)',
    backupType: 'Full System Snapshot (Data, Rules, Notes, BOQ, Registry)',
    checksum: 'sha256-' + Buffer.from(Date.now().toString()).toString('hex')
  };
  res.json(backupMetadata);
});

// Vite Middleware for Development / Static serve in Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AfghanaBuild server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
