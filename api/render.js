const fs = require('fs');
const path = require('path');

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.map': 'application/json; charset=utf-8'
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

function safeResolve(filePath) {
  const root = process.cwd();
  const resolved = path.resolve(root, filePath);

  if (!resolved.startsWith(root)) {
    return null;
  }

  return resolved;
}

module.exports = (req, res) => {
  const { pathname } = new URL(req.url, 'https://localhost');
  const decodedPath = decodeURIComponent(pathname);

  let requestedPath = decodedPath;

  if (requestedPath === '/' || requestedPath === '/v2' || requestedPath === '/v3') {
    const filename = requestedPath === '/v2'
      ? 'Sofia Cardozo v2.dc.html'
      : requestedPath === '/v3'
        ? 'Sofia Cardozo v3.dc.html'
        : 'Sofia Cardozo v3.dc.html';

    const filePath = safeResolve(filename);
    if (!filePath) {
      res.status(403).send('Forbidden');
      return;
    }

    try {
      const html = fs.readFileSync(filePath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(html);
      return;
    } catch (error) {
      res.status(500).send('Error loading page');
      return;
    }
  }

  const normalized = decodedPath.replace(/^\/+/, '');
  const filePath = safeResolve(normalized || 'Sofia Cardozo v3.dc.html');

  if (!filePath) {
    res.status(403).send('Forbidden');
    return;
  }

  try {
    if (!fs.existsSync(filePath)) {
      const fallbackPath = safeResolve('Sofia Cardozo v3.dc.html');
      const html = fs.readFileSync(fallbackPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(404).send(html);
      return;
    }

    const content = fs.readFileSync(filePath);
    const mimeType = getMimeType(filePath);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.status(200).send(content);
  } catch (error) {
    const fallbackPath = safeResolve('Sofia Cardozo v3.dc.html');
    if (fallbackPath && fs.existsSync(fallbackPath)) {
      const html = fs.readFileSync(fallbackPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(404).send(html);
      return;
    }

    res.status(500).send('Server error');
  }
};
