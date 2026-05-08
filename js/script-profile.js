// script-profile.js
// =============================================
// Lógica para la página de perfil de usuario.
//
// ESTRUCTURA:
//   1. Constantes de localStorage
//   2. Leer / guardar usuario
//   3. Renderizado de información
//   4. Cambio de contraseña
//   5. Recuperar contraseña (simulación)
//   6. Cerrar sesión
//   7. Toast
//   8. Botones "ojo" (mostrar/ocultar contraseña)
//   9. Navbar mobile toggle
//  10. Inicialización
//
// ESTRUCTURA DEL USUARIO EN LOCALSTORAGE:
//   localStorage['zuno-user'] = JSON.stringify({
//     name:     string,   ← nombre completo
//     email:    string,   ← correo electrónico
//     password: string    ← contraseña (en producción: hash)
//   })
//
// PARA MODIFICAR:
//   - Clave de storage:      cambiar USER_KEY
//   - Mínimo de contraseña:  cambiar MIN_PWD_LENGTH
//   - Redirección de logout: cambiar LOGOUT_REDIRECT
// =============================================

// =============================================
// 1. CONSTANTES
// =============================================

// Clave bajo la que se guarda el usuario en localStorage.
// Debe coincidir con la que use login.html y register.html.
const USER_KEY = 'zuno-user';

// Longitud mínima aceptada para la nueva contraseña
const MIN_PWD_LENGTH = 6;

// Destino de la redirección al cerrar sesión
const LOGOUT_REDIRECT = './intex.html';

// =============================================
// 2. LEER / GUARDAR USUARIO
// =============================================

/**
 * getUser()
 * CÓMO SE OBTIENE EL USUARIO:
 *   Lee la clave USER_KEY de localStorage y parsea el JSON.
 *   Si no existe o el JSON está corrupto, devuelve null.
 *   Un null indica que no hay sesión activa.
 * @returns {{ name: string, email: string, password: string }|null}
 */
function getUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        // JSON corrupto: limpiar y tratar como sin sesión
        localStorage.removeItem(USER_KEY);
        return null;
    }
}

/**
 * saveUser(user)
 * Persiste el objeto usuario actualizado en localStorage.
 * Se llama solo al cambiar la contraseña, para mantener los
 * demás campos (name, email) intactos.
 * @param {{ name: string, email: string, password: string }} user
 */
function saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// =============================================
// 3. RENDERIZADO DE INFORMACIÓN
// =============================================

/**
 * renderUserInfo(user)
 * Inyecta los datos del usuario en los elementos del DOM.
 *
 * AVATAR: toma las primeras letras del nombre completo.
 *   "Juan Pérez" → "JP"
 *   Si el nombre tiene solo una palabra, usa la primera letra.
 *
 * CONTRASEÑA: siempre se muestra como "••••••••" en la sección
 * de información. Nunca se expone el valor real en el UI.
 *
 * @param {{ name: string, email: string }} user
 */
function renderUserInfo(user) {
    // ── Avatar con iniciales ──
    const initials  = getInitials(user.name);
    const avatarEl  = document.getElementById('pf-avatar');
    if (avatarEl) avatarEl.textContent = initials;

    // ── Hero: nombre y email ──
    const usernameEl = document.getElementById('pf-username');
    const emailEl    = document.getElementById('pf-useremail');
    if (usernameEl) usernameEl.textContent = user.name  || '—';
    if (emailEl)    emailEl.textContent    = user.email || '—';

    // ── Sección de información ──
    const infoName  = document.getElementById('pf-info-name');
    const infoEmail = document.getElementById('pf-info-email');
    if (infoName)  infoName.textContent  = user.name  || '—';
    if (infoEmail) infoEmail.textContent = user.email || '—';

    // La contraseña se muestra como "••••••••" directamente en el HTML
    // (campo estático .pf-field-password) y nunca se modifica desde JS.

    // ── Título de la pestaña ──
    document.title = `${user.name} · Perfil · Zuno`;
}

