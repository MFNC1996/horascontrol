const mongoose = require('mongoose');

// guarda el total de horas ya calculado de un colaborador para una semana puntual,
// así no hay que recalcularlo desde cero cada vez que alguien pide un reporte.
const resumenSemanalSchema = new mongoose.Schema({
  colaboradorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  semanaInicio: { type: Date, required: true }, // lunes de esa semana
  totalHoras: { type: Number, required: true },
  generadoEn: { type: Date, default: Date.now },
});

// como máximo un resumen por colaborador y semana (si ya existe, se actualiza en vez de duplicar)
resumenSemanalSchema.index({ colaboradorId: 1, semanaInicio: 1 }, { unique: true });

module.exports = mongoose.model('ResumenSemanal', resumenSemanalSchema);
