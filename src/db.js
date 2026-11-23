const mongoose = require('mongoose');

// se conecta a MongoDB usando la URL guardada en MONGODB_URI (.env en local, variable de
// entorno en Render). Mongoose reutiliza esta misma conexión para todos los modelos.
async function conectarDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado a MongoDB');
}

module.exports = conectarDB;
