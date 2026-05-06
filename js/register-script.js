function goToLogin() {
  window.location.href = './login.html';
}

// Selecciona el botón de crear cuenta y lo enlaza a la página principal.
const botonCrear = document.getElementById('btn-crear');
if (botonCrear) {
  botonCrear.addEventListener('click', function() {
    window.location.href = './intex.html';
  });
}