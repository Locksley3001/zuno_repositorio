// script-categories.js - Generación dinámica de categorías
// Para agregar categorías: editar el array 'categories' en script-shop.js
// Para cambiar estadísticas: modificar getCategoryStats
// Para ajustar navegación: cambiar handleCategoryClick

// Array de categorías - IMPORTADO desde script-shop.js
// Mantener sincronizado con script-shop.js
const categories = [
    { id: 'logos', name: 'Logos', icon: '🎨', description: 'Diseños de logos profesionales' },
    { id: 'marketing', name: 'Marketing', icon: '📈', description: 'Estrategias de marketing digital' },
    { id: 'social', name: 'Redes Sociales', icon: '📱', description: 'Contenido para redes sociales' },
    { id: 'web', name: 'Web Design', icon: '💻', description: 'Diseños web modernos' },
    { id: 'video', name: 'Video', icon: '🎥', description: 'Producción de video' },
    { id: 'ai', name: 'IA & ML', icon: '🤖', description: 'Inteligencia artificial' },
    { id: 'business', name: 'Negocios', icon: '💼', description: 'Herramientas de negocio' },
    { id: 'creative', name: 'Creativo', icon: '✨', description: 'Ideas creativas' }
];

// Cargar productos desde localStorage
let products = [];
function loadProducts() {
    const stored = localStorage.getItem('zuno-products');
    if (stored) {
        return JSON.parse(stored);
    }
    // Valores por defecto si no hay en localStorage
    return [];
}

// Función para obtener estadísticas de una categoría
function getCategoryStats(categoryId) {
    // Simular estadísticas basadas en productos
    // En una implementación real, esto vendría de una API
    const categoryProducts = products.filter(product => product.category === categoryId);
    const totalProducts = categoryProducts.length;
    const avgPrice = categoryProducts.reduce((sum, product) => sum + product.price, 0) / totalProducts || 0;

    return {
        products: totalProducts,
        avgPrice: Math.round(avgPrice * 100) / 100
    };
}

// Función para renderizar categorías en el grid principal de categories.html
function renderCategories() {
    const categoriesGrid = document.getElementById('categories-main-grid');
    if (!categoriesGrid) return;

    categoriesGrid.innerHTML = '';

    categories.forEach(category => {
        const categoryElement = document.createElement('a');
        categoryElement.className = 'category-card';
        categoryElement.href = `./category.html?name=${category.id}`;
        categoryElement.setAttribute('data-category', category.id);

        // Obtener estadísticas de la categoría
        const stats = getCategoryStats(category.id);

        categoryElement.innerHTML = `
            <div class="category-icon">
                ${category.icon}
            </div>
            <h3 class="category-name">${category.name}</h3>
            <p class="category-description">${category.description}</p>
            <div class="category-stats">
                <div class="category-stat">
                    <span class="category-stat-number">${stats.products}</span>
                    <span class="category-stat-label">productos</span>
                </div>
                <div class="category-stat">
                    <span class="category-stat-number">$${stats.avgPrice}</span>
                    <span class="category-stat-label">promedio</span>
                </div>
            </div>
            <div class="category-btn">Explorar</div>
        `;

        categoriesGrid.appendChild(categoryElement);
    });
}

// Función para animar categorías al cargar
function animateCategoriesOnLoad() {
    const categoryCards = document.querySelectorAll('.category-card');

    categoryCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';

        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Cargar productos
    products = loadProducts();

    // Renderizar categorías en el grid principal
    renderCategories();

    // Animar categorías después de renderizar
    setTimeout(animateCategoriesOnLoad, 200);
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
