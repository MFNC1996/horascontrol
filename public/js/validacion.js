// Valida campos obligatorios y formato de correo antes de enviar el formulario (RNF4).
function validarCampos(reglas) {
  let valido = true;
  for (const { input, error, email } of reglas) {
    const valor = input.value.trim();
    if (!valor) {
      error.textContent = 'Este campo es obligatorio.';
      valido = false;
    } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      error.textContent = 'Ingresa un correo electrónico válido.';
      valido = false;
    } else {
      error.textContent = '';
    }
  }
  return valido;
}
