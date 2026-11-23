const mongoose = require('mongoose');

const resumenSemanalSchema = new mongoose.Schema({
  colaboradorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  semanaInicio: { type: Date, required: true },
  totalHoras: { type: Number, required: true },
  generadoEn: { type: Date, default: Date.now },
});

resumenSemanalSchema.index({ colaboradorId: 1, semanaInicio: 1 }, { unique: true });

module.exports = mongoose.model('ResumenSemanal', resumenSemanalSchema);
