function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Debes iniciar sesión.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (req.session.rol !== 'administrador') {
    return res.status(403).json({ error: 'No tienes permisos para esto.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
