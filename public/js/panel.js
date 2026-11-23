const mensaje = document.getElementById('mensaje');
let siguienteTipo = 'entrada';

function formatearHora(fechaIso) {
  return new Date(fechaIso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
}

async function cargarDatos() {
  const respuesta = await fetch('/api/marcaciones/propias');
  if (respuesta.status === 401) {
    window.location.href = 'login.html';
    return;
  }
  const datos = await respuesta.json();

  siguienteTipo = datos.marcaciones[0]?.tipo === 'entrada' ? 'salida' : 'entrada';
  document.getElementById('btnMarcar').textContent =
    siguienteTipo === 'entrada' ? 'Marcar entrada' : 'Marcar salida';

  document.getElementById('totalHoras').textContent = `${datos.totalHorasSemana} h`;

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

  document.querySelectorAll('.btnCerrarAviso').forEach((boton) => {
    boton.addEventListener('click', async () => {
      await fetch(`/api/marcaciones/notificaciones/${boton.dataset.id}`, { method: 'PATCH' });
      await cargarNotificaciones();
    });
  });
}

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

cargarDatos();
cargarNotificaciones();
