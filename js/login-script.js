// login-script.js
// =============================================
// Código anterior (comentado):
//   botonLogin.addEventListener('click', () => window.location.href = './intex.html')
//
// Se reemplaza porque solo redirigía sin validar ni guardar nada.
// Ahora:
//   1. Valida que los campos estén completos
//   2. Busca el usuario en 'zuno-users' (array de cuentas registradas)
//   3. Verifica la contraseña
//   4. Guarda el usuario activo en 'zuno-user' (lo lee profile.html)
//   5. Redirige a intex.html si todo es correcto
// =============================================

// Mismas claves que usa script-profile.js
const USER_KEY  = 'zuno-user';   // Usuario activo (objeto)
const USERS_KEY = 'zuno-users';  // Todas las cuentas registradas (array)

function goToRegister() {
    window.location.href = './register.html';
}

document.addEventListener('DOMContentLoaded', function () {

    // Si ya hay sesión activa, saltar login directamente
    if (localStorage.getItem(USER_KEY)) {
        window.location.href = './intex.html';
        return;
    }

    const botonLogin = document.getElementById('btn-iniciar');
    if (!botonLogin) return;

    botonLogin.addEventListener('click', function () {
        // Leer los inputs del formulario existente en login.html
        const emailInput    = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');

        const email    = emailInput    ? emailInput.value.trim().toLowerCase()    : '';
        const password = passwordInput ? passwordInput.value : '';

        // Limpiar mensaje de error anterior si existe
        clearError();

        // ── Validación 1: campos vacíos ──
        if (!email || !password) {
            showError('Completa todos los campos.');
            return;
        }

        // ── Validación 2: buscar cuenta registrada ──
        // 'zuno-users' es el array escrito por register-script.js
        const users   = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const matched = users.find(u => u.email.toLowerCase() === email);

        if (!matched) {
            showError('No existe una cuenta con ese correo. ¿Quieres registrarte?');
            return;
        }

        // ── Validación 3: contraseña correcta ──
        if (matched.password !== password) {
            showError('Contraseña incorrecta. Inténtalo de nuevo.');
            return;
        }

        // ── Login exitoso: guardar usuario activo ──
        // Este objeto es el que leerá script-profile.js con getUser()
        localStorage.setItem(USER_KEY, JSON.stringify({
            name:     matched.name,
            email:    matched.email,
            password: matched.password
        }));

        // Redirigir a la página principal
        window.location.href = './intex.html';
    });
});

// ── Helpers de mensajes de error ──
// Busca o crea un elemento de error bajo el formulario

function showError(msg) {
    let errEl = document.getElementById('login-error-msg');
    if (!errEl) {
        errEl = document.createElement('p');
        errEl.id = 'login-error-msg';
        errEl.style.cssText = [
            'color: #fca5a5',
            'font-size: 13px',
            'margin-top: 8px',
            'padding: 10px 14px',
            'background: rgba(239,68,68,0.1)',
            'border: 1px solid rgba(239,68,68,0.25)',
            'border-radius: 8px',
            'font-weight: 500'
        ].join(';');

        // Insertar antes del botón de login
        const btn = document.getElementById('btn-iniciar');
        if (btn && btn.parentNode) {
            btn.parentNode.insertBefore(errEl, btn);
        }
    }
    errEl.textContent   = msg;
    errEl.style.display = 'block';
}

function clearError() {
    const errEl = document.getElementById('login-error-msg');
    if (errEl) errEl.style.display = 'none';
}