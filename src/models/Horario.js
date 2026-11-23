const mongoose = require('mongoose');

// cuántas horas por semana se espera que trabaje cada colaborador. Un documento por colaborador.
const horarioSchema = new mongoose.Schema({
  colaboradorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true, index: true },
  horasEsperadasSemana: { type: Number, default: 40 }, // el admin lo puede ajustar desde el panel
});

module.exports = mongoose.model('Horario', horarioSchema);
