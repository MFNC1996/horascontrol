// Esto es un "util": funciones de apoyo con cálculos que usan varias rutas,
// para no repetir la misma lógica en cada una.

// Empareja marcaciones de entrada/salida (ya vienen alternadas porque la ruta
// de marcaciones nunca deja guardar dos entradas seguidas) y calcula cuántas horas duró cada jornada.
function calcularPares(marcaciones) {
  const ordenadas = [...marcaciones].sort((a, b) => a.fechaHora - b.fechaHora);
  const pares = [];
  let entradaAbierta = null;

  for (const m of ordenadas) {
    if (m.tipo === 'entrada') {
      entradaAbierta = m;
    } else if (m.tipo === 'salida' && entradaAbierta) {
      const horas = (m.fechaHora - entradaAbierta.fechaHora) / 1000 / 60 / 60;
      pares.push({ entrada: entradaAbierta.fechaHora, salida: m.fechaHora, horas });
      entradaAbierta = null;
    }
  }
  return pares.reverse(); // más reciente primero
}

// suma las horas solo de los pares cuya entrada fue en los últimos 7 días
function sumarHorasUltimos7Dias(pares) {
  const haceUnaSemana = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return pares
    .filter((p) => p.entrada.getTime() >= haceUnaSemana)
    .reduce((acc, p) => acc + p.horas, 0);
}

// Lunes 00:00 de la semana actual, usado para agrupar el ResumenSemanal.
function inicioSemanaActual() {
  const ahora = new Date();
  const dia = ahora.getDay(); // 0 = domingo
  const diff = (dia === 0 ? -6 : 1) - dia;
  const inicio = new Date(ahora);
  inicio.setHours(0, 0, 0, 0);
  inicio.setDate(ahora.getDate() + diff);
  return inicio;
}

module.exports = { calcularPares, sumarHorasUltimos7Dias, inicioSemanaActual };
