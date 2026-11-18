import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde .env si existe
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = line.slice(0, eqIndex).trim();
    const val = line.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) {
      process.env[key] = val;
    }
  }
}

const PORT = Number(process.env.PORT) || 3006;

const PUBLIC_ENV = {
  NEXT_PUBLIC_DESKTOP_URL:
    process.env.NEXT_PUBLIC_DESKTOP_URL || 'https://geotransformer-monolith-fniu.onrender.com',
  NEXT_PUBLIC_ADMIN_URL:
    process.env.NEXT_PUBLIC_ADMIN_URL || 'https://geotransformer-admin-panel.onrender.com',
  NEXT_PUBLIC_APK_DOWNLOAD_URL:
    process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL ||
    'https://github.com/akey01/GeoGis_Android/releases/latest/download/GeoGis6_Android.apk',
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.dxf': 'application/dxf',
  '.apk': 'application/vnd.android.package-archive',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.wav': 'audio/wav',
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

  if (urlPath === '/env-config.js') {
    const body = `window.__GEOGIS_ENV__ = ${JSON.stringify(PUBLIC_ENV)};\n`;
    res.writeHead(200, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(body);
    return;
  }

  const relativePath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const targetPath = path.resolve(__dirname, relativePath);

  if (!targetPath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  let fileToServe = targetPath;
  if (fs.existsSync(fileToServe) && fs.statSync(fileToServe).isDirectory()) {
    fileToServe = path.join(fileToServe, 'index.html');
  }

  if (!fs.existsSync(fileToServe) || !fs.statSync(fileToServe).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(fileToServe).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const stat = fs.statSync(fileToServe);
  const total = stat.size;
  const range = req.headers.range;

  if (range) {
    const match = /^bytes=(\d+)-(\d*)$/.exec(range);
    if (!match) {
      res.writeHead(416, { 'Content-Range': `bytes */${total}` });
      res.end();
      return;
    }
    const start = Number(match[1]);
    const end = match[2] ? Math.min(Number(match[2]), total - 1) : total - 1;
    if (start >= total || start > end) {
      res.writeHead(416, { 'Content-Range': `bytes */${total}` });
      res.end();
      return;
    }
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(fileToServe, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, {
    'Accept-Ranges': 'bytes',
    'Content-Length': total,
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
  });
  fs.createReadStream(fileToServe).pipe(res);
});

server.listen(PORT, () => {
  console.log(`GeoGIS6 Web Server running at http://localhost:${PORT}`);
});
