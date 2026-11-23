// se ejecuta cuando el usuario aprieta "Entrar" en el formulario de login
document.getElementById('formLogin').addEventListener('submit', async (evento) => {
  evento.preventDefault(); // evita que la página se recargue (comportamiento normal de un form)

  const correoInput = document.getElementById('correo');
  const passwordInput = document.getElementById('password');
  const mensaje = document.getElementById('mensaje');
  mensaje.textContent = '';

  // revisa los campos antes de gastar una llamada al servidor
  const valido = validarCampos([
    { input: correoInput, error: document.getElementById('errorCorreo'), email: true },
    { input: passwordInput, error: document.getElementById('errorPassword') },
  ]);
  if (!valido) return;

  const correo = correoInput.value;
  const password = passwordInput.value;

  try {
    // le pide al servidor que revise las credenciales
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

    // login correcto: según el rol que devolvió el servidor, va a una pantalla u otra
    window.location.href = datos.rol === 'administrador' ? 'admin.html' : 'panel.html';
  } catch (error) {
    mensaje.textContent = 'No se pudo conectar con el servidor.';
  }
});
