// se usan antes de las rutas que necesitan protección, como filtros de paso.

// corta la petición con 401 si nadie inició sesión (no hay userId guardado en la cookie)
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Debes iniciar sesión.' });
  }
  next(); // todo bien, sigue a la siguiente función/ruta
}

// corta la petición con 403 si el que inició sesión no es administrador (RF11)
function requireAdmin(req, res, next) {
  if (req.session.rol !== 'administrador') {
    return res.status(403).json({ error: 'No tienes permisos para esto.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
