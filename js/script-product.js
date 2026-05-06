// script-product.js
// =============================================
// LÃ³gica para la pÃ¡gina de detalle de producto.
//
// ESTRUCTURA:
//   1. Mapa de categorÃ­as y constantes
//   2. Lectura de producto desde localStorage
//   3. Sistema de vistas y trending
//   4. Sistema de carrito (sin duplicados, con toggle)
//   5. Renderizado: breadcrumb
//   6. Renderizado: hero (imagen + info + botones)
//   7. Renderizado: descripciÃ³n
//   8. Renderizado: productos relacionados
//   9. Toast informativo
//  10. Modal de confirmaciÃ³n para eliminar del carrito
//  11. InicializaciÃ³n
// =============================================

// =============================================
// 1. CONSTANTES
// =============================================

const CATEGORY_MAP = {
    logos:    'Logos',
    marketing:'Marketing',
    social:   'Redes Sociales',
    web:      'Web Design',
    video:    'Video',
    ai:       'IA & ML',
    business: 'Negocios',
    creative: 'Creativo'
};

// Vistas necesarias para marcar un producto como Trending
const TRENDING_THRESHOLD = 4;

// MÃ¡ximo de productos relacionados a mostrar
const MAX_RELATED = 3;

// =============================================
// 2. LECTURA DE PRODUCTO DESDE LOCALSTORAGE
// =============================================

/**
 * getIdFromUrl()
 * Lee el parÃ¡metro ?id= de la URL.
 * Ej: product.html?id=1718123 â†’ 1718123 (number)
 * @returns {number|null}
 */
function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const raw    = params.get('id');
    if (!raw) return null;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? null : parsed;
}

function loadProducts() {
    const stored = localStorage.getItem('zuno-products');
    return stored ? JSON.parse(stored) : [];
}

function saveProducts(products) {
    localStorage.setItem('zuno-products', JSON.stringify(products));
}

function getProductById(id) {
    return loadProducts().find(p => p.id === id) || null;
}

// =============================================
// 3. SISTEMA DE VISTAS Y TRENDING
// =============================================

/**
 * incrementViews(productId)
 * Suma 1 vista al producto. Si alcanza TRENDING_THRESHOLD
 * activa trending = true y guarda el cambio.
 * @param {number} productId
 * @returns {Object|null} producto actualizado
 */
function incrementViews(productId) {
    const products = loadProducts();
    const index    = products.findIndex(p => p.id === productId);
    if (index === -1) return null;

    products[index].views = (products[index].views || 0) + 1;
    if (products[index].views >= TRENDING_THRESHOLD) {
        products[index].trending = true;
    }

    saveProducts(products);
    return products[index];
}

// =============================================
// 4. SISTEMA DE CARRITO
//
// REGLAS:
//   - Un producto solo puede estar UNA vez en el carrito (sin duplicados).
//   - El botÃ³n alterna entre "Agregar al carrito" y "Eliminar del carrito".
//   - Eliminar requiere confirmaciÃ³n via modal.
//   - Al cargar la pÃ¡gina el botÃ³n refleja el estado real del carrito.
//
// IDENTIFICACIÃ“N DE DUPLICADOS:
//   Cada Ã­tem se identifica por su campo `id` (nÃºmero Ãºnico Date.now()).
//   isInCart(id) hace un .some() sobre el array para detectar si ya existe.
//   addToCart() llama isInCart() antes de insertar: si devuelve true, no hace nada.
// =============================================

/**
 * loadCart()
 * Lee el carrito desde localStorage ('zuno-cart').
 * Estructura de cada Ã­tem: { id, title, price, category, image, quantity }
 * @returns {Array}
 */
// Codigo anterior (comentado)
// Este bloque se reemplaza porque la logica vivia solo en product.html,
// usaba quantity y no era una API reutilizable para todas las paginas.
// La nueva fuente global esta en script-cart-utils.js con estructura:
// [{ id, title, price, image, category }].
// function loadCart() {
//     const stored = localStorage.getItem('zuno-cart');
//     return stored ? JSON.parse(stored) : [];
// }
// function saveCart(cart) {
//     localStorage.setItem('zuno-cart', JSON.stringify(cart));
// }
// function isInCart(productId) {
//     return loadCart().some(item => item.id === productId);
// }
// function addToCart(product) {
//     if (isInCart(product.id)) return false;
//     const cart = loadCart();
//     cart.push({
//         id: product.id,
//         title: product.title,
//         price: product.price,
//         category: product.category,
//         image: product.image,
//         quantity: 1
//     });
//     saveCart(cart);
//     updateCartCount();
//     return true;
// }
// function removeFromCart(productId) {
//     const updated = loadCart().filter(item => item.id !== productId);
//     saveCart(updated);
//     updateCartCount();
// }
// function updateCartCount() {
//     const count = loadCart().length;
//     const badge = document.getElementById('cart-count');
//     if (badge) badge.textContent = count;
// }

