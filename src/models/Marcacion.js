const mongoose = require('mongoose');

const marcacionSchema = new mongoose.Schema({
  colaboradorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true },
  tipo: { type: String, enum: ['entrada', 'salida'], required: true },
  fechaHora: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

marcacionSchema.index({ colaboradorId: 1, fechaHora: -1 });

module.exports = mongoose.model('Marcacion', marcacionSchema);
