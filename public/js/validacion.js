// Valida campos obligatorios y formato de correo antes de enviar el formulario,
// mostrando un mensaje de error específico junto a cada campo inválido.
// "reglas" es una lista de { input, error, email }: el campo a revisar, dónde mostrar
// el mensaje de error, y si además de obligatorio debe tener forma de correo.
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
      error.textContent = ''; // campo correcto: borra cualquier error anterior
    }
  }
  return valido; // true solo si todos los campos pasaron la validación
}
