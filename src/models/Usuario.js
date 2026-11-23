const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  rol: { type: String, enum: ['colaborador', 'administrador'], default: 'colaborador' },
  activo: { type: Boolean, default: true },
});

module.exports = mongoose.model('Usuario', usuarioSchema);
