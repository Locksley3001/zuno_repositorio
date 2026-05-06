function goToRegister() {
  window.location.href = './register.html';
}

// Selecciona el botón de login y lo enlaza a la página principal.
const botonLogin = document.getElementById('btn-iniciar');
if (botonLogin) {
  botonLogin.addEventListener('click', function() {
    window.location.href = './intex.html';
  });
}