/**
 * getInitials(name)
 * Extrae hasta 2 letras iniciales del nombre.
 * "Ana García" → "AG", "Zuno" → "Z"
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// =============================================
// 4. CAMBIO DE CONTRASEÑA
//
// VALIDACIONES (en orden):
//   1. Los tres campos deben tener valor.
//   2. La contraseña actual debe coincidir con la guardada.
//   3. La nueva contraseña debe tener al menos MIN_PWD_LENGTH caracteres.
//   4. La nueva contraseña debe ser diferente a la actual.
//   5. La confirmación debe coincidir con la nueva contraseña.
//
// CÓMO SE ACTUALIZA:
//   Se llama saveUser() con el objeto usuario modificado solo
//   en el campo `password`. El ID/nombre/email no cambian.
// =============================================

/**
 * setupPasswordForm(user)
 * Registra el submit del formulario de cambio de contraseña.
 * Recibe el objeto usuario para poder comparar la contraseña actual.
 *
 * El objeto `user` es mutable desde esta función:
 * si el cambio es exitoso, user.password se actualiza
 * y luego se persiste con saveUser().
 *
 * @param {{ name: string, email: string, password: string }} user
 */
function setupPasswordForm(user) {
    const form    = document.getElementById('pf-pwd-form');
    const errEl   = document.getElementById('pf-pwd-error');
    const succEl  = document.getElementById('pf-pwd-success');

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const currentPwd = document.getElementById('pf-current-pwd').value;
        const newPwd     = document.getElementById('pf-new-pwd').value;
        const confirmPwd = document.getElementById('pf-confirm-pwd').value;

        // Ocultar mensajes anteriores
        hideMsg(errEl);
        hideMsg(succEl);

        // ── Validación 1: campos vacíos ──
        if (!currentPwd || !newPwd || !confirmPwd) {
            return showMsg(errEl, 'Completa todos los campos de contraseña.');
        }

        // ── Validación 2: contraseña actual correcta ──
        // Comparación directa (en producción se compararía el hash).
        if (currentPwd !== user.password) {
            return showMsg(errEl, 'La contraseña actual no es correcta.');
        }

        // ── Validación 3: longitud mínima ──
        if (newPwd.length < MIN_PWD_LENGTH) {
            return showMsg(errEl, `La nueva contraseña debe tener al menos ${MIN_PWD_LENGTH} caracteres.`);
        }

        // ── Validación 4: nueva ≠ actual ──
        if (newPwd === currentPwd) {
            return showMsg(errEl, 'La nueva contraseña debe ser diferente a la actual.');
        }

        // ── Validación 5: nueva == confirmación ──
        if (newPwd !== confirmPwd) {
            return showMsg(errEl, 'La nueva contraseña y la confirmación no coinciden.');
        }

        // ── Todo válido: actualizar en localStorage ──
        user.password = newPwd;
        saveUser(user);

        // Limpiar campos del formulario
        form.reset();

        // Mostrar mensaje de éxito
        showMsg(succEl, 'Contraseña actualizada correctamente.');

        // Toast global de confirmación
        showToast('Contraseña cambiada', 'success');
    });
}

/** showMsg(el, text) — muestra el elemento de mensaje con el texto dado */
function showMsg(el, text) {
    if (!el) return;
    el.textContent = text;
    el.style.display = 'block';
}

/** hideMsg(el) — oculta el elemento de mensaje */
function hideMsg(el) {
    if (!el) return;
    el.style.display = 'none';
    el.textContent   = '';
}

// =============================================
// 5. RECUPERAR CONTRASEÑA (SIMULACIÓN)
// En producción: enviar un email real de recuperación.
// Por ahora: mostrar una alerta informativa.
// =============================================

function setupForgotPassword() {
    const btn = document.getElementById('pf-forgot-btn');
    if (!btn) return;

    btn.addEventListener('click', function () {
        // Simulación: en producción se llamaría a un endpoint de recuperación
        showToast('📧 Se enviará un correo de recuperación a tu email registrado.', 'info');
    });
}

// =============================================
// 6. CERRAR SESIÓN
//
// CÓMO FUNCIONA EL LOGOUT:
//   1. Elimina la clave USER_KEY de localStorage.
//      Esto borra el objeto {name, email, password} del usuario activo.
//   2. Redirige a la página de inicio (LOGOUT_REDIRECT).
//   La próxima vez que se abra profile.html, getUser() devolverá
//   null y se mostrará el estado "sin sesión".
// =============================================

function setupLogout() {
    const btn = document.getElementById('pf-logout-btn');
    if (!btn) return;

    btn.addEventListener('click', function () {
        // Confirmación antes de cerrar sesión
        const confirmed = confirm('¿Cerrar sesión? Se eliminará tu información de este dispositivo.');
        if (!confirmed) return;

        // Eliminar usuario activo de localStorage
        localStorage.removeItem(USER_KEY);

        // Redirigir a la página de inicio
        window.location.href = LOGOUT_REDIRECT;
    });
}

