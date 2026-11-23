const mongoose = require('mongoose');

// alertas simples para un colaborador, por ejemplo "te quedó una entrada sin salida".
const notificacionSchema = new mongoose.Schema({
  colaboradorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true },
  mensaje: { type: String, required: true },
  leida: { type: Boolean, default: false }, // pasa a true cuando el colaborador la cierra
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notificacion', notificacionSchema);
