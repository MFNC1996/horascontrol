# HorasControl

Sistema web simple de registro y control de horas trabajadas. Node.js + Express + MongoDB, sin frameworks de frontend.

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

- `server.js` — arma la app de Express, sesiones y monta las rutas.
- `src/models/` — esquemas de MongoDB (Usuario, Marcacion).
- `src/routes/` — endpoints de la API (auth, marcaciones, admin).
- `src/middleware/auth.js` — controla sesión y rol.
- `public/` — frontend (HTML, CSS y JS planos, sin build).
