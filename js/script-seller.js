// script-seller.js - Lógica para la página de vendedor
// =============================================
// ESTRUCTURA GENERAL:
//   1. Categorías y datos
//   2. Funciones de localStorage (carga/guardado)
//   3. Renderizado del grid de productos
//   4. Lógica del formulario (crear producto)
//   5. Lógica de eliminación
//   6. Control de visibilidad del formulario
//   7. Inicialización (DOMContentLoaded)
// =============================================

// =============================================
// 1. DATOS: CATEGORÍAS
// Debe coincidir con script-shop.js para que los
// productos sean reconocidos en toda la plataforma
// =============================================
const categories = [
    { id: 'logos',     name: 'Logos' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'social',    name: 'Redes Sociales' },
    { id: 'web',       name: 'Web Design' },
    { id: 'video',     name: 'Video' },
    { id: 'ai',        name: 'IA & ML' },
    { id: 'business',  name: 'Negocios' },
    { id: 'creative',  name: 'Creativo' }
];

// IA disponibles para el formulario.
// Para agregar nuevas IA en el futuro, sumar un nuevo string a este array.
const aiTools = [
    'ChatGPT',
    'Claude',
    'Gemini',
    'Midjourney',
    'DALL·E'
];

// Mapa rápido id -> nombre para renderizar tarjetas
const CATEGORY_MAP = categories.reduce((map, cat) => {
    map[cat.id] = cat.name;
    return map;
}, {});

// =============================================
// 2. PERSISTENCIA: LOCALSTORAGE
// =============================================

function loadProducts() {
    const stored = localStorage.getItem('zuno-products');
    return stored ? JSON.parse(stored) : [];
}

function saveProducts(products) {
    localStorage.setItem('zuno-products', JSON.stringify(products));
}

// =============================================
// 3. RENDERIZADO DEL GRID
// Botón "Ver" redirige a product-stats.html?id=ID
// =============================================

