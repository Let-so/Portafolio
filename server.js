const express = require('express');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const app = express();

// Habilitar compresión Gzip para mejor rendimiento
app.use(compression());

// Headers para SEO y seguridad
app.use((req, res, next) => {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Prevenir MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Habilitar XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer policy para privacidad
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permitir indexación por buscadores
  res.setHeader('X-Robots-Tag', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  next();
});

// Servir archivos estáticos (CSS, JS, imágenes, etc)
app.use(express.static(path.join(__dirname), {
  maxAge: '1d',
  etag: false
}));

// Ruta principal - servir el HTML principal
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'Sofia Cardozo v3.dc.html');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(fs.readFileSync(filePath, 'utf-8'));
  } else {
    res.status(404).send('Not Found');
  }
});

// Redirecciones de versiones alternativas
app.get('/v2', (req, res) => {
  const filePath = path.join(__dirname, 'Sofia Cardozo v2.dc.html');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(fs.readFileSync(filePath, 'utf-8'));
  } else {
    res.status(404).send('Not Found');
  }
});

app.get('/v3', (req, res) => {
  const filePath = path.join(__dirname, 'Sofia Cardozo v3.dc.html');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(fs.readFileSync(filePath, 'utf-8'));
  } else {
    res.status(404).send('Not Found');
  }
});

// Manejo de rutas no encontradas - servir index
app.use((req, res) => {
  const filePath = path.join(__dirname, 'Sofia Cardozo v3.dc.html');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(404).send(fs.readFileSync(filePath, 'utf-8'));
  } else {
    res.status(404).send('Not Found');
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📱 Visita: http://localhost:${PORT}`);
  console.log(`📁 Directorio: ${__dirname}`);
});