// âœ… Nueva integracion global
// getCart/saveCart/addToCart/removeFromCart/isInCart/updateCartCount
// vienen de script-cart-utils.js, incluido antes de este archivo.
function loadCart() {
    return getCart();
}

// =============================================
// 5. RENDERIZADO: BREADCRUMB
// =============================================

function renderBreadcrumb(product) {
    const nav          = document.getElementById('pd-breadcrumb');
    const categoryName = CATEGORY_MAP[product.category] || product.category;
    const titleShort   = product.title.length > 40
        ? product.title.slice(0, 40) + 'â€¦'
        : product.title;

    nav.innerHTML = `
        <a href="./shop.html">Explorar</a>
        <span class="pd-breadcrumb-sep">â€º</span>
        <a href="./categories.html">${escapeHtml(categoryName)}</a>
        <span class="pd-breadcrumb-sep">â€º</span>
        <span class="pd-breadcrumb-current">${escapeHtml(titleShort)}</span>
    `;
}

// =============================================
// 6. RENDERIZADO: HERO (IMAGEN + INFO + BOTONES)
// =============================================

/**
 * renderHero(product)
 * Genera el layout dos columnas.
 * El botÃ³n del carrito se inicializa con el estado correcto
 * segÃºn isInCart() â€” asÃ­ al recargar la pÃ¡gina refleja
 * si el producto ya fue agregado en una sesiÃ³n anterior.
 *
 * ESTADO INICIAL DEL BOTÃ“N:
 *   - isInCart() â†’ true  â†’ muestra "Eliminar del carrito" (clase .in-cart)
 *   - isInCart() â†’ false â†’ muestra "Agregar al carrito"   (sin clase)
 */
function renderHero(product) {
    const hero         = document.getElementById('pd-hero');
    const categoryName = CATEGORY_MAP[product.category] || product.category;
    const price        = parseFloat(product.price).toFixed(2);
    // Nueva extensión visual: aiTool ya se guarda al crear productos desde seller.
    // Si el producto es antiguo y no tiene IA, el badge no se renderiza.
    const aiToolBadge = product.aiTool
        ? `<span class="pd-ai-badge">${escapeHtml(product.aiTool)}</span>`
        : '';

    // ESTADO INICIAL: verificar si ya estÃ¡ en el carrito al cargar la pÃ¡gina
    const inCart = isInCart(product.id);

    const trendingBadge = product.trending
        ? '<span class="pd-badge-trending">Trending</span>'
        : '';

    hero.innerHTML = `
        <!-- â”€â”€ COLUMNA IZQUIERDA: IMAGEN â”€â”€ -->
        <div class="pd-image-col">
            <div class="pd-image-wrapper">
                <img src="${product.image}" alt="${escapeHtml(product.title)}" id="pd-main-image"/>
                ${trendingBadge}
            </div>
        </div>

        <!-- â”€â”€ COLUMNA DERECHA: INFO â”€â”€ -->
        <div class="pd-info-col">
            <!-- Código anterior (comentado)
                 Antes solo se mostraba la categoría:
                 <span class="pd-category-badge">${escapeHtml(categoryName)}</span>
                 Se reemplaza por una fila de badges para alinear Categoría + IA. -->
            <div class="pd-meta-badges">
                <span class="pd-category-badge">${escapeHtml(categoryName)}</span>
                ${aiToolBadge}
            </div>
            <h1 class="pd-product-title">${escapeHtml(product.title)}</h1>
            <p class="pd-price">$${price}</p>
            <div class="pd-divider"></div>

            <div class="pd-actions">
                <!-- Comprar ahora (simulaciÃ³n) -->
                <button class="pd-btn-buy" id="btn-buy-now" aria-label="Comprar ahora">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Comprar ahora
                </button>

                <!--
                    BOTÃ“N TOGGLE DEL CARRITO
                    Estado inicial determinado por isInCart() arriba.
                    - Sin .in-cart  â†’ "Agregar al carrito"   (fondo glass neutro)
                    - Con .in-cart  â†’ "Eliminar del carrito" (fondo rojo suave)
                    attachButtonEvents() se encarga de gestionar el toggle en cada click.
                -->
                <button
                    class="pd-btn-cart ${inCart ? 'in-cart' : ''}"
                    id="btn-add-cart"
                    aria-label="${inCart ? 'Eliminar del carrito' : 'Agregar al carrito'}"
                >
                    ${inCart ? cartBtnRemoveHtml() : cartBtnAddHtml()}
                </button>
            </div>

            <p class="pd-guarantee">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-1.041-.141-2.05-.382-3.016z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Acceso inmediato tras la compra
            </p>
        </div>
    `;

    attachButtonEvents(product);
}

