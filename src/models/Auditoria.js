const mongoose = require('mongoose');

// deja registrado cada acción del administrador (crear o desactivar un colaborador, etc.),
// para poder revisar después quién hizo qué y cuándo.
const auditoriaSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  accion: { type: String, required: true }, // ej: "crear_colaborador"
  detalle: { type: String }, // texto legible de lo que pasó
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Auditoria', auditoriaSchema);
