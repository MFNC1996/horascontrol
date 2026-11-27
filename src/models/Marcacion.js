const mongoose = require('mongoose');

// cada marcación de entrada o salida que hace un colaborador. Es el registro central del sistema.
const marcacionSchema = new mongoose.Schema({
  colaboradorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true }, // quién marcó
  tipo: { type: String, enum: ['entrada', 'salida'], required: true },
  fechaHora: { type: Date, default: Date.now }, // la pone el servidor, el usuario no la puede editar
  createdAt: { type: Date, default: Date.now },
});

// índice para que las consultas "dame las marcaciones de este colaborador, ordenadas por fecha"
// (que son las más frecuentes del sistema) sean rápidas incluso con muchos registros.
marcacionSchema.index({ colaboradorId: 1, fechaHora: -1 });

module.exports = mongoose.model('Marcacion', marcacionSchema);
