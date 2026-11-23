// Crea el primer usuario administrador, usando los datos del .env.
// Se ejecuta una sola vez con: npm run seed
require('dotenv').config();
const bcrypt = require('bcrypt');
const conectarDB = require('./db');
const Usuario = require('./models/Usuario');

async function seed() {
  await conectarDB();

  const correo = process.env.ADMIN_CORREO.toLowerCase().trim();
  const existe = await Usuario.findOne({ correo });
  if (existe) {
    console.log('Ya existe un usuario con ese correo, no se creó nada.');
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  await Usuario.create({
    nombre: process.env.ADMIN_NOMBRE,
    correo,
    passwordHash,
    rol: 'administrador',
  });

  console.log(`Administrador creado: ${correo}`);
  process.exit(0);
}

seed();
