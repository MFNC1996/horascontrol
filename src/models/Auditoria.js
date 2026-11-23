const mongoose = require('mongoose');

const auditoriaSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  accion: { type: String, required: true },
  detalle: { type: String },
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Auditoria', auditoriaSchema);
