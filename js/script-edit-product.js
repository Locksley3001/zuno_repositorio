// script-edit-product.js
// =============================================
// Lógica para la página de edición de producto.
//
// ESTRUCTURA:
//   1. Datos: categorías y herramientas IA
//      (idénticos a script-seller.js para consistencia)
//   2. localStorage: leer y guardar productos
//   3. Obtener ID desde URL
//   4. Dropdowns personalizados (reutiliza la misma
//      lógica que script-seller.js)
//   5. Control de imagen con preview
//   6. Auto-relleno del formulario con datos actuales
//   7. Guardado y actualización en localStorage
//   8. Toast de confirmación
//   9. Inicialización
// =============================================

// =============================================
// 1. DATOS
// Deben mantenerse sincronizados con script-seller.js.
// Para agregar categorías o IAs: modificar estos arrays.
// =============================================

const EDIT_CATEGORIES = [
    { id: 'logos',    name: 'Logos' },
    { id: 'marketing',name: 'Marketing' },
    { id: 'social',   name: 'Redes Sociales' },
    { id: 'web',      name: 'Web Design' },
    { id: 'video',    name: 'Video' },
    { id: 'ai',       name: 'IA & ML' },
    { id: 'business', name: 'Negocios' },
    { id: 'creative', name: 'Creativo' }
];

const EDIT_AI_TOOLS = [
    'ChatGPT',
    'Claude',
    'Gemini',
    'Midjourney',
    'DALL·E'
];

// =============================================
// 2. LOCALSTORAGE
// Clave 'zuno-products': mismo que script-seller.js.
// CÓMO SE ACTUALIZA EN STORAGE:
//   updateProduct() busca el producto por ID con findIndex(),
//   reemplaza el elemento en el array manteniendo el mismo índice,
//   y guarda el array completo. El ID nunca cambia.
// =============================================

/**
 * loadProducts()
 * Lee el array completo desde localStorage.
 * @returns {Array}
 */
function loadProducts() {
    const stored = localStorage.getItem('zuno-products');
    return stored ? JSON.parse(stored) : [];
}

/**
 * saveProducts(products)
 * Persiste el array en localStorage.
 * @param {Array} products
 */
function saveProducts(products) {
    localStorage.setItem('zuno-products', JSON.stringify(products));
}

/**
 * getProductById(id)
 * CÓMO SE OBTIENE EL PRODUCTO:
 *   Carga el array completo y busca el elemento cuyo
 *   campo `id` (number) coincida con el parámetro.
 * @param {number} id
 * @returns {Object|null}
 */
function getProductById(id) {
    return loadProducts().find(p => p.id === id) || null;
}

/**
 * updateProduct(updatedProduct)
 * CÓMO SE ACTUALIZA:
 *   1. Carga el array completo.
 *   2. Busca el índice del producto por su ID.
 *   3. Reemplaza el objeto en ese índice con los nuevos datos.
 *      Se hace con Object.assign para conservar campos que
 *      no están en el formulario (views, featured, trending).
 *   4. Guarda el array actualizado.
 * @param {Object} updatedProduct - objeto con los campos editados
 */
function updateProduct(updatedProduct) {
    const products = loadProducts();
    const index    = products.findIndex(p => p.id === updatedProduct.id);

    if (index === -1) {
        console.error('[Zuno] updateProduct: ID no encontrado:', updatedProduct.id);
        return false;
    }

    // Conservar campos que no edita el formulario (views, featured, trending)
    // y sobreescribir solo los campos editados.
    products[index] = Object.assign({}, products[index], updatedProduct);

    saveProducts(products);
    return true;
}

// =============================================
// 3. OBTENER ID DESDE LA URL
// CÓMO SE OBTIENE EL ID:
//   new URLSearchParams(window.location.search) parsea
//   la query string de la URL actual.
//   edit-product.html?id=1718123456 → id = 1718123456 (number).
// =============================================

/**
 * getIdFromUrl()
 * @returns {number|null}
 */
function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const raw    = params.get('id');
    if (!raw) return null;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? null : parsed;
}

// =============================================
// 4. DROPDOWNS PERSONALIZADOS
// Lógica idéntica a script-seller.js.
// Se duplica aquí para que esta página sea autónoma
// (no depende de que script-seller.js esté cargado).
// CÓMO MODIFICAR: ajustar en EDIT_CATEGORIES / EDIT_AI_TOOLS arriba.
// =============================================

