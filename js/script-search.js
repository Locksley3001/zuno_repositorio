// script-search.js - Funcionalidad de búsqueda
// Para modificar el comportamiento: cambiar la lógica en filterProducts
// Para agregar más campos de búsqueda: editar searchFields array
// Para cambiar el debounce: ajustar SEARCH_DEBOUNCE_MS

// Configuración de búsqueda
const SEARCH_DEBOUNCE_MS = 300; // Tiempo de espera antes de ejecutar búsqueda
const searchFields = ['title', 'description', 'category']; // Campos donde buscar

// Estado de búsqueda
let searchTimeout;
let currentSearchTerm = '';
let currentCategoryFilter = null;

// Función principal de búsqueda con debounce
function performSearch(searchTerm) {
    clearTimeout(searchTimeout);
    currentSearchTerm = searchTerm.toLowerCase().trim();

    searchTimeout = setTimeout(() => {
        filterProducts();
    }, SEARCH_DEBOUNCE_MS);
}

// Función para filtrar productos
function filterProducts() {
    let filteredProducts = [...products]; // Copia del array original

    // Filtrar por término de búsqueda
    if (currentSearchTerm) {
        filteredProducts = filteredProducts.filter(product => {
            return searchFields.some(field => {
                const value = product[field];
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(currentSearchTerm);
                }
                return false;
            });
        });
    }

    // Filtrar por categoría si está activo
    if (currentCategoryFilter) {
        filteredProducts = filteredProducts.filter(product =>
            product.category === currentCategoryFilter
        );
    }

    // Renderizar resultados
    renderProducts(filteredProducts, 'explore-grid');

    // Mostrar mensaje si no hay resultados
    showNoResultsMessage(filteredProducts.length === 0 && (currentSearchTerm || currentCategoryFilter));
}

// Función para mostrar/ocultar mensaje de no resultados
function showNoResultsMessage(show) {
    const exploreSection = document.querySelector('.explore-section');
    let noResultsMsg = exploreSection.querySelector('.no-results');

    if (show) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results';
            noResultsMsg.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: rgba(255, 255, 255, 0.7);">
                    <h3 style="margin-bottom: 16px;">No se encontraron productos</h3>
                    <p>Intenta con otros términos de búsqueda o explora nuestras categorías.</p>
                </div>
            `;
            exploreSection.appendChild(noResultsMsg);
        }
        noResultsMsg.style.display = 'block';
    } else if (noResultsMsg) {
        noResultsMsg.style.display = 'none';
    }
}

// Función para filtrar por categoría (llamada desde categorías)
function setCategoryFilter(categoryId) {
    currentCategoryFilter = categoryId;
    filterProducts();

    // Scroll a resultados
    document.querySelector('.explore-section').scrollIntoView({ behavior: 'smooth' });
}

// Función para limpiar filtros
function clearFilters() {
    currentSearchTerm = '';
    currentCategoryFilter = null;

    // Limpiar inputs
    const mainSearchInput = document.getElementById('main-search-input');
    const navbarSearchInput = document.getElementById('navbar-search');

    if (mainSearchInput) mainSearchInput.value = '';
    if (navbarSearchInput) navbarSearchInput.value = '';

    // Renderizar todos los productos
    renderProducts(products, 'explore-grid');
    showNoResultsMessage(false);
}

// Función para manejar sugerencias de búsqueda
function showSearchSuggestions() {
    // Aquí se podrían implementar sugerencias dinámicas basadas en el historial o productos populares
    const suggestions = [
        'Logo para startup',
        'Marketing digital',
        'Contenido Instagram',
        'Diseño web',
        'Video corporativo',
        'IA y machine learning'
    ];

    // Por ahora, las sugerencias están estáticas en el HTML
    // Se podrían hacer dinámicas modificando el DOM
}

// Inicialización de event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Buscador principal
    const mainSearchInput = document.getElementById('main-search-input');
    if (mainSearchInput) {
        mainSearchInput.addEventListener('input', function(e) {
            performSearch(e.target.value);
        });

        mainSearchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                performSearch(e.target.value);
            }
        });
    }

    // Buscador del navbar
    const navbarSearchInput = document.getElementById('navbar-search');
    if (navbarSearchInput) {
        navbarSearchInput.addEventListener('input', function(e) {
            performSearch(e.target.value);
        });

        navbarSearchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                performSearch(e.target.value);
            }
        });
    }

    // Botones de búsqueda
    const searchButtons = document.querySelectorAll('.main-search-btn, .search-btn');
    searchButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = button.closest('.search-input-wrapper, .search-bar')?.querySelector('input');
            if (input) {
                performSearch(input.value);
            }
        });
    });

    // Mostrar sugerencias al hacer focus
    if (mainSearchInput) {
        mainSearchInput.addEventListener('focus', showSearchSuggestions);
    }
});