// =============================================
// 7. TOAST DE CONFIRMACIÓN
// =============================================

let pfToastTimeout = null;

/**
 * showToast(message, type)
 * Muestra la notificación temporal.
 * @param {string} message
 * @param {'success'|'info'|'error'} type
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('pf-toast');
    if (!toast) return;

    const icons = {
        success: `<svg class="pf-toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        info:    `<svg class="pf-toast-icon" style="color:#a8d8ff" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
        error:   `<svg class="pf-toast-icon pf-toast-icon--red" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
    };

    toast.innerHTML = `${icons[type] || icons.success}<span>${escapeHtml(message)}</span>`;
    toast.classList.add('pf-toast--visible');

    if (pfToastTimeout) clearTimeout(pfToastTimeout);
    pfToastTimeout = setTimeout(() => toast.classList.remove('pf-toast--visible'), 3500);
}

// =============================================
// 8. BOTONES "OJO" — MOSTRAR/OCULTAR CONTRASEÑA
// =============================================

/**
 * setupPasswordToggles()
 * Cada botón .pf-toggle-pwd tiene data-target con el ID del input.
 * Al hacer click alterna type="password" ↔ type="text".
 */
function setupPasswordToggles() {
    document.querySelectorAll('.pf-toggle-pwd').forEach(btn => {
        btn.addEventListener('click', function () {
            const targetId = this.dataset.target;
            const input    = document.getElementById(targetId);
            if (!input) return;

            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';

            // Cambiar el ícono: ojo abierto ↔ ojo tachado
            this.innerHTML = isHidden
                ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20C7 20 2.73 16.39 1 12c.78-1.97 2.08-3.68 3.71-4.97M6.53 6.53A9.95 9.95 0 0112 4C17 4 21.27 7.61 23 12a10.05 10.05 0 01-4.13 5.07M1 1L23 23" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
                : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg>`;

            this.setAttribute('aria-label', isHidden ? 'Ocultar contraseña' : 'Mostrar contraseña');
        });
    });
}

// =============================================
// HELPER: escape XSS
// =============================================

function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
}

// =============================================
// 9. NAVBAR MOBILE TOGGLE
// =============================================

function setupNavbarToggle() {
    const navToggle = document.querySelector('.nav-toggle');
    const navbar    = document.querySelector('.navbar-glass');
    const navLinks  = document.querySelector('.nav-links');

    if (!navToggle || !navbar || !navLinks) return;

    navToggle.addEventListener('click', function () {
        const isOpen = navbar.classList.toggle('open');
        navToggle.classList.toggle('active', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    navLinks.addEventListener('click', function (e) {
        if (!e.target.closest('a')) return;
        navbar.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menú');
    });
}

// =============================================
// 10. INICIALIZACIÓN
// =============================================

document.addEventListener('DOMContentLoaded', function () {

    // Navbar global: se inicializa antes de validar sesion porque profile.html tambien debe conservar navegacion si no hay usuario activo.
    setupNavbarToggle();

    const loadingEl = document.getElementById('pf-loading');
    const noUserEl  = document.getElementById('pf-no-user');
    const mainEl    = document.getElementById('pf-main');

    // ── PASO 1: Leer usuario desde localStorage ──
    const user = getUser();

    // ── PASO 2: Mostrar estado correcto ──
    loadingEl.style.display = 'none';

    if (!user) {
        // Sin sesión: mostrar pantalla de "no has iniciado sesión"
        noUserEl.style.display = 'flex';
        return;
    }

    // Con sesión: mostrar el perfil completo
    mainEl.style.display = 'block';

    // ── PASO 3: Renderizar información del usuario ──
    renderUserInfo(user);

    // ── PASO 4: Configurar formulario de cambio de contraseña ──
    // Se pasa el objeto `user` para poder comparar y actualizar la contraseña
    setupPasswordForm(user);

    // ── PASO 5: Configurar enlace de recuperación ──
    setupForgotPassword();

    // ── PASO 6: Configurar cierre de sesión ──
    setupLogout();

    // ── PASO 7: Configurar botones "ojo" ──
    setupPasswordToggles();
});
