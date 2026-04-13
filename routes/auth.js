
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const USERS_FILE = path.join(__dirname, '../models/users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refreshsecret';

const crypto = require('crypto');

// Cargar usuarios desde archivo
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

// Guardar usuarios en archivo
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Generar token seguro
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Registro de usuarios
// Parte: Registro de usuarios
router.post('/register', async (req, res) => {
  const { user, email, password, secretQ, secretA, role } = req.body;
  if (!user || !email || !password || !secretQ || !secretA) return res.json({ success: false, message: 'Faltan campos' });
  let users = loadUsers();
  if (users.find(u => u.user === user || u.email === email)) {
    return res.json({ success: false, message: 'Usuario o email ya existe' });
  }
  const hash = await bcrypt.hash(password, 10);
  const secretAHash = await bcrypt.hash(secretA, 10);
  // Asignar rol, por defecto USER
  const userRole = role && ['USER','EDITOR','ADMIN','SUPERADMIN'].includes(role) ? role : 'USER';
  users.push({ user, email, password: hash, mfaEnabled: true, secretQ, secretA: secretAHash, secretAttempts: 0, role: userRole });
  saveUsers(users);
  res.json({ success: true });
});

// Gestión de datos sensibles: recuperación de contraseña
router.post('/recover', (req, res) => {
  const { email } = req.body;
  let users = loadUsers();
  const found = users.find(u => u.email === email);
  if (!found) return res.json({ success: false, message: 'Email no encontrado' });
  // Generar token temporal
  const token = generateToken();
  found.resetToken = token;
  found.resetTokenExpires = Date.now() + 15 * 60 * 1000; // 15 minutos
  saveUsers(users);
  // Simular envío de enlace
  const link = `/reset.html?token=${token}`;
  res.json({ success: true, message: 'Enlace de recuperación generado (simulado)', link });
});

// Gestión de datos sensibles: obtener pregunta secreta
router.post('/secret-question', (req, res) => {
  const { email } = req.body;
  let users = loadUsers();
  const found = users.find(u => u.email === email);
  if (!found || !found.secretQ) return res.json({ success: false, message: 'Usuario no encontrado o sin pregunta secreta' });
  // Limitar intentos si está bloqueado
  if (found.secretAttempts && found.secretAttempts >= 3) {
    return res.json({ success: false, message: 'Demasiados intentos fallidos. Intenta más tarde.' });
  }
  res.json({ success: true, question: found.secretQ });
});

// Gestión de datos sensibles: validar respuesta secreta
router.post('/validate-secret', async (req, res) => {
  const { email, answer } = req.body;
  let users = loadUsers();
  const found = users.find(u => u.email === email);
  if (!found || !found.secretA) return res.json({ success: false, message: 'Usuario no encontrado o sin respuesta secreta' });
  if (found.secretAttempts && found.secretAttempts >= 3) {
    return res.json({ success: false, message: 'Demasiados intentos fallidos. Intenta más tarde.' });
  }
  const valid = await bcrypt.compare(answer, found.secretA);
  if (!valid) {
    found.secretAttempts = (found.secretAttempts || 0) + 1;
    saveUsers(users);
    return res.json({ success: false, message: 'Respuesta incorrecta' });
  }
  found.secretAttempts = 0; // resetear intentos

  // Generar token de recuperación
  const token = generateToken();
  found.resetToken = token;
  found.resetTokenExpires = Date.now() + 15 * 60 * 1000;
  saveUsers(users);
  res.json({ success: true, token });
});

// Gestión de datos sensibles: restablecer contraseña usando token
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  let users = loadUsers();
  const found = users.find(u => u.resetToken === token && Date.now() < u.resetTokenExpires);
  if (!found) return res.json({ success: false, message: 'Token inválido o expirado' });
  found.password = await bcrypt.hash(password, 10);
  found.resetToken = null;
  found.resetTokenExpires = null;
  saveUsers(users);
  res.json({ success: true, message: 'Contraseña restablecida correctamente' });
});

// Login de usuarios
// Parte: Login
router.post('/login', async (req, res) => {
  const { user, password } = req.body;
  let users = loadUsers();
  const found = users.find(u => u.user === user || u.email === user);
  if (!found) return res.json({ success: false, message: 'Usuario no encontrado' });
  const valid = await bcrypt.compare(password, found.password);
  if (!valid) return res.json({ success: false, message: 'Contraseña incorrecta' });
  // MFA: generar código OTP simulado
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  found.otp = otp;
  found.otpExpires = Date.now() + 2 * 60 * 1000; // 2 minutos
  saveUsers(users);
  // Simular envío (mostrar en respuesta)
  res.json({ success: true, mfa: true, otp: otp, message: 'Código OTP enviado (simulado)' });
});

// Gestión de datos sensibles: verificación OTP y emisión de JWT
router.post('/verify-otp', (req, res) => {
  const { user, otp } = req.body;
  let users = loadUsers();
  const found = users.find(u => (u.user === user || u.email === user) && u.otp === otp && Date.now() < u.otpExpires);
  if (!found) return res.json({ success: false, message: 'OTP inválido o expirado' });
  // Limpiar OTP
  found.otp = null;
  found.otpExpires = null;
  saveUsers(users);
  // JWT corto y refresh, incluir el rol real del usuario
  const token = jwt.sign({ id: found.user, role: found.role }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: found.user, role: found.role }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, refreshToken });
});

// Gestión de datos sensibles: refresh token
router.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.json({ success: false });
  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const token = jwt.sign({ id: payload.id, role: payload.role }, JWT_SECRET, { expiresIn: '15m' });
    res.json({ success: true, token });
  } catch {
    res.json({ success: false });
  }
});

// Gestión de datos sensibles: middleware de validación JWT
function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
}

// Middleware de protección por roles (RBAC)
// Uso: requireRole('ADMIN'), requireRole(['ADMIN','SUPERADMIN'])
function requireRole(roles) {
  return function(req, res, next) {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'No autorizado: sin rol' });
    }
    if (Array.isArray(roles)) {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'No autorizado: requiere rol ' + roles.join(', ') });
      }
    } else {
      if (req.user.role !== roles) {
        return res.status(403).json({ message: 'No autorizado: requiere rol ' + roles });
      }
    }
    next();
  };
}

// Dashboard del usuario (ruta protegida)
// Parte: Dashboard
router.get('/protected', authMiddleware, requireRole(['USER','EDITOR','ADMIN','SUPERADMIN']), (req, res) => {
  res.json({ message: 'Acceso permitido', user: req.user });
});

// Panel de administración (solo para ADMIN y SUPERADMIN)
// Parte: Panel de administración
router.get('/admin', authMiddleware, requireRole(['ADMIN','SUPERADMIN']), (req, res) => {
  res.json({ message: 'Bienvenido al panel de administración', user: req.user });
});

// Ruta solo para SUPERADMIN
router.get('/superadmin', authMiddleware, requireRole('SUPERADMIN'), (req, res) => {
  res.json({ message: 'Acceso solo para SUPERADMIN', user: req.user });
});

// Ruta solo para EDITOR y superiores
router.get('/editor', authMiddleware, requireRole(['EDITOR','ADMIN','SUPERADMIN']), (req, res) => {
  res.json({ message: 'Acceso para EDITOR, ADMIN o SUPERADMIN', user: req.user });
});
module.exports = router;
