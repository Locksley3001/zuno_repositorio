// register-script.js
// =============================================
// Código anterior (comentado):
//   botonCrear.addEventListener('click', () => window.location.href = './intex.html')
//
// Se reemplaza porque solo redirigía sin guardar ningún dato.
// Ahora:
//   1. Valida que todos los campos estén completos
//   2. Verifica que el email no esté ya registrado
//   3. Agrega el nuevo usuario al array 'zuno-users'
//   4. Guarda el usuario activo en 'zuno-user' (login inmediato)
//   5. Redirige a intex.html
// =============================================

// Mismas claves que usan login-script.js y script-profile.js
const USER_KEY  = 'zuno-user';   // Usuario activo (objeto)
const USERS_KEY = 'zuno-users';  // Todas las cuentas registradas (array)

function goToLogin() {
    window.location.href = './login.html';
}

document.addEventListener('DOMContentLoaded', function () {

    // Si ya hay sesión activa, saltar registro directamente
    if (localStorage.getItem(USER_KEY)) {
        window.location.href = './intex.html';
        return;
    }

    const botonCrear = document.getElementById('btn-crear');
    if (!botonCrear) return;

    botonCrear.addEventListener('click', function () {
        // Leer los inputs del formulario existente en register.html
        // El orden en el HTML es: nombre → email → contraseña
        const nameInput     = document.querySelector('input[type="text"]');
        const emailInput    = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');

        const name     = nameInput     ? nameInput.value.trim()                   : '';
        const email    = emailInput    ? emailInput.value.trim().toLowerCase()     : '';
        const password = passwordInput ? passwordInput.value                       : '';

        // Limpiar error anterior
        clearError();

        // ── Validación 1: campos vacíos ──
        if (!name || !email || !password) {
            showError('Completa todos los campos.');
            return;
        }

        // ── Validación 2: formato de email básico ──
        if (!email.includes('@') || !email.includes('.')) {
            showError('Ingresa un correo electrónico válido.');
            return;
        }

        // ── Validación 3: contraseña mínima ──
        if (password.length < 6) {
            showError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        // ── Validación 4: email ya registrado ──
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        if (users.find(u => u.email.toLowerCase() === email)) {
            showError('Ya existe una cuenta con ese correo. Inicia sesión.');
            return;
        }

        // ── Registro exitoso ──
        // Crear objeto usuario con la estructura que lee script-profile.js
        const newUser = { name, email, password };

        // Agregar al array de todas las cuentas
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        // Establecer sesión activa inmediatamente (no necesita hacer login aparte)
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));

        // Redirigir a la página principal
        window.location.href = './intex.html';
    });
});

// ── Helpers de mensajes de error ──

function showError(msg) {
    let errEl = document.getElementById('register-error-msg');
    if (!errEl) {
        errEl = document.createElement('p');
        errEl.id = 'register-error-msg';
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

        // Insertar antes del botón de crear cuenta
        const btn = document.getElementById('btn-crear');
        if (btn && btn.parentNode) {
            btn.parentNode.insertBefore(errEl, btn);
        }
    }
    errEl.textContent   = msg;
    errEl.style.display = 'block';
}

function clearError() {
    const errEl = document.getElementById('register-error-msg');
    if (errEl) errEl.style.display = 'none';
}