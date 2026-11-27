// Esta es una "ruta": define qué hace el servidor cuando llega una petición a una URL
// específica de /api/auth/... (ej. qué pasa cuando alguien manda un POST a /login).
const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');

const router = express.Router();

// POST /api/auth/login — revisa correo y contraseña, y si están bien, guarda la sesión
router.post('/login', async (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }

  const usuario = await Usuario.findOne({ correo: correo.toLowerCase().trim() });
  if (!usuario || !usuario.activo) {
    // mismo mensaje tanto si el correo no existe como si la cuenta está desactivada,
    // para no darle pistas a quien intenta adivinar cuentas válidas
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  // compara la contraseña escrita contra el hash guardado (nunca se guarda en texto plano)
  const ok = await bcrypt.compare(password, usuario.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  // a partir de aquí el usuario queda "logueado": estos datos se guardan en su cookie de sesión
  req.session.userId = usuario._id.toString();
  req.session.rol = usuario.rol;
  req.session.nombre = usuario.nombre;

  res.json({ nombre: usuario.nombre, rol: usuario.rol });
});

// POST /api/auth/logout — borra la sesión guardada
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

module.exports = router;