/**
 * cartBtnAddHtml()
 * HTML interno del botÃ³n en estado "Agregar al carrito".
 * Centralizado aquÃ­ para no repetirlo en varios lugares.
 */
function cartBtnAddHtml() {
    return `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 22C7.89543 22 7 21.1046 7 20V8C7 6.89543 7.89543 6 9 6H15C16.1046 6 17 6.89543 17 8V20C17 21.1046 16.1046 22 15 22H9Z" stroke="currentColor" stroke-width="2"/>
            <path d="M7 6V4C7 2.89543 7.89543 2 9 2H15C16.1046 2 17 2.89543 17 4V6" stroke="currentColor" stroke-width="2"/>
            <circle cx="9.5" cy="20.5" r="0.5" fill="currentColor"/>
            <circle cx="14.5" cy="20.5" r="0.5" fill="currentColor"/>
        </svg>
        Agregar al carrito
    `;
}

/**
 * cartBtnRemoveHtml()
 * HTML interno del botÃ³n en estado "Eliminar del carrito".
 */
function cartBtnRemoveHtml() {
    return `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 6H5H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Eliminar del carrito
    `;
}

/**
 * attachButtonEvents(product)
 * Registra los handlers de los botones despuÃ©s de inyectar el HTML.
 *
 * CÃ“MO FUNCIONA EL TOGGLE:
 *   Cada click en el botÃ³n del carrito lee el estado actual con isInCart().
 *   - Si NO estÃ¡ en el carrito â†’ addToCart() + cambiar a estado "in-cart"
 *   - Si SÃ estÃ¡ en el carrito â†’ mostrar modal de confirmaciÃ³n.
 *       Â· Confirmar â†’ removeFromCart() + cambiar a estado normal
 *       Â· Cancelar  â†’ no hacer nada
 *
 * @param {Object} product
 */
function attachButtonEvents(product) {

    // â”€â”€ COMPRAR AHORA (simulaciÃ³n) â”€â”€
    document.getElementById('btn-buy-now').addEventListener('click', () => {
        console.log('[Zuno] Compra iniciada:', product.id, product.title);
        showToast(`Redirigiendo al checkoutâ€¦`, 'buy');
    });

    // â”€â”€ BOTÃ“N CARRITO: TOGGLE â”€â”€
    document.getElementById('btn-add-cart').addEventListener('click', function () {
        const btn = this;

        if (!isInCart(product.id)) {
            // â”€â”€ ESTADO: no estÃ¡ en carrito â†’ AGREGAR â”€â”€
            addToCart(product);
            setCartBtnState(btn, 'in-cart');
            showToast(`"${product.title}" agregado al carrito`, 'cart');

        } else {
            // â”€â”€ ESTADO: ya estÃ¡ en carrito â†’ pedir CONFIRMACIÃ“N antes de eliminar â”€â”€
            showRemoveConfirmModal(product.title, () => {
                // CALLBACK: usuario confirmÃ³ â†’ eliminar del carrito y cambiar botÃ³n
                removeFromCart(product.id);
                setCartBtnState(btn, 'default');
                showToast(`"${product.title}" eliminado del carrito`, 'remove');
            });
            // Si cancela: el callback nunca se ejecuta, el botÃ³n no cambia
        }
    });
}

/**
 * setCartBtnState(btn, state)
 * Actualiza el HTML y las clases del botÃ³n del carrito.
 *
 * CÃ“MO FUNCIONA EL TOGGLE DEL BOTÃ“N:
 *   state 'in-cart'  â†’ aÃ±ade clase .in-cart + texto "Eliminar del carrito"
 *   state 'default'  â†’ quita clase .in-cart + texto "Agregar al carrito"
 *
 * @param {HTMLElement} btn
 * @param {'in-cart'|'default'} state
 */