/**
 * renderDropdownOptions(dropdown, options)
 * Llena el <ul class="select-options"> con los ítems recibidos.
 * @param {HTMLElement} dropdown
 * @param {Array<{value, label}>} options
 */
function renderDropdownOptions(dropdown, options) {
    const list = dropdown.querySelector('.select-options');
    if (!list) return;

    list.innerHTML = '';
    options.forEach(opt => {
        const li = document.createElement('li');
        li.className       = 'select-option';
        li.dataset.value   = opt.value;
        li.setAttribute('role', 'option');
        li.textContent     = opt.label;
        list.appendChild(li);
    });
}

/**
 * setupDropdowns()
 * Registra los eventos click de todos los .custom-select
 * presentes en el formulario de edición.
 */
function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.custom-select');

    dropdowns.forEach(dropdown => {
        const button      = dropdown.querySelector('.select-selected');
        const list        = dropdown.querySelector('.select-options');
        const targetInput = document.getElementById(dropdown.dataset.target);

        if (!button || !list || !targetInput) return;

        // Abrir / cerrar al hacer click en el botón
        button.addEventListener('click', function () {
            const willOpen = !dropdown.classList.contains('open');
            closeAllDropdowns();
            dropdown.classList.toggle('open', willOpen);
            button.setAttribute('aria-expanded', String(willOpen));
        });

        // Seleccionar opción
        list.addEventListener('click', function (e) {
            const option = e.target.closest('.select-option');
            if (!option) return;

            // Guardar valor en el input hidden (es el que valida el formulario)
            targetInput.value = option.dataset.value;
            button.textContent = option.textContent;

            // Marcar visualmente la opción seleccionada
            list.querySelectorAll('.select-option').forEach(item => {
                item.classList.toggle('selected', item === option);
                item.setAttribute('aria-selected', String(item === option));
            });

            dropdown.classList.remove('open');
            button.setAttribute('aria-expanded', 'false');
        });
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.custom-select')) {
            closeAllDropdowns();
        }
    });
}

/**
 * closeAllDropdowns()
 * Cierra todos los dropdowns abiertos.
 */
function closeAllDropdowns() {
    document.querySelectorAll('.custom-select.open').forEach(dd => {
        dd.classList.remove('open');
        const btn = dd.querySelector('.select-selected');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    });
}

/**
 * setDropdownValue(dataTarget, value, label)
 * AUTO-RELLENO DE DROPDOWNS:
 *   Al cargar la página, se llama con el valor guardado del producto
 *   para que el dropdown muestre la opción ya seleccionada.
 *   Actualiza el input hidden, el texto del botón y marca el <li> correcto.
 *
 * @param {string} dataTarget - valor de data-target en el .custom-select
 * @param {string} value      - valor a seleccionar (id de categoría o nombre de IA)
 * @param {string} label      - texto visible a mostrar en el botón
 */
function setDropdownValue(dataTarget, value, label) {
    const dropdown    = document.querySelector(`.custom-select[data-target="${dataTarget}"]`);
    const targetInput = document.getElementById(dataTarget);

    if (!dropdown || !targetInput) return;

    // Actualizar el input hidden con el valor
    targetInput.value = value;

    // Actualizar el texto del botón
    const button = dropdown.querySelector('.select-selected');
    if (button) button.textContent = label || value;

    // Marcar el <li> correspondiente como selected
    dropdown.querySelectorAll('.select-option').forEach(opt => {
        const isSelected = opt.dataset.value === value;
        opt.classList.toggle('selected', isSelected);
        opt.setAttribute('aria-selected', String(isSelected));
    });
}

// =============================================
// 5. CONTROL DE IMAGEN CON PREVIEW
// =============================================

// Variable que guarda la imagen actual en base64.
// Se inicializa con la imagen del producto al cargar.
// Si el usuario elige una nueva imagen, se actualiza.
// Si no elige ninguna, se mantiene la original al guardar.
let currentImageBase64 = '';

/**
 * setupImageControl()
 * Conecta el botón personalizado con el input nativo oculto.
 * Al cambiar el archivo, actualiza el preview y la variable currentImageBase64.
 */
