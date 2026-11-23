const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }

  const usuario = await Usuario.findOne({ correo: correo.toLowerCase().trim() });
  if (!usuario || !usuario.activo) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  const ok = await bcrypt.compare(password, usuario.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  req.session.userId = usuario._id.toString();
  req.session.rol = usuario.rol;
  req.session.nombre = usuario.nombre;

  res.json({ nombre: usuario.nombre, rol: usuario.rol });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

module.exports = router;
