const express = require('express');
const compression = require('compression');
const path = require('path');
const app = express();

// Habilitar compresión Gzip para mejor rendimiento
app.use(compression());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname), {
  maxAge: '1d',
  etag: false
}));

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
  next();
});

// Ruta principal - servir el HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Sofia Cardozo.dc.html'));
});

// Redirecciones de versiones alternativas
app.get('/v2', (req, res) => {
  res.sendFile(path.join(__dirname, 'Sofia Cardozo v2.dc.html'));
});

app.get('/v3', (req, res) => {
  res.sendFile(path.join(__dirname, 'Sofia Cardozo v3.dc.html'));
});

// Manejo de rutas no encontradas - servir index
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'Sofia Cardozo.dc.html'));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📱 Visita: http://localhost:${PORT}`);
});
