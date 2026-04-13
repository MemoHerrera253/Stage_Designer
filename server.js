const express = require('express');
const path = require('path');
// Administración de recursos (equipos)
const equiposRoutes = require('./routes/equipos');

// Registro, login, dashboard, panel admin, gestión de datos sensibles
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para procesar JSON
app.use(express.json());

// Administración de recursos (equipos)
app.use('/api/equipos', equiposRoutes);

// Registro, login, dashboard, panel admin, gestión de datos sensibles
app.use('/api', authRoutes);

// Servir archivos HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/views/:page', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', req.params.page));
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
