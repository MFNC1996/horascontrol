const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
  colaboradorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true },
  mensaje: { type: String, required: true },
  leida: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notificacion', notificacionSchema);
