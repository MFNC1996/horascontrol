document.getElementById('formLogin').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const correo = document.getElementById('correo').value;
  const password = document.getElementById('password').value;
  const mensaje = document.getElementById('mensaje');
  mensaje.textContent = '';

  try {
    const respuesta = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password }),
    });
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mensaje.textContent = datos.error || 'No se pudo iniciar sesión.';
      return;
    }

    window.location.href = datos.rol === 'administrador' ? 'admin.html' : 'panel.html';
  } catch (error) {
    mensaje.textContent = 'No se pudo conectar con el servidor.';
  }
});
