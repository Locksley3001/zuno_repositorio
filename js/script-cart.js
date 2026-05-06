// script-cart.js
// =============================================
// Render y comportamiento de cart.html.
// Lee siempre desde localStorage mediante getCart(), no desde memoria local.
// =============================================

const selectedCartIds = new Set();

function formatPrice(value) {
    return `$${(Number(value) || 0).toFixed(2)}`;
}

function renderCart() {
    const cart = getCart();
    const cartLayout = document.getElementById('cart-layout');
    const cartList = document.getElementById('cart-list');
    const emptyState = document.getElementById('cart-empty');

    cartList.innerHTML = '';

    if (cart.length === 0) {
        selectedCartIds.clear();
        cartLayout.hidden = true;
        emptyState.hidden = false;
        updateSummary();
        return;
    }

    cartLayout.hidden = false;
    emptyState.hidden = true;

    // Render: cada producto se pinta con checkbox independiente para no obligar
    // a pagar todo el carrito.
    cart.forEach(product => {
        const item = document.createElement('article');
        item.className = 'cart-item';
        const isSelected = selectedCartIds.has(String(product.id));
        item.innerHTML = `
            <input class="cart-item-checkbox" type="checkbox" data-id="${product.id}" aria-label="Seleccionar ${product.title}" ${isSelected ? 'checked' : ''}>
            <img class="cart-item-image" src="${product.image}" alt="${product.title}" loading="lazy">
            <div class="cart-item-info">
                <h3 class="cart-item-title">${product.title}</h3>
                <p class="cart-item-category">${product.category}</p>
            </div>
            <div class="cart-item-price">${formatPrice(product.price)}</div>
            <button class="cart-remove-btn" type="button" data-id="${product.id}">Eliminar</button>
        `;

        cartList.appendChild(item);
    });

    updateSummary();
}

function updateSummary() {
    const cart = getCart();
    const selectedProducts = cart.filter(item => selectedCartIds.has(String(item.id)));
    const selectedCount = selectedProducts.length;

    // Total dinamico: solo suma los productos seleccionados por checkbox.
    const selectedTotal = selectedProducts.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

    document.getElementById('selected-count').textContent = selectedCount;
    document.getElementById('selected-total').textContent = formatPrice(selectedTotal);
    document.getElementById('btn-pay').disabled = selectedCount === 0;
}

function handleCartListClick(event) {
    const removeButton = event.target.closest('.cart-remove-btn');
    if (!removeButton) return;

    const id = removeButton.dataset.id;
    selectedCartIds.delete(String(id));
    removeFromCart(id);
    renderCart();
}

function handleCartSelection(event) {
    const checkbox = event.target.closest('.cart-item-checkbox');
    if (!checkbox) return;

    const id = String(checkbox.dataset.id);
    if (checkbox.checked) {
        selectedCartIds.add(id);
    } else {
        selectedCartIds.delete(id);
    }

    updateSummary();
}

function setupCartNavbarToggle() {
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
}

document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    setupCartNavbarToggle();

    document.getElementById('cart-list').addEventListener('click', handleCartListClick);
    document.getElementById('cart-list').addEventListener('change', handleCartSelection);

    document.getElementById('btn-pay').addEventListener('click', function() {
        const count = selectedCartIds.size;
        if (count === 0) return;
        alert(`Pago simulado para ${count} producto(s) seleccionado(s).`);
    });
});
