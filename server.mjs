// Universal Vercel & Node.js Entrypoint
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function getFileContent(relativePath) {
  const cleanPath = relativePath.split('?')[0].replace(/^\/+/, '');
  const searchCandidates = [
    path.join(process.cwd(), cleanPath),
    path.join(process.cwd(), 'dist', cleanPath),
    path.join(process.cwd(), 'public', cleanPath),
    path.join(__dirname, cleanPath),
    path.join(__dirname, 'dist', cleanPath)
  ];

  for (const candidate of searchCandidates) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        const ext = path.extname(candidate).toLowerCase();
        return {
          content: fs.readFileSync(candidate),
          mime: MIME_TYPES[ext] || 'application/octet-stream'
        };
      }
    } catch (e) {}
  }
  return null;
}

function getIndexHtml() {
  const searchCandidates = [
    path.join(process.cwd(), 'index.html'),
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(process.cwd(), 'public', 'index.html'),
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'dist', 'index.html')
  ];

  for (const candidate of searchCandidates) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return fs.readFileSync(candidate);
      }
    } catch (e) {}
  }
  return null;
}

// 1. Vercel Serverless Function Entrypoint
export default function handler(req, res) {
  const urlPath = req.url.split('?')[0];

  // Try to serve specific static asset if not root
  if (urlPath !== '/' && urlPath !== '/index.html' && path.extname(urlPath)) {
    const file = getFileContent(urlPath);
    if (file) {
      res.statusCode = 200;
      res.setHeader('Content-Type', file.mime);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.end(file.content);
    }
  }

  // Fallback to index.html for all page routes
  const indexContent = getIndexHtml();
  if (indexContent) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    return res.end(indexContent);
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.end('404: Application Not Found');
}

// 2. Standalone HTTP Server for Local Testing
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  const server = http.createServer((req, res) => handler(req, res));
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Election Ops Server running on http://localhost:${PORT}`);
  });
}
