// Esto es "middleware": funciones que se ejecutan ANTES de que una ruta haga su trabajo,
// como un guardia de pasillo. Las rutas protegidas las usan con router.use(requireAuth, ...).

// corta la petición con 401 si nadie inició sesión (no hay userId guardado en la cookie)
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Debes iniciar sesión.' });
  }
  next(); // todo bien, sigue a la siguiente función/ruta
}

// corta la petición con 403 si el que inició sesión no es administrador
function requireAdmin(req, res, next) {
  if (req.session.rol !== 'administrador') {
    return res.status(403).json({ error: 'No tienes permisos para esto.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
