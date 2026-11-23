const mensaje = document.getElementById('mensaje');

async function cargarResumen() {
  const respuesta = await fetch('/api/admin/resumen');
  if (respuesta.status === 401) {
    window.location.href = 'login.html';
    return;
  }
  if (respuesta.status === 403) {
    mensaje.textContent = 'Tu cuenta no tiene permisos de administrador.';
    return;
  }

  const colaboradores = await respuesta.json();
  const tbody = document.getElementById('tablaResumen');
  tbody.innerHTML = '';

  for (const c of colaboradores) {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td class="${c.activo ? '' : 'inactivo'}">${c.nombre} (${c.correo})</td>
      <td>${c.totalHorasSemana} h</td>
      <td><input type="number" min="0" class="inputHorario" data-id="${c.id}" value="${c.horasEsperadasSemana}" /> h/sem</td>
      <td>${c.activo ? 'Activo' : 'Desactivado'}</td>
      <td><button data-id="${c.id}" data-activo="${c.activo}" class="btnToggle">
        ${c.activo ? 'Desactivar' : 'Activar'}
      </button></td>
    `;
    tbody.appendChild(fila);
  }

  document.querySelectorAll('.btnToggle').forEach((boton) => {
    boton.addEventListener('click', async () => {
      const nuevoEstado = boton.dataset.activo !== 'true';
      await fetch(`/api/admin/colaboradores/${boton.dataset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: nuevoEstado }),
      });
      await cargarResumen();
      await cargarAuditoria();
    });
  });

  document.querySelectorAll('.inputHorario').forEach((input) => {
    input.addEventListener('change', async () => {
      await fetch(`/api/admin/colaboradores/${input.dataset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horasEsperadasSemana: Number(input.value) }),
      });
      await cargarResumen();
    });
  });
}

async function cargarAuditoria() {
  const respuesta = await fetch('/api/admin/auditoria');
  if (respuesta.status !== 200) return;

  const registros = await respuesta.json();
  const tbody = document.getElementById('tablaAuditoria');
  tbody.innerHTML = '';

  for (const r of registros) {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${new Date(r.fecha).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}</td>
      <td>${r.admin ?? '—'}</td>
      <td>${r.detalle}</td>
    `;
    tbody.appendChild(fila);
  }
}

document.getElementById('formNuevo').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mensaje.textContent = '';

  const nombreInput = document.getElementById('nombre');
  const correoInput = document.getElementById('correo');
  const passwordInput = document.getElementById('password');

  const valido = validarCampos([
    { input: nombreInput, error: document.getElementById('errorNombre') },
    { input: correoInput, error: document.getElementById('errorCorreo'), email: true },
    { input: passwordInput, error: document.getElementById('errorPassword') },
  ]);
  if (!valido) return;

  const nombre = nombreInput.value;
  const correo = correoInput.value;
  const password = passwordInput.value;

  const respuesta = await fetch('/api/admin/colaboradores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, correo, password }),
  });
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    mensaje.textContent = datos.error;
    return;
  }

  document.getElementById('formNuevo').reset();
  await cargarResumen();
  await cargarAuditoria();
});

document.getElementById('btnSalir').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = 'login.html';
});

cargarResumen();
cargarAuditoria();
