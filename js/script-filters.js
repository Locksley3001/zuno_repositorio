// script-filters.js - Filtrado por categorías
// Para agregar categorías dinámicas: editar el array 'categories' en script-shop.js
// Para cambiar el comportamiento del filtro: modificar filterByCategory
// Para agregar filtros adicionales: crear nuevas funciones similares

// Estado del filtro actual
let activeCategoryFilter = null;

// Función para filtrar productos por categoría
function filterByCategory(categoryId) {
    activeCategoryFilter = categoryId;

    // Obtener productos filtrados
    const filteredProducts = products.filter(product => product.category === categoryId);

    // Renderizar productos filtrados
    renderProducts(filteredProducts, 'explore-grid');

    // Actualizar indicador visual de categoría activa
    updateActiveCategoryIndicator(categoryId);

    // Mostrar mensaje de categoría
    showCategoryMessage(categoryId);

    // Scroll suave a resultados
    scrollToResults();
}

// Función para mostrar mensaje de categoría activa
function showCategoryMessage(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    // Crear o actualizar mensaje
    let categoryMsg = document.querySelector('.category-message');
    if (!categoryMsg) {
        categoryMsg = document.createElement('div');
        categoryMsg.className = 'category-message';
        categoryMsg.style.cssText = `
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(168, 216, 255, 0.1);
            border: 1px solid rgba(168, 216, 255, 0.2);
            border-radius: 12px;
            color: #a8d8ff;
        `;
        document.querySelector('.explore-container').insertBefore(categoryMsg, document.getElementById('explore-grid'));
    }

    categoryMsg.innerHTML = `
        <h3 style="margin: 0; font-size: 20px;">Mostrando productos en: ${category.name}</h3>
        <button onclick="clearCategoryFilter()" style="
            margin-top: 10px;
            background: transparent;
            border: 1px solid rgba(168, 216, 255, 0.4);
            color: #a8d8ff;
            padding: 6px 12px;
            border-radius: 999px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
        " onmouseover="this.style.background='rgba(168, 216, 255, 0.1)'" onmouseout="this.style.background='transparent'">
            Limpiar filtro
        </button>
    `;
}

// Función para limpiar filtro de categoría
function clearCategoryFilter() {
    activeCategoryFilter = null;

    // Renderizar todos los productos
    renderProducts(products, 'explore-grid');

    // Remover mensaje de categoría
    const categoryMsg = document.querySelector('.category-message');
    if (categoryMsg) {
        categoryMsg.remove();
    }

    // Limpiar indicador visual
    updateActiveCategoryIndicator(null);
}

// Función para actualizar indicador visual de categoría activa
function updateActiveCategoryIndicator(activeCategoryId) {
    // Remover clase active de todas las categorías
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });

    // Agregar clase active a la categoría seleccionada
    if (activeCategoryId) {
        const activeItem = document.querySelector(`.category-item[data-category="${activeCategoryId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
}

// Función para hacer scroll a los resultados
function scrollToResults() {
    const exploreSection = document.querySelector('.explore-section');
    if (exploreSection) {
        exploreSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Función para inicializar categorías con data attributes
function initializeCategoryItems() {
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach((item, index) => {
        if (categories[index]) {
            item.setAttribute('data-category', categories[index].id);
        }
    });
}

// Función para manejar clics en categorías
function handleCategoryClick(event) {
    const categoryId = event.currentTarget.getAttribute('data-category');
    if (categoryId) {
        filterByCategory(categoryId);
    }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar data attributes en categorías
    initializeCategoryItems();

    // Agregar event listeners a categorías
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', handleCategoryClick);
    });

    // Agregar estilos para categoría activa
    const style = document.createElement('style');
    style.textContent = `
        .category-item.active {
            background: rgba(168, 216, 255, 0.15) !important;
            border-color: rgba(168, 216, 255, 0.5) !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(168, 216, 255, 0.2);
        }
    `;
    document.head.appendChild(style);
});