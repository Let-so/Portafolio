const express = require('express');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const app = express();

// Habilitar compresión Gzip
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

// Archivos estáticos
app.use(express.static(path.join(__dirname), {
  maxAge: '1d'
}));

// Ruta principal - Sofía Cardozo v3
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'Sofia Cardozo v3.dc.html');
  try {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    res.status(500).send('Error loading page: ' + e.message);
  }
});

// Otras versiones
app.get('/v2', (req, res) => {
  const htmlPath = path.join(__dirname, 'Sofia Cardozo v2.dc.html');
  try {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    res.status(500).send('Error loading page: ' + e.message);
  }
});

// 404 fallback
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
  console.log(`✅ Server online on port ${PORT}`);
});
