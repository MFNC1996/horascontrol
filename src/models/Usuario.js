const mongoose = require('mongoose');

// una cuenta del sistema: puede ser un colaborador o el administrador.
const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true, lowercase: true, trim: true }, // sirve para iniciar sesión, no puede repetirse
  passwordHash: { type: String, required: true }, // la contraseña ya cifrada con bcrypt, nunca en texto plano
  rol: { type: String, enum: ['colaborador', 'administrador'], default: 'colaborador' },
  activo: { type: Boolean, default: true }, // si el admin lo desactiva, no puede volver a iniciar sesión
});

module.exports = mongoose.model('Usuario', usuarioSchema);
