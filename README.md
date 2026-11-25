# HorasControl

Sistema web simple de registro y control de horas trabajadas. Node.js + Express + MongoDB, sin frameworks de frontend.

## En producción

- Aplicación: https://horascontrol.onrender.com
- Hosting: [Render](https://render.com) (plan gratuito)
- Base de datos: [MongoDB Atlas](https://cloud.mongodb.com) (plan gratuito)
- Despliegue automático: cada `git push` a `main` reconstruye y reinicia el servicio en Render.

Nota: al estar en el plan gratuito de Render, el servicio "duerme" tras un rato sin tráfico; la
primera visita después de eso puede tardar unos 30-50 segundos en responder.

## Cómo correrlo en tu computador

1. Instala las dependencias:
   ```
   npm install
   ```
2. Copia `.env.example` a `.env` y completa los datos (necesitas MongoDB corriendo local o una URI de MongoDB Atlas, y los datos del primer administrador).
3. Crea el usuario administrador:
   ```
   npm run seed
   ```
4. Levanta el servidor:
   ```
   npm start
   ```
5. Abre `http://localhost:3000` en el navegador.

## Estructura

- `server.js` — arma la app de Express, las sesiones y monta las rutas.
- `src/db.js` — conexión a MongoDB.
- `src/models/` — esquemas de MongoDB: `Usuario`, `Marcacion`, `Horario`, `Notificacion`, `Auditoria`, `ResumenSemanal`.
- `src/routes/` — endpoints de la API (`auth`, `marcaciones`, `admin`).
- `src/middleware/auth.js` — controla sesión y rol en cada ruta protegida.
- `src/utils/horas.js` — cálculo de horas trabajadas a partir de las marcaciones.
- `src/seed.js` — crea el primer usuario administrador (`npm run seed`).
- `public/` — frontend (HTML, CSS y JS planos, sin build ni frameworks).

El código fuente está comentado en español explicando qué hace cada función

## Variables de entorno

| Variable | Para qué sirve |
|---|---|
| `MONGODB_URI` | conexión a la base de datos |
| `SESSION_SECRET` | clave para firmar la cookie de sesión |
| `NODE_ENV` | en `production` activa cookies seguras y `trust proxy` (necesario detrás de Render) |
| `PORT` | puerto del servidor (Render lo asigna solo) |
| `ADMIN_NOMBRE`, `ADMIN_CORREO`, `ADMIN_PASSWORD` | datos del primer administrador, usados solo por `npm run seed` |