function renderProductGrid() {
    const products   = loadProducts();
    const grid       = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');
    const countBadge = document.getElementById('product-count');

    const n = products.length;
    countBadge.textContent = n === 1 ? '1 producto' : `${n} productos`;

    if (n === 0) {
        emptyState.style.display = 'flex';
        grid.style.display       = 'none';
        grid.innerHTML           = '';
        return;
    }

    emptyState.style.display = 'none';
    grid.style.display       = 'grid';

    grid.innerHTML = products.map((product, index) => {
        const categoryName   = CATEGORY_MAP[product.category] || product.category;
        const trendingBadge  = product.trending ? '<span class="badge-trending">Trending</span>' : '';
        const priceFormatted = parseFloat(product.price).toFixed(2);
        const animationDelay = `${index * 0.07}s`;

        // URL de estadísticas del panel de vendedor
        const statsUrl  = `./product-stats.html?id=${product.id}`;
        // URL de detalle público del producto (misma pestaña)
        const detailUrl = `./product.html?id=${product.id}`;

        return `
            <article class="product-card-seller" data-id="${product.id}" style="animation-delay:${animationDelay}">
                <a href="${detailUrl}" class="product-card-image-link" aria-label="Ver detalle de ${escapeHtml(product.title)}">
                    <div class="product-card-image">
                        <img src="${product.image}" alt="${escapeHtml(product.title)}" loading="lazy"/>
                        ${trendingBadge}
                    </div>
                </a>
                <div class="product-card-body">
                    <span class="product-card-category">${escapeHtml(categoryName)}</span>
                    <a href="${detailUrl}" class="product-card-title-link"><h3 class="product-card-title">${escapeHtml(product.title)}</h3></a>
                    <p class="product-card-price">$${priceFormatted}</p>
                </div>
                <div class="product-card-actions">
                    <!-- Ver: navega a la página de estadísticas del producto (misma pestaña) -->
                    <a href="${statsUrl}" class="btn-view-product" aria-label="Ver estadísticas">Ver</a>
                    <!-- Editar: placeholder -->
                    <button class="btn-edit-product" onclick="editProduct(${product.id})" aria-label="Editar">Editar</button>
                    <!-- Eliminar: funcional -->
                    <button class="btn-delete-product" onclick="deleteProduct(${product.id})" aria-label="Eliminar">Eliminar</button>
                </div>
            </article>
        `;
    }).join('');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// =============================================
// 4. FORMULARIO: CREAR PRODUCTO
// =============================================

function populateCategories() {
    const dropdown = document.querySelector('.custom-select[data-target="product-category"]');
    if (!dropdown) return;

    // Código anterior (comentado):
    // const select = document.getElementById('product-category');
    // categories.forEach(cat => {
    //     const option = document.createElement('option');
    //     option.value = cat.id;
    //     option.textContent = cat.name;
    //     select.appendChild(option);
    // });
    // Se reemplaza porque el <select> nativo no permite estilizar de forma
    // consistente el panel de opciones entre navegadores.
    renderCustomDropdownOptions(dropdown, categories.map(cat => ({
        value: cat.id,
        label: cat.name
    })));
}

function populateAiTools() {
    const dropdown = document.querySelector('.custom-select[data-target="product-ai"]');
    if (!dropdown) return;

    // Las opciones se generan desde aiTools para que el campo sea escalable.
    // Para sumar nuevas IA, agrega el nombre en el array aiTools.
    renderCustomDropdownOptions(dropdown, aiTools.map(tool => ({
        value: tool,
        label: tool
    })));
}

function renderCustomDropdownOptions(dropdown, options) {
    const list = dropdown.querySelector('.select-options');
    if (!list) return;

    list.innerHTML = '';
    options.forEach(optionData => {
        const option = document.createElement('li');
        option.className = 'select-option';
        option.dataset.value = optionData.value;
        option.setAttribute('role', 'option');
        option.textContent = optionData.label;
        list.appendChild(option);
    });
}

function setupCustomDropdowns() {
    const dropdowns = document.querySelectorAll('.custom-select');

    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('.select-selected');
        const list = dropdown.querySelector('.select-options');
        const targetInput = document.getElementById(dropdown.dataset.target);

        if (!button || !list || !targetInput) return;

        // El button abre/cierra el panel custom; el input hidden guarda
        // el valor real que usa la validación y el submit del formulario.
        button.addEventListener('click', function() {
            const willOpen = !dropdown.classList.contains('open');
            closeCustomDropdowns();
            dropdown.classList.toggle('open', willOpen);
            button.setAttribute('aria-expanded', String(willOpen));
        });

        list.addEventListener('click', function(event) {
            const option = event.target.closest('.select-option');
            if (!option) return;

            targetInput.value = option.dataset.value;
            button.textContent = option.textContent;
            list.querySelectorAll('.select-option').forEach(item => {
                item.classList.toggle('selected', item === option);
                item.setAttribute('aria-selected', String(item === option));
            });
            dropdown.classList.remove('open');
            button.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('click', function(event) {
        if (!event.target.closest('.custom-select')) {
            closeCustomDropdowns();
        }
    });
}

function closeCustomDropdowns() {
    document.querySelectorAll('.custom-select.open').forEach(dropdown => {
        dropdown.classList.remove('open');
        const button = dropdown.querySelector('.select-selected');
        if (button) button.setAttribute('aria-expanded', 'false');
    });
}

function setupImageInput() {
    const input = document.getElementById('product-image');
    const button = document.getElementById('file-select-btn');
    const fileName = document.getElementById('file-name');
    const preview = document.getElementById('image-preview');

    if (!input || !button || !fileName || !preview) return;

    // El input nativo queda oculto; este botón conserva la estética del sistema
    // y dispara el selector real de archivos.
    button.addEventListener('click', function() {
        input.click();
    });

    input.addEventListener('change', function() {
        const file = input.files[0];
        fileName.textContent = file ? file.name : 'Ninguna imagen seleccionada';

        if (!file) {
            preview.hidden = true;
            preview.removeAttribute('src');
            return;
        }

        preview.src = URL.createObjectURL(file);
        preview.hidden = false;
    });
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const imageFile   = document.getElementById('product-image').files[0];
    const title       = document.getElementById('product-title').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const price       = parseFloat(document.getElementById('product-price').value);
    const category    = document.getElementById('product-category').value;
    const aiTool      = document.getElementById('product-ai')?.value || '';

    // Código anterior (comentado):
    // if (!imageFile || !title || !description || isNaN(price) || price < 0 || !category) {
    //     alert('Por favor, completa todos los campos correctamente.');
    //     return;
    // }
    // Se reemplaza porque ahora el formulario también exige Inteligencia Artificial
    // y conviene mostrar un mensaje claro para campos obligatorios.
    if (!imageFile || !title || !description || isNaN(price) || price < 0 || !category || !aiTool) {
        alert('Completa todos los campos obligatorios: imagen, título, descripción, precio, categoría e inteligencia artificial.');
        return;
    }

    const imageUrl = await readFileAsDataURL(imageFile);

    const newProduct = {
        id: Date.now(), title, description, price, category, aiTool,
        image: imageUrl, featured: false, trending: false, views: 0
    };

    const products = loadProducts();
    products.push(newProduct);
    saveProducts(products);

    closeForm();
    renderProductGrid();
    event.target.reset();
    resetImageInputUI();
    resetCustomDropdowns();
}

function resetImageInputUI() {
    const fileName = document.getElementById('file-name');
    const preview = document.getElementById('image-preview');

    if (fileName) fileName.textContent = 'Ninguna imagen seleccionada';
    if (preview) {
        preview.hidden = true;
        preview.removeAttribute('src');
    }
}

function resetCustomDropdowns() {
    document.querySelectorAll('.custom-select').forEach(dropdown => {
        const targetInput = document.getElementById(dropdown.dataset.target);
        const button = dropdown.querySelector('.select-selected');
        const placeholder = dropdown.dataset.placeholder || 'Seleccionar';

        if (targetInput) targetInput.value = '';
        if (button) {
            button.textContent = placeholder;
            button.setAttribute('aria-expanded', 'false');
        }
        dropdown.classList.remove('open');
        dropdown.querySelectorAll('.select-option').forEach(option => {
            option.classList.remove('selected');
            option.setAttribute('aria-selected', 'false');
        });
    });
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// =============================================
// 5. ELIMINAR PRODUCTO
// =============================================

function deleteProduct(id) {
    if (!confirm('¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer.')) return;
    const updated = loadProducts().filter(p => p.id !== id);
    saveProducts(updated);
    renderProductGrid();
}

// =============================================
// 6. EDITAR (PLACEHOLDER)
// =============================================

function editProduct(id) {
    alert('La función de edición estará disponible próximamente.');
}

// =============================================
// 7. FORMULARIO COLAPSABLE
// =============================================

function openForm() {
    const s = document.getElementById('form-section');
    s.classList.add('form-section--visible');
    s.setAttribute('aria-hidden', 'false');
    setTimeout(() => s.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}

function closeForm() {
    const s = document.getElementById('form-section');
    s.classList.remove('form-section--visible');
    s.setAttribute('aria-hidden', 'true');
}

// =============================================
// 8. INICIALIZACIÓN
// =============================================

document.addEventListener('DOMContentLoaded', function () {
    populateCategories();
    populateAiTools();
    setupImageInput();
    setupCustomDropdowns();
    document.getElementById('product-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('btn-open-form').addEventListener('click', openForm);
    document.getElementById('btn-empty-create').addEventListener('click', openForm);
    document.getElementById('btn-close-form').addEventListener('click', closeForm);
    renderProductGrid();
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
