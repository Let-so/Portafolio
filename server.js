const express = require('express');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const app = express();

// Habilitar compresión
app.use(compression());

// Headers de seguridad
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Robots-Tag', 'index, follow');
  next();
});

// Tipos MIME personalizados
app.use((req, res, next) => {
  if (req.path.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
  } else if (req.path.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  }
  next();
});

// Archivos estáticos con tipos MIME correctos
app.use(express.static(path.join(__dirname), {
  maxAge: '1d',
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filepath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filepath.endsWith('.woff2')) {
      res.setHeader('Content-Type', 'font/woff2');
    } else if (filepath.endsWith('.woff')) {
      res.setHeader('Content-Type', 'font/woff');
    } else if (filepath.endsWith('.ttf')) {
      res.setHeader('Content-Type', 'font/ttf');
    } else if (filepath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filepath.endsWith('.jpg') || filepath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filepath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  }
}));

// Ruta principal
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'Sofia Cardozo v3.dc.html');
  try {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

app.get('/v2', (req, res) => {
  const htmlPath = path.join(__dirname, 'Sofia Cardozo v2.dc.html');
  try {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

// 404
app.use((req, res) => {
  const htmlPath = path.join(__dirname, 'Sofia Cardozo v3.dc.html');
  try {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    res.status(404).send('Page not found');
  }
});

// Iniciar
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
