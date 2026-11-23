// Lógica de la pantalla del colaborador: marcar entrada/salida, ver historial y avisos.

const mensaje = document.getElementById('mensaje');
let siguienteTipo = 'entrada'; // guarda si el próximo clic debe marcar entrada o salida

function formatearHora(fechaIso) {
  return new Date(fechaIso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
}

// pide al servidor el historial del colaborador y repinta el botón y la tabla
async function cargarDatos() {
  const respuesta = await fetch('/api/marcaciones/propias');
  if (respuesta.status === 401) {
    window.location.href = 'login.html'; // no hay sesión activa: lo manda a loguearse
    return;
  }
  const datos = await respuesta.json();

  // si la última marcación fue "entrada", el próximo botón debe marcar "salida", y viceversa
  siguienteTipo = datos.marcaciones[0]?.tipo === 'entrada' ? 'salida' : 'entrada';
  document.getElementById('btnMarcar').textContent =
    siguienteTipo === 'entrada' ? 'Marcar entrada' : 'Marcar salida';

  document.getElementById('totalHoras').textContent = `${datos.totalHorasSemana} h`;

  // vuelve a construir la tabla de historial, fila por fila, con cada par entrada/salida
  const tbody = document.getElementById('tablaHistorial');
  tbody.innerHTML = '';
  for (const par of datos.pares) {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${formatearHora(par.entrada)}</td>
      <td>${formatearHora(par.salida)}</td>
      <td>${par.horas.toFixed(2)} h</td>
    `;
    tbody.appendChild(fila);
  }
}

// pide las notificaciones pendientes (ej. "te quedó una entrada sin salida") y las muestra
async function cargarNotificaciones() {
  const respuesta = await fetch('/api/marcaciones/notificaciones');
  if (respuesta.status === 401) return;
  const notificaciones = await respuesta.json();

  const contenedor = document.getElementById('notificaciones');
  contenedor.innerHTML = '';
  for (const n of notificaciones) {
    const aviso = document.createElement('div');
    aviso.className = 'aviso';
    aviso.innerHTML = `<span>${n.mensaje}</span><button data-id="${n.id}" class="btnCerrarAviso">Entendido</button>`;
    contenedor.appendChild(aviso);
  }

  // cada botón "Entendido" marca esa notificación como leída y vuelve a cargar la lista
  document.querySelectorAll('.btnCerrarAviso').forEach((boton) => {
    boton.addEventListener('click', async () => {
      await fetch(`/api/marcaciones/notificaciones/${boton.dataset.id}`, { method: 'PATCH' });
      await cargarNotificaciones();
    });
  });
}

// clic en el botón grande: registra la marcación (entrada o salida, según corresponda)
document.getElementById('btnMarcar').addEventListener('click', async () => {
  mensaje.textContent = '';
  try {
    const respuesta = await fetch('/api/marcaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: siguienteTipo }),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) {
      mensaje.textContent = datos.error;
      return;
    }
    // vuelve a cargar todo para que la pantalla quede al día, sin recargar la página
    await cargarDatos();
    await cargarNotificaciones();
  } catch (error) {
    mensaje.textContent = 'No se pudo registrar la marcación.';
  }
});

document.getElementById('btnSalir').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = 'login.html';
});

// carga inicial, apenas se abre la página
cargarDatos();
cargarNotificaciones();
