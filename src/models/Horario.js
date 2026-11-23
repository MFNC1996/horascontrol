const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema({
  colaboradorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true, index: true },
  horasEsperadasSemana: { type: Number, default: 40 },
});

module.exports = mongoose.model('Horario', horarioSchema);
