require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const conectarDB = require('./src/db');

const authRoutes = require('./src/routes/auth');
const marcacionesRoutes = require('./src/routes/marcaciones');
const adminRoutes = require('./src/routes/admin');

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // necesario para cookies "secure" detrás del proxy de Render
}

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 15, // 15 minutos de inactividad (RNF6)
    },
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/marcaciones', marcacionesRoutes);
app.use('/api/admin', adminRoutes);

// manejo simple y consistente de errores no controlados
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 3000;

conectarDB().then(() => {
  app.listen(PORT, () => console.log(`HorasControl escuchando en http://localhost:${PORT}`));
});
