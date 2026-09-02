/* ============================================================
   INSTRUCTIFY KENYA — Local Development & API Server
   Serves static assets and mounts all serverless API endpoints.
   ============================================================ */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Load Environment Variables ───────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

loadEnvFile(path.join(__dirname, '.env.local'));
loadEnvFile(path.join(__dirname, '.env'));
loadEnvFile(path.join(__dirname, '.env.example'));

// ── Dynamic API Handlers Map ─────────────────────────────────
const apiHandlers = {
  '/api/create-order': () => import('./api/create-order.js'),
  '/api/initiate-payment': () => import('./api/initiate-payment.js'),
  '/api/verify-payment': () => import('./api/verify-payment.js'),
  '/api/webhook/mpesa': () => import('./api/webhook/mpesa.js'),
  '/api/webhook/paystack': () => import('./api/webhook/paystack.js'),
  '/api/wishlist': () => import('./api/wishlist.js'),
  '/api/contact': () => import('./api/contact.js'),
};

const PORT = process.env.PORT || 8080;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// ── Helper to augment Node res object ────────────────────────
function augmentResponse(res) {
  res.status = function (code) {
    res.statusCode = code;
    return res;
  };
  res.json = function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };
}

const server = http.createServer(async (req, res) => {
  augmentResponse(res);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const [rawPath] = req.url.split('?');

  // ── Handle API Routes ──────────────────────────────────────
  const normalizedApiPath = rawPath.replace(/\/$/, '');
  if (apiHandlers[normalizedApiPath]) {
    try {
      const module = await apiHandlers[normalizedApiPath]();
      const handler = module.default;

      // Parse JSON body if present
      let bodyData = '';
      req.on('data', (chunk) => { bodyData += chunk; });
      req.on('end', async () => {
        try {
          req.body = bodyData ? JSON.parse(bodyData) : {};
        } catch {
          req.body = bodyData;
        }

        try {
          await handler(req, res);
        } catch (err) {
          console.error(`[API Error] ${rawPath}:`, err);
          if (!res.writableEnded) {
            res.status(500).json({ error: 'Internal server error', message: err.message });
          }
        }
      });
      return;
    } catch (err) {
      console.error(`[Module Load Error] ${rawPath}:`, err);
      res.status(500).json({ error: 'Failed to load API endpoint' });
      return;
    }
  }

  // ── Handle Static File Serving ─────────────────────────────
  let reqUrl = rawPath;
  if (reqUrl === '/') reqUrl = '/index.html';

  const safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Instructify Kenya Server running on http://localhost:${PORT}`);
});