function setCartBtnState(btn, state) {
    if (state === 'in-cart') {
        btn.classList.add('in-cart');
        btn.setAttribute('aria-label', 'Eliminar del carrito');
        btn.innerHTML = cartBtnRemoveHtml();
    } else {
        btn.classList.remove('in-cart');
        btn.setAttribute('aria-label', 'Agregar al carrito');
        btn.innerHTML = cartBtnAddHtml();
    }
}

// =============================================
// 7. RENDERIZADO: DESCRIPCIÃ“N
// =============================================

function renderDescription(product) {
    document.getElementById('pd-description').textContent = product.description;
}

// =============================================
// 8. RENDERIZADO: PRODUCTOS RELACIONADOS
// =============================================

function renderRelated(currentProduct) {
    const all     = loadProducts();
    const related = all
        .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
        .slice(0, MAX_RELATED);

    const section = document.getElementById('pd-related-section');
    const grid    = document.getElementById('pd-related-grid');

    if (related.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    grid.innerHTML = related.map((p, i) => {
        const categoryName  = CATEGORY_MAP[p.category] || p.category;
        const price         = parseFloat(p.price).toFixed(2);
        const trendingBadge = p.trending ? '<span class="pd-related-badge">Trending</span>' : '';
        const aiToolBadge   = p.aiTool ? `<span class="pd-related-ai-badge">${escapeHtml(p.aiTool)}</span>` : '';

        return `
            <a href="./product.html?id=${p.id}" class="pd-related-card" style="animation-delay:${i * 0.1}s">
                <div class="pd-related-image">
                    <img src="${p.image}" alt="${escapeHtml(p.title)}" loading="lazy"/>
                    ${trendingBadge}
                </div>
                <div class="pd-related-body">
                    <!-- Código anterior (comentado)
                         <span class="pd-related-category">${escapeHtml(categoryName)}</span>
                         Se agrupa con IA para mantener consistencia en tarjetas relacionadas. -->
                    <div class="pd-related-meta">
                        <span class="pd-related-category">${escapeHtml(categoryName)}</span>
                        ${aiToolBadge}
                    </div>
                    <h3 class="pd-related-title">${escapeHtml(p.title)}</h3>
                    <p class="pd-related-price">$${price}</p>
                </div>
            </a>
        `;
    }).join('');
}

// =============================================
// 9. TOAST INFORMATIVO
// NotificaciÃ³n breve, no interactiva, auto-dismiss.
// Tipos: 'cart' (verde), 'buy' (azul), 'remove' (rojo suave)
// =============================================

let toastTimeout = null;

/**
 * showToast(message, type)
 * Muestra la notificaciÃ³n temporal en la esquina inferior derecha.
 * Se oculta solo tras 3 segundos.
 * @param {string} message
 * @param {'cart'|'buy'|'remove'} type
 */
function showToast(message, type) {
    const toast = document.getElementById('pd-toast');

    const icons = {
        cart:   `<svg class="pd-toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        buy:    `<svg class="pd-toast-icon pd-toast-icon--blue" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        remove: `<svg class="pd-toast-icon pd-toast-icon--red" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
    };

    toast.innerHTML = `${icons[type] || icons.cart}<span>${escapeHtml(message)}</span>`;
    toast.classList.add('pd-toast--visible');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('pd-toast--visible'), 3000);
}

// =============================================
// 10. MODAL DE CONFIRMACIÃ“N â€” ELIMINAR DEL CARRITO
//
// CÃ“MO FUNCIONA LA CONFIRMACIÃ“N:
//   showRemoveConfirmModal() inyecta el modal en el DOM sobre un overlay oscuro.
//   - BotÃ³n "Confirmar" â†’ ejecuta onConfirm() y cierra el modal
//   - BotÃ³n "Cancelar"  â†’ solo cierra el modal, sin ejecutar nada
//   El modal se elimina del DOM al cerrarse para no acumular elementos.
// =============================================

/**
 * showRemoveConfirmModal(productTitle, onConfirm)
 * Muestra un modal de confirmaciÃ³n antes de eliminar del carrito.
 * @param {string}   productTitle - nombre del producto (para mostrar en el mensaje)
 * @param {Function} onConfirm    - callback que se ejecuta SOLO si el usuario confirma
 */
function showRemoveConfirmModal(productTitle, onConfirm) {
    // Evitar modales duplicados
    const existing = document.getElementById('pd-confirm-modal');
    if (existing) existing.remove();

    // Crear overlay + modal
    const overlay = document.createElement('div');
    overlay.id        = 'pd-confirm-modal';
    overlay.className = 'pd-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'pd-modal-title');

    overlay.innerHTML = `
        <div class="pd-modal-box">
            <!-- Ãcono de advertencia -->
            <div class="pd-modal-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6H5H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>

            <!-- TÃ­tulo y mensaje -->
            <h3 class="pd-modal-title" id="pd-modal-title">Eliminar del carrito</h3>
            <p class="pd-modal-message">
                Â¿EstÃ¡s seguro de eliminar
                <strong>"${escapeHtml(productTitle)}"</strong>
                del carrito?
            </p>

            <!-- Acciones -->
            <div class="pd-modal-actions">
                <!-- Cancelar: cierra el modal sin hacer nada -->
                <button class="pd-modal-btn pd-modal-btn--cancel" id="pd-modal-cancel">
                    Cancelar
                </button>
                <!-- Confirmar: ejecuta el callback y cierra -->
                <button class="pd-modal-btn pd-modal-btn--confirm" id="pd-modal-confirm">
                    Eliminar
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Forzar reflow para que la animaciÃ³n de entrada funcione
    requestAnimationFrame(() => overlay.classList.add('pd-modal-overlay--visible'));

    /**
     * closeModal()
     * Elimina el overlay del DOM con animaciÃ³n de salida.
     */
    function closeModal() {
        overlay.classList.remove('pd-modal-overlay--visible');
        // Esperar que termine la transiciÃ³n CSS antes de remover del DOM
        overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    }

    // â”€â”€ CONFIRMAR: ejecutar callback y cerrar â”€â”€
    document.getElementById('pd-modal-confirm').addEventListener('click', () => {
        closeModal();
        onConfirm(); // SOLO se ejecuta al confirmar, nunca al cancelar
    });

    // â”€â”€ CANCELAR: solo cerrar, sin callback â”€â”€
    document.getElementById('pd-modal-cancel').addEventListener('click', closeModal);

    // Cerrar tambiÃ©n al hacer click en el overlay fuera de la caja
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    // Cerrar con Escape
    function onKeyDown(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', onKeyDown);
        }
    }
    document.addEventListener('keydown', onKeyDown);

    // Focus en el botÃ³n cancelar por accesibilidad (acciÃ³n segura por defecto)
    setTimeout(() => {
        const cancelBtn = document.getElementById('pd-modal-cancel');
        if (cancelBtn) cancelBtn.focus();
    }, 50);
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
// 11. INICIALIZACIÃ“N
// =============================================

document.addEventListener('DOMContentLoaded', function () {
    const loadingEl = document.getElementById('loading-state');
    const errorEl   = document.getElementById('error-state');
    const mainEl    = document.getElementById('product-main');

    // 1. Obtener ID del producto desde la URL
    const productId = getIdFromUrl();

    if (!productId) {
        loadingEl.style.display = 'none';
        errorEl.style.display   = 'flex';
        return;
    }

    // 2. Incrementar vistas (activa trending si alcanza el umbral)
    const product = incrementViews(productId);

    if (!product) {
        loadingEl.style.display = 'none';
        errorEl.style.display   = 'flex';
        return;
    }

    // 3. Mostrar contenido
    loadingEl.style.display = 'none';
    mainEl.style.display    = 'block';

    // 4. TÃ­tulo de la pestaÃ±a
    document.title = `${product.title} Â· Zuno`;

    // 5. Renderizar secciones
    renderBreadcrumb(product);
    renderHero(product);       // â† aquÃ­ se inicializa el botÃ³n con isInCart()
    renderDescription(product);
    renderRelated(product);

    // 6. Sincronizar badge del carrito en el navbar
    updateCartCount();
});

// Toggle mobile del navbar: mantiene el menu dentro del flujo y anima el icono a X.
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navbar = document.querySelector('.navbar-glass');
    const navLinks = document.querySelector('.nav-links');

    if (!navToggle || !navbar || !navLinks) return;

    navToggle.addEventListener('click', function() {
        const isOpen = navbar.classList.toggle('open');
        navToggle.classList.toggle('active', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menu' : 'Abrir menu');
    });

    navLinks.addEventListener('click', function(event) {
        if (!event.target.closest('a')) return;
        navbar.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menu');
    });
});
