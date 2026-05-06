// script-cart-utils.js
// =============================================
// Fuente unica y global del carrito Zuno.
// localStorage permite que el carrito persista al navegar entre paginas.
// Estructura persistida:
// [{ id, title, price, image, category }]
// =============================================

const ZUNO_CART_STORAGE_KEY = 'zuno-cart';

function normalizeCartItem(item) {
    return {
        id: item.id,
        title: item.title,
        price: Number(item.price) || 0,
        image: item.image || '',
        category: item.category || ''
    };
}

function getCart() {
    const stored = localStorage.getItem(ZUNO_CART_STORAGE_KEY);
    if (!stored) return [];

    try {
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return [];

        // Normaliza datos viejos que podian traer quantity u otros campos.
        const normalizedCart = parsed
            .filter(item => item && item.id !== undefined)
            .map(normalizeCartItem);

        // Evita duplicados heredados de implementaciones antiguas.
        return normalizedCart.filter((item, index, array) =>
            array.findIndex(current => String(current.id) === String(item.id)) === index
        );
    } catch (error) {
        console.warn('[Zuno] Carrito invalido en localStorage:', error);
        return [];
    }
}

function saveCart(cart) {
    // localStorage es la unica fuente de verdad para que todas las paginas compartan estado.
    const normalizedCart = Array.isArray(cart) ? cart.map(normalizeCartItem) : [];
    localStorage.setItem(ZUNO_CART_STORAGE_KEY, JSON.stringify(normalizedCart));
    updateCartCount();
}

function isInCart(id) {
    return getCart().some(item => String(item.id) === String(id));
}

function addToCart(product) {
    if (!product || product.id === undefined) return false;
    if (isInCart(product.id)) return false;

    const cart = getCart();
    cart.push(normalizeCartItem(product));
    saveCart(cart);
    return true;
}

function removeFromCart(id) {
    const updatedCart = getCart().filter(item => String(item.id) !== String(id));
    saveCart(updatedCart);
}

function updateCartCount() {
    const count = getCart().length;
    document.querySelectorAll('.cart-count').forEach(badge => {
        badge.textContent = count;
    });
}

function goToCartPage() {
    window.location.href = './cart.html';
}

document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();

    // El icono del carrito del navbar siempre abre la vista persistente del carrito.
    document.querySelectorAll('.cart-btn').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            goToCartPage();
        });
    });
});
