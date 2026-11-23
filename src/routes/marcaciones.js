const express = require('express');
const Marcacion = require('../models/Marcacion');
const Notificacion = require('../models/Notificacion');
const ResumenSemanal = require('../models/ResumenSemanal');
const { requireAuth } = require('../middleware/auth');
const { calcularPares, sumarHorasUltimos7Dias, inicioSemanaActual } = require('../utils/horas');

const router = express.Router();
router.use(requireAuth); // todas las rutas de aquí abajo exigen sesión iniciada

// POST /api/marcaciones  — registra entrada o salida (RF2, RF3, RF10, RF12)
router.post('/', async (req, res) => {
  const { tipo } = req.body;
  if (tipo !== 'entrada' && tipo !== 'salida') {
    return res.status(400).json({ error: 'Tipo debe ser "entrada" o "salida".' });
  }

  // revisa cuál fue la última marcación de este colaborador, para no dejar marcar
  // dos entradas seguidas ni una salida sin una entrada abierta antes (RF10)
  const ultima = await Marcacion.findOne({ colaboradorId: req.session.userId }).sort({ fechaHora: -1 });

  if (tipo === 'entrada' && ultima && ultima.tipo === 'entrada') {
    return res.status(400).json({ error: 'Ya tienes una entrada sin salida registrada.' });
  }
  if (tipo === 'salida' && (!ultima || ultima.tipo === 'salida')) {
    return res.status(400).json({ error: 'No hay una entrada abierta para marcar la salida.' });
  }

  // la hora la pone el servidor, nunca el cliente (RF12)
  const marcacion = await Marcacion.create({ colaboradorId: req.session.userId, tipo, fechaHora: new Date() });

  if (tipo === 'salida') {
    // se completó un par entrada/salida: recalcula el total de la semana y lo deja
    // guardado en ResumenSemanal, para no tener que recalcularlo cada vez que se consulta
    const marcaciones = await Marcacion.find({ colaboradorId: req.session.userId });
    const totalHorasSemana = sumarHorasUltimos7Dias(calcularPares(marcaciones));
    await ResumenSemanal.findOneAndUpdate(
      { colaboradorId: req.session.userId, semanaInicio: inicioSemanaActual() },
      { totalHoras: Number(totalHorasSemana.toFixed(2)), generadoEn: new Date() },
      { upsert: true } // si no existía un resumen para esta semana, lo crea
    );
  }

  res.status(201).json({ tipo: marcacion.tipo, fechaHora: marcacion.fechaHora });
});

// GET /api/marcaciones/propias — historial y horas del colaborador (RF5)
router.get('/propias', async (req, res) => {
  const marcaciones = await Marcacion.find({ colaboradorId: req.session.userId }).sort({ fechaHora: -1 }).limit(30);
  const pares = calcularPares(marcaciones); // agrupa entrada+salida y calcula las horas de cada jornada
  const totalHorasSemana = sumarHorasUltimos7Dias(pares);

  // si quedó una entrada marcada hace más de 12 horas sin su salida, crea una notificación
  // (solo si no hay otra sin leer todavía, para no repetir el mismo aviso)
  const ultima = marcaciones[0];
  if (ultima && ultima.tipo === 'entrada' && Date.now() - ultima.fechaHora.getTime() > 12 * 60 * 60 * 1000) {
    const yaExiste = await Notificacion.findOne({ colaboradorId: req.session.userId, leida: false });
    if (!yaExiste) {
      await Notificacion.create({
        colaboradorId: req.session.userId,
        mensaje: 'Tienes una entrada marcada hace más de 12 horas sin salida registrada.',
      });
    }
  }

  res.json({
    marcaciones,
    pares,
    totalHorasSemana: Number(totalHorasSemana.toFixed(2)),
  });
});

// GET /api/marcaciones/notificaciones — alertas pendientes del colaborador
router.get('/notificaciones', async (req, res) => {
  const notificaciones = await Notificacion.find({ colaboradorId: req.session.userId, leida: false }).sort({
    createdAt: -1,
  });
  res.json(notificaciones);
});

// PATCH /api/marcaciones/notificaciones/:id — marcar como leída
router.patch('/notificaciones/:id', async (req, res) => {
  await Notificacion.findOneAndUpdate({ _id: req.params.id, colaboradorId: req.session.userId }, { leida: true });
  res.json({ ok: true });
});

module.exports = router;
