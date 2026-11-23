// Punto de entrada del servidor: arma la app de Express y la deja escuchando.
require('dotenv').config(); // carga las variables del archivo .env (claves, URLs, etc.)
const path = require('path');
const express = require('express');
const session = require('express-session');
const conectarDB = require('./src/db');

// cada archivo de rutas agrupa los endpoints de una parte del sistema
const authRoutes = require('./src/routes/auth'); // login / logout
const marcacionesRoutes = require('./src/routes/marcaciones'); // marcar entrada/salida, historial
const adminRoutes = require('./src/routes/admin'); // panel de administrador

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // necesario para cookies "secure" detrás del proxy de Render
}

app.use(express.json()); // permite leer el body de las peticiones como JSON

// guarda quién inició sesión en una cookie, para no pedir login en cada petición
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true, // renueva el tiempo de expiración en cada petición (sesión por inactividad, RNF6)
    cookie: {
      httpOnly: true, // el navegador no deja leer la cookie desde JavaScript (más seguro)
      secure: process.env.NODE_ENV === 'production', // solo viaja por HTTPS en producción
      maxAge: 1000 * 60 * 15, // la sesión expira a los 15 minutos de inactividad (RNF6)
    },
  })
);

// sirve los archivos de public/ (html, css, js del frontend) tal cual
app.use(express.static(path.join(__dirname, 'public')));

// conecta cada grupo de rutas a su prefijo de URL
app.use('/api/auth', authRoutes);
app.use('/api/marcaciones', marcacionesRoutes);
app.use('/api/admin', adminRoutes);

// si una ruta lanza un error no controlado, cae aquí en vez de romper el servidor
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 3000;

// primero se conecta a la base de datos, y solo si eso funciona se empieza a recibir tráfico
conectarDB().then(() => {
  app.listen(PORT, () => console.log(`HorasControl escuchando en http://localhost:${PORT}`));
});
