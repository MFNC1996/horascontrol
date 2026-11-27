// Ruta: agrupa todo lo que puede hacer el administrador (/api/admin/...). Cada función
// de aquí abajo corresponde a una URL y un verbo HTTP (GET, POST, PATCH) específicos.
const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const Marcacion = require('../models/Marcacion');
const Horario = require('../models/Horario');
const Auditoria = require('../models/Auditoria');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { calcularPares, sumarHorasUltimos7Dias } = require('../utils/horas');

const router = express.Router();
router.use(requireAuth, requireAdmin); // todas estas rutas exigen sesión Y rol administrador

// GET /api/admin/colaboradores — listado
router.get('/colaboradores', async (req, res) => {
  const colaboradores = await Usuario.find({ rol: 'colaborador' }, '-passwordHash').sort({ nombre: 1 });
  res.json(colaboradores);
});

// POST /api/admin/colaboradores — crear cuenta
router.post('/colaboradores', async (req, res) => {
  const { nombre, correo, password } = req.body;
  if (!nombre || !correo || !password) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios.' });
  }

  const existe = await Usuario.findOne({ correo: correo.toLowerCase().trim() });
  if (existe) {
    return res.status(400).json({ error: 'Ya existe una cuenta con ese correo.' });
  }

  const passwordHash = await bcrypt.hash(password, 10); // cifra la contraseña antes de guardarla, nunca en texto plano
  const colaborador = await Usuario.create({
    nombre,
    correo: correo.toLowerCase().trim(),
    passwordHash,
    rol: 'colaborador',
  });

  // junto con la cuenta, se crea su horario esperado (40h por defecto) y queda
  // registrado en la auditoría que el administrador creó esta cuenta
  await Horario.create({ colaboradorId: colaborador._id, horasEsperadasSemana: 40 });
  await Auditoria.create({
    adminId: req.session.userId,
    accion: 'crear_colaborador',
    detalle: `Creó la cuenta de ${colaborador.nombre} (${colaborador.correo})`,
  });

  res.status(201).json({ id: colaborador._id, nombre: colaborador.nombre, correo: colaborador.correo });
});

// PATCH /api/admin/colaboradores/:id — activar/desactivar cuenta o ajustar horario esperado
router.patch('/colaboradores/:id', async (req, res) => {
  const { activo, horasEsperadasSemana } = req.body;
  const cambios = {};
  if (activo !== undefined) cambios.activo = Boolean(activo);

  const colaborador = await Usuario.findOneAndUpdate({ _id: req.params.id, rol: 'colaborador' }, cambios, {
    new: true, // que devuelva el documento ya actualizado, no el de antes del cambio
  });
  if (!colaborador) {
    return res.status(404).json({ error: 'Colaborador no encontrado.' });
  }

  // si vino un horario nuevo, lo actualiza (o lo crea si por algo no existía)
  if (horasEsperadasSemana !== undefined) {
    await Horario.findOneAndUpdate(
      { colaboradorId: colaborador._id },
      { horasEsperadasSemana: Number(horasEsperadasSemana) },
      { upsert: true }
    );
  }

  // si se activó o desactivó la cuenta, queda esa acción registrada en la auditoría
  if (activo !== undefined) {
    await Auditoria.create({
      adminId: req.session.userId,
      accion: activo ? 'activar_colaborador' : 'desactivar_colaborador',
      detalle: `${activo ? 'Activó' : 'Desactivó'} a ${colaborador.nombre}`,
    });
  }

  res.json({ id: colaborador._id, activo: colaborador.activo });
});

// GET /api/admin/resumen — horas y horario esperado de todos los colaboradores
router.get('/resumen', async (req, res) => {
  const colaboradores = await Usuario.find({ rol: 'colaborador' }, '-passwordHash').sort({ nombre: 1 });

  // por cada colaborador, calcula sus horas de la semana y busca su horario esperado;
  // Promise.all lanza todas esas consultas en paralelo en vez de una por una
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
        horasEsperadasSemana: horario?.horasEsperadasSemana ?? 40, // 40 si todavía no tiene horario propio
      };
    })
  );

  res.json(resumen);
});

// GET /api/admin/auditoria — últimas acciones administrativas registradas
router.get('/auditoria', async (req, res) => {
  // trae los últimos 20 registros, con el nombre del admin en vez de solo su id (populate)
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