function setupImageControl() {
    const input   = document.getElementById('ep-image');
    const button  = document.getElementById('ep-file-btn');
    const name    = document.getElementById('ep-file-name');
    const preview = document.getElementById('ep-image-preview');

    if (!input || !button || !name || !preview) return;

    // El botón personalizado dispara el input nativo oculto
    button.addEventListener('click', function () {
        input.click();
    });

    // Al seleccionar archivo: mostrar nombre y preview
    input.addEventListener('change', function () {
        const file = input.files[0];

        if (!file) {
            // Si no hay archivo, mantener imagen anterior
            name.textContent = 'Imagen actual (sin cambios)';
            return;
        }

        name.textContent = file.name;

        // Generar URL temporal para el preview
        preview.src = URL.createObjectURL(file);
        preview.hidden = false;

        // Convertir a base64 para almacenamiento
        const reader = new FileReader();
        reader.onload = () => {
            currentImageBase64 = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

// =============================================
// 6. AUTO-RELLENO DEL FORMULARIO
// CÓMO SE CARGA EL PRODUCTO:
//   prefillForm() recibe el objeto producto y asigna
//   cada campo del formulario con su valor correspondiente.
//   Para los dropdowns usa setDropdownValue().
//   Para la imagen muestra el preview de la imagen guardada.
// =============================================

/**
 * prefillForm(product)
 * Rellena todos los campos del formulario con los datos del producto.
 * @param {Object} product
 */
function prefillForm(product) {
    // ── Campos de texto y número ──
    document.getElementById('ep-title').value       = product.title       || '';
    document.getElementById('ep-description').value = product.description || '';
    document.getElementById('ep-price').value       = product.price       || '';

    // ── Dropdown Categoría ──
    // Buscar la etiqueta legible de la categoría
    const categoryObj = EDIT_CATEGORIES.find(c => c.id === product.category);
    const categoryLabel = categoryObj ? categoryObj.name : (product.category || '');
    setDropdownValue('ep-category', product.category || '', categoryLabel);

    // ── Dropdown IA ──
    // El valor y la etiqueta coinciden para las IAs (son el mismo string)
    const aiLabel = product.aiTool || '';
    setDropdownValue('ep-ai', product.aiTool || '', aiLabel);

    // ── Imagen ──
    // Mostrar la imagen actual como preview inmediato
    const preview = document.getElementById('ep-image-preview');
    const name    = document.getElementById('ep-file-name');

    if (product.image) {
        currentImageBase64  = product.image; // Guardar la imagen actual
        preview.src         = product.image;
        preview.hidden      = false;
        name.textContent    = 'Imagen actual';
    } else {
        preview.hidden   = true;
        name.textContent = 'Sin imagen';
    }
}

// =============================================
// 7. VALIDACIÓN Y GUARDADO
// =============================================

/**
 * validateForm()
 * Verifica que todos los campos obligatorios tengan valor.
 * Devuelve un objeto con los datos validados o null si hay errores.
 * @returns {Object|null}
 */
function validateForm() {
    const title       = document.getElementById('ep-title').value.trim();
    const description = document.getElementById('ep-description').value.trim();
    const price       = parseFloat(document.getElementById('ep-price').value);
    const category    = document.getElementById('ep-category').value;
    const aiTool      = document.getElementById('ep-ai').value;

    if (!title) {
        alert('El título es obligatorio.');
        document.getElementById('ep-title').focus();
        return null;
    }

    if (!description) {
        alert('La descripción es obligatoria.');
        document.getElementById('ep-description').focus();
        return null;
    }

    if (isNaN(price) || price < 0) {
        alert('Ingresa un precio válido (número mayor o igual a 0).');
        document.getElementById('ep-price').focus();
        return null;
    }

    if (!category) {
        alert('Selecciona una categoría.');
        return null;
    }

    if (!aiTool) {
        alert('Selecciona una inteligencia artificial.');
        return null;
    }

    if (!currentImageBase64) {
        alert('El producto debe tener una imagen.');
        return null;
    }

    return { title, description, price, category, aiTool };
}

/**
 * handleEditSubmit(event, productId)
 * Manejador del submit del formulario de edición.
 *
 * FLUJO:
 *   1. Prevenir recarga de página.
 *   2. Validar campos.
 *   3. Construir objeto con los datos nuevos + ID original.
 *   4. Llamar updateProduct() que reemplaza en localStorage.
 *   5. Mostrar toast de éxito.
 *   6. Redirigir a seller.html tras breve pausa.
 *
 * @param {Event}  event
 * @param {number} productId - ID del producto que se está editando
 */
async function handleEditSubmit(event, productId) {
    event.preventDefault();

    // Deshabilitar el botón durante el proceso para evitar doble submit
    const submitBtn = document.getElementById('ep-submit-btn');
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Guardando...';

    // Validar campos
    const fields = validateForm();
    if (!fields) {
        // Reactivar botón si hay error de validación
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Guardar cambios';
        return;
    }

    // Construir el objeto actualizado
    // NOTA: el ID se mantiene igual al original para que el producto
    // conserve sus vistas, estado trending y posición en el array.
    const updatedProduct = {
        id:          productId,      // Nunca cambia
        title:       fields.title,
        description: fields.description,
        price:       fields.price,
        category:    fields.category,
        aiTool:      fields.aiTool,
        image:       currentImageBase64  // Imagen actual o nueva si se cambió
        // Nota: views, featured y trending se conservan via Object.assign en updateProduct()
    };

    // Guardar en localStorage
    const saved = updateProduct(updatedProduct);

    if (!saved) {
        alert('No se pudo guardar el producto. Intenta nuevamente.');
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Guardar cambios';
        return;
    }

    // Mostrar toast de confirmación
    showToast('Producto actualizado correctamente');

    // Redirigir a seller.html después de 1.5 segundos
    // El tiempo permite que el usuario vea el toast antes de salir
    setTimeout(() => {
        window.location.href = './seller.html';
    }, 1500);
}

// =============================================
// 8. TOAST DE CONFIRMACIÓN
// =============================================

let toastTimeout = null;

/**
 * showToast(message)
 * Muestra la notificación verde en la esquina inferior derecha.
 * Se oculta automáticamente tras 3 segundos.
 * @param {string} message
 */
function showToast(message) {
    const toast = document.getElementById('ep-toast');
    if (!toast) return;

    toast.innerHTML = `
        <svg class="ep-toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>${escapeHtml(message)}</span>
    `;

    toast.classList.add('ep-toast--visible');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('ep-toast--visible');
    }, 3000);
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
// 9. INICIALIZACIÓN
// =============================================

document.addEventListener('DOMContentLoaded', function () {

    const loadingEl = document.getElementById('ep-loading');
    const errorEl   = document.getElementById('ep-error');
    const mainEl    = document.getElementById('ep-main');

    // ── PASO 1: Obtener el ID del producto desde la URL ──
    // edit-product.html?id=1718123456 → productId = 1718123456
    const productId = getIdFromUrl();

    if (!productId) {
        // No hay ?id= en la URL → mostrar error
        loadingEl.style.display = 'none';
        errorEl.style.display   = 'flex';
        return;
    }

    // ── PASO 2: Buscar el producto en localStorage ──
    const product = getProductById(productId);

    if (!product) {
        // ID no existe en el array → mostrar error
        loadingEl.style.display = 'none';
        errorEl.style.display   = 'flex';
        return;
    }

    // ── PASO 3: Mostrar el formulario ──
    loadingEl.style.display = 'none';
    mainEl.style.display    = 'block';

    // Actualizar el título de la pestaña con el nombre del producto
    document.title = `Editar: ${product.title} · Zuno`;

    // ── PASO 4: Poblar los dropdowns con las opciones disponibles ──
    // (debe hacerse ANTES de prefillForm para que los <li> existan al marcar)
    const catDropdown = document.querySelector('.custom-select[data-target="ep-category"]');
    const aiDropdown  = document.querySelector('.custom-select[data-target="ep-ai"]');

    if (catDropdown) {
        renderDropdownOptions(catDropdown, EDIT_CATEGORIES.map(c => ({ value: c.id, label: c.name })));
    }
    if (aiDropdown) {
        renderDropdownOptions(aiDropdown, EDIT_AI_TOOLS.map(t => ({ value: t, label: t })));
    }

    // ── PASO 5: Auto-rellenar el formulario con los datos del producto ──
    prefillForm(product);

    // ── PASO 6: Configurar el control de imagen ──
    setupImageControl();

    // ── PASO 7: Configurar los dropdowns ──
    setupDropdowns();

    // ── PASO 8: Registrar el submit del formulario ──
    const form = document.getElementById('edit-product-form');
    form.addEventListener('submit', (e) => handleEditSubmit(e, productId));

    // ── PASO 9: Toggle del navbar mobile ──
    const navToggle = document.querySelector('.nav-toggle');
    const navbar    = document.querySelector('.navbar-glass');
    const navLinks  = document.querySelector('.nav-links');

    if (navToggle && navbar && navLinks) {
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
});
