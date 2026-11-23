const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const Marcacion = require('../models/Marcacion');
const Horario = require('../models/Horario');
const Auditoria = require('../models/Auditoria');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { calcularPares, sumarHorasUltimos7Dias } = require('../utils/horas');

const router = express.Router();
router.use(requireAuth, requireAdmin);

// GET /api/admin/colaboradores — listado (RF6)
router.get('/colaboradores', async (req, res) => {
  const colaboradores = await Usuario.find({ rol: 'colaborador' }, '-passwordHash').sort({ nombre: 1 });
  res.json(colaboradores);
});

// POST /api/admin/colaboradores — crear cuenta (RF8)
router.post('/colaboradores', async (req, res) => {
  const { nombre, correo, password } = req.body;
  if (!nombre || !correo || !password) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios.' });
  }

  const existe = await Usuario.findOne({ correo: correo.toLowerCase().trim() });
  if (existe) {
    return res.status(400).json({ error: 'Ya existe una cuenta con ese correo.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const colaborador = await Usuario.create({
    nombre,
    correo: correo.toLowerCase().trim(),
    passwordHash,
    rol: 'colaborador',
  });

  await Horario.create({ colaboradorId: colaborador._id, horasEsperadasSemana: 40 });
  await Auditoria.create({
    adminId: req.session.userId,
    accion: 'crear_colaborador',
    detalle: `Creó la cuenta de ${colaborador.nombre} (${colaborador.correo})`,
  });

  res.status(201).json({ id: colaborador._id, nombre: colaborador.nombre, correo: colaborador.correo });
});

// PATCH /api/admin/colaboradores/:id — activar/desactivar cuenta o ajustar horario esperado (RF9)
router.patch('/colaboradores/:id', async (req, res) => {
  const { activo, horasEsperadasSemana } = req.body;
  const cambios = {};
  if (activo !== undefined) cambios.activo = Boolean(activo);

  const colaborador = await Usuario.findOneAndUpdate({ _id: req.params.id, rol: 'colaborador' }, cambios, {
    new: true,
  });
  if (!colaborador) {
    return res.status(404).json({ error: 'Colaborador no encontrado.' });
  }

  if (horasEsperadasSemana !== undefined) {
    await Horario.findOneAndUpdate(
      { colaboradorId: colaborador._id },
      { horasEsperadasSemana: Number(horasEsperadasSemana) },
      { upsert: true }
    );
  }

  if (activo !== undefined) {
    await Auditoria.create({
      adminId: req.session.userId,
      accion: activo ? 'activar_colaborador' : 'desactivar_colaborador',
      detalle: `${activo ? 'Activó' : 'Desactivó'} a ${colaborador.nombre}`,
    });
  }

  res.json({ id: colaborador._id, activo: colaborador.activo });
});

// GET /api/admin/resumen — horas y horario esperado de todos los colaboradores (RF7)
router.get('/resumen', async (req, res) => {
  const colaboradores = await Usuario.find({ rol: 'colaborador' }, '-passwordHash').sort({ nombre: 1 });

  const resumen = await Promise.all(
    colaboradores.map(async (c) => {
      const marcaciones = await Marcacion.find({ colaboradorId: c._id });
      const pares = calcularPares(marcaciones);
      const totalHorasSemana = sumarHorasUltimos7Dias(pares);
      const horario = await Horario.findOne({ colaboradorId: c._id });
      return {
        id: c._id,
        nombre: c.nombre,
        correo: c.correo,
        activo: c.activo,
        totalHorasSemana: Number(totalHorasSemana.toFixed(2)),
        horasEsperadasSemana: horario?.horasEsperadasSemana ?? 40,
      };
    })
  );

  res.json(resumen);
});

// GET /api/admin/auditoria — últimas acciones administrativas registradas
router.get('/auditoria', async (req, res) => {
  const registros = await Auditoria.find().sort({ fecha: -1 }).limit(20).populate('adminId', 'nombre');
  res.json(
    registros.map((r) => ({
      id: r._id,
      accion: r.accion,
      detalle: r.detalle,
      fecha: r.fecha,
      admin: r.adminId?.nombre,
    }))
  );
});

module.exports = router;
