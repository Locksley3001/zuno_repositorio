// script-shop.js - Renderizado dinámico de productos y navegación
// Cómo funciona la navegación: Multi-página con <a href> normal, sin scroll ni SPA
// Páginas conectadas: shop.html (principal), categories.html, trending.html, how-it-works.html
// Cómo se conectan las páginas: Navbar común con enlaces directos, datos compartidos via localStorage
// Cómo se reutilizan datos: Array 'products' compartido entre páginas via localStorage
// Para agregar productos: editar el array 'products' abajo
// Para cambiar categorías: modificar 'categories' array
// Para ajustar grid: cambiar grid-template-columns en CSS

// Variable de filtro (DESHABILITADA - No se usa en navegación multi-página)
// let activeCategoryFilter = null;

// Array de categorías - Agregar nuevas categorías aquí para escalabilidad
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

// Array de productos - Cargar desde localStorage, con valores por defecto
// Para agregar productos dinámicamente: usar localStorage o API
// Estructura: id, title, description, price, category, image, featured, trending, views
let products = loadProducts();

function loadProducts() {
    const stored = localStorage.getItem('zuno-products');
    if (stored) {
        return JSON.parse(stored);
    }
    // Valores por defecto si no hay en localStorage
    return [
        {
            id: 1,
            title: 'Logo Moderno para Startup Tech',
            description: 'Prompt completo para generar logos minimalistas y modernos perfectos para empresas tecnológicas emergentes.',
            price: 15.99,
            category: 'logos',
            image: 'https://via.placeholder.com/300x200/4968ff/ffffff?text=Logo+Tech',
            featured: true,
            trending: true,
            views: 5
        },
        {
            id: 2,
            title: 'Estrategia de Marketing Digital',
            description: 'Guía completa de prompts para crear estrategias de marketing digital efectivas en redes sociales.',
            price: 24.99,
            category: 'marketing',
            image: 'https://via.placeholder.com/300x200/9a64ff/ffffff?text=Marketing',
            featured: true,
            trending: false,
            views: 3
        },
        {
            id: 3,
            title: 'Contenido para Instagram',
            description: 'Colección de prompts optimizados para generar contenido viral en Instagram y otras plataformas.',
            price: 12.99,
            category: 'social',
            image: 'https://via.placeholder.com/300x200/64b8ff/ffffff?text=Instagram',
            featured: false,
            trending: true,
            views: 4
        },
        {
            id: 4,
            title: 'Diseño Web Responsive',
            description: 'Prompts avanzados para crear diseños web modernos y completamente responsive.',
            price: 29.99,
            category: 'web',
            image: 'https://via.placeholder.com/300x200/4a90e2/ffffff?text=Web+Design',
            featured: true,
            trending: false,
            views: 2
        },
        {
            id: 5,
            title: 'Scripts para Videos Corporativos',
            description: 'Biblioteca de prompts para generar scripts de video profesionales para empresas.',
            price: 19.99,
            category: 'video',
            image: 'https://via.placeholder.com/300x200/ff6b6b/ffffff?text=Video',
            featured: false,
            trending: true,
            views: 6
        },
        {
            id: 6,
            title: 'Modelos de Machine Learning',
            description: 'Prompts especializados para crear y entrenar modelos de IA y machine learning.',
            price: 34.99,
            category: 'ai',
            image: 'https://via.placeholder.com/300x200/51cf66/ffffff?text=AI+ML',
            featured: true,
            trending: false,
            views: 1
        },
        {
            id: 7,
            title: 'Plan de Negocios Completo',
            description: 'Guía de prompts para elaborar planes de negocio detallados y profesionales.',
            price: 22.99,
            category: 'business',
            image: 'https://via.placeholder.com/300x200/f39c12/ffffff?text=Business',
            featured: false,
            trending: false,
            views: 0
        },
        {
            id: 8,
            title: 'Ideas Creativas para Proyectos',
            description: 'Colección de prompts creativos para generar ideas innovadoras en cualquier campo.',
            price: 16.99,
            category: 'creative',
            image: 'https://via.placeholder.com/300x200/e74c3c/ffffff?text=Creative',
            featured: false,
            trending: false,
            views: 0
        },
        {
            id: 9,
            title: 'Branding Corporativo',
            description: 'Prompts completos para desarrollar identidades de marca coherentes y memorables.',
            price: 27.99,
            category: 'logos',
            image: 'https://via.placeholder.com/300x200/9b59b6/ffffff?text=Branding',
            featured: false,
            trending: false,
            views: 0
        },
        {
            id: 10,
            title: 'Campañas Publicitarias',
            description: 'Estrategias de prompts para crear campañas publicitarias impactantes y efectivas.',
            price: 21.99,
            category: 'marketing',
            image: 'https://via.placeholder.com/300x200/1abc9c/ffffff?text=Ads',
            featured: false,
            trending: false,
            views: 0
        },
        {
            id: 11,
            title: 'Contenido para TikTok',
            description: 'Prompts optimizados para crear contenido viral en TikTok y plataformas cortas.',
            price: 14.99,
            category: 'social',
            image: 'https://via.placeholder.com/300x200/e67e22/ffffff?text=TikTok',
            featured: false,
            trending: false,
            views: 0
        },
        {
            id: 12,
            title: 'UX/UI Design Patterns',
            description: 'Biblioteca de prompts para diseñar interfaces de usuario intuitivas y modernas.',
            price: 25.99,
            category: 'web',
            image: 'https://via.placeholder.com/300x200/34495e/ffffff?text=UX+UI',
            featured: false,
            trending: false,
            views: 0
        }
    ];
}

// Función para renderizar categorías horizontales
// Cómo funciona la navegación: Cada categoría es un link que redirige a category.html?name=categoryId
// No hay filtrado local, la navegación es multi-página para mejor UX y escalabilidad
function renderCategories() {
    const categoriesGrid = document.getElementById('categories-grid');
    if (!categoriesGrid) return;

    categoriesGrid.innerHTML = '';

    categories.forEach(category => {
        const categoryElement = document.createElement('a');
        categoryElement.className = 'category-item';
        categoryElement.href = `./category.html?name=${category.id}`;
        categoryElement.setAttribute('data-category', category.id);
        // No usar onclick para filtrado local - navegación multi-página

        categoryElement.innerHTML = `
            <div class="category-icon">${category.icon}</div>
            <div class="category-content">
                <h4 class="category-name">${category.name}</h4>
                <p class="category-description">${category.description}</p>
            </div>
        `;

        categoriesGrid.appendChild(categoryElement);
    });

    // Duplicar elementos para loop infinito visual
    categories.forEach(category => {
        const categoryElement = document.createElement('a');
        categoryElement.className = 'category-item';
        categoryElement.href = `./category.html?name=${category.id}`;
        categoryElement.setAttribute('data-category', category.id);

        categoryElement.innerHTML = `
            <div class="category-icon">${category.icon}</div>
            <div class="category-content">
                <h4 class="category-name">${category.name}</h4>
                <p class="category-description">${category.description}</p>
            </div>
        `;

        categoriesGrid.appendChild(categoryElement);
    });
}

// Función para renderizar productos en un grid específico
// Cómo funciona: Para explore-grid, ordena productos por orden de categorías para consistencia visual
function renderProducts(productsArray, gridId, showBadge = false, badgeType = '') {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    grid.innerHTML = '';

    // Para explore-grid, ordenar productos por el orden de categorías horizontales
    // Mantener diseño, solo cambiar orden para consistencia
    let sortedProducts = productsArray;
    if (gridId === 'explore-grid') {
        const categoryOrder = categories.map(cat => cat.id);
        sortedProducts = productsArray.sort((a, b) => {
            const indexA = categoryOrder.indexOf(a.category);
            const indexB = categoryOrder.indexOf(b.category);
            return indexA - indexB;
        });
    }

    sortedProducts.forEach(product => {
        // Cada tarjeta es un enlace a product.html?id=ID para navegar al detalle
        // Se reemplazó el onclick/openProductModal (que abría un alert) por navegación real
        const productElement = document.createElement('a');
        productElement.className = 'product-card product-card--link';
        productElement.href = `./product.html?id=${product.id}`;

        const categoryName = categories.find(cat => cat.id === product.category)?.name || product.category;
        // Nueva extensión visual: si el producto tiene aiTool, se renderiza una
        // segunda etiqueta debajo de la categoría. Productos antiguos sin IA no muestran nada.
        const aiToolBadge = product.aiTool
            ? `<div class="product-ai-badge">${product.aiTool}</div>`
            : '';

        productElement.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                <!-- Código anterior (comentado)
                     Solo se mostraba la categoría como etiqueta individual:
                     <div class="product-category">${categoryName}</div>
                     Se modifica para agrupar categoría + IA sin rediseñar la tarjeta. -->
                <div class="product-card-badges">
                    <div class="product-category">${categoryName}</div>
                    ${aiToolBadge}
                </div>
                ${showBadge && badgeType === 'trending' ? '<div class="trending-badge">Trending</div>' : ''}
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <div class="product-price">$${product.price}</div>
                    <button class="product-btn" onclick="event.preventDefault(); event.stopPropagation(); addProductIdToCart(${product.id})">Comprar</button>
                </div>
            </div>
        `;

        grid.appendChild(productElement);
    });
}

// Función para mostrar mensaje de categoría activa (DESHABILITADA)
// Se mantiene por compatibilidad pero no se usa en navegación multi-página
/*
function showCategoryMessage(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;
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
*/

// Función para limpiar filtro de categoría (DESHABILITADA)
// Se mantiene por compatibilidad pero no se usa en navegación multi-página
/*
function clearCategoryFilter() {
    activeCategoryFilter = null;
    renderProducts(products, 'explore-grid');
    const categoryMsg = document.querySelector('.category-message');
    if (categoryMsg) {
        categoryMsg.remove();
    }
    updateActiveCategoryIndicator(null);
}
*/

// Función para actualizar indicador visual de categoría activa (DESHABILITADA)
// Se mantiene por compatibilidad pero no se usa en navegación multi-página
/*
function updateActiveCategoryIndicator(activeCategoryId) {
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    if (activeCategoryId) {
        const activeItem = document.querySelector(`.category-item[data-category="${activeCategoryId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
}
*/

// Función para configurar scroll de categorías con botones
// Corrección: Usar categoriesWrapper en lugar de categoriesGrid para scrollBy funcionar correctamente
// El wrapper tiene overflow-x: auto, permitiendo scroll horizontal suave
function setupCategoryScroll() {
    const scrollLeftBtn = document.querySelector('.scroll-left');
    const scrollRightBtn = document.querySelector('.scroll-right');
    const categoriesWrapper = document.querySelector('.categories-wrapper'); // Contenedor con overflow-x: auto

    if (scrollLeftBtn && scrollRightBtn && categoriesWrapper) {
        scrollLeftBtn.addEventListener('click', () => {
            categoriesWrapper.scrollBy({ left: -200, behavior: 'smooth' }); // Desplazar izquierda
        });

        scrollRightBtn.addEventListener('click', () => {
            categoriesWrapper.scrollBy({ left: 200, behavior: 'smooth' }); // Desplazar derecha
        });
    }
}

// Función para filtrar productos por categoría (DESHABILITADA EN SHOP.HTML)
// Estas funciones se mantienen por compatibilidad pero no se usan en el flujo actual
// Ya que la navegación de categorías es multi-página (category.html?name=categoryId)
// Se pueden reutilizar en otras páginas que necesiten filtrado local
/*
function filterByCategory(categoryId) {
    activeCategoryFilter = categoryId;
    const filteredProducts = products.filter(product => product.category === categoryId);
    renderProducts(filteredProducts, 'explore-grid');
    updateActiveCategoryIndicator(categoryId);
    showCategoryMessage(categoryId);
}
*/

// Hacer función global para acceso desde otras páginas (DESHABILITADA)
// window.filterByCategory = filterByCategory;

// Función para agregar al carrito
// Guarda en 'zuno-cart' en localStorage (mismo formato que script-product.js)
// Si el producto ya está, incrementa quantity en lugar de duplicar
// ❌ Codigo anterior (comentado)
// Este codigo se reemplaza porque implementaba otra version local del carrito,
// incrementaba quantity y podia desincronizarse con product.html y otras paginas.
// La nueva implementacion usa script-cart-utils.js como fuente global.
/*
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const stored = localStorage.getItem('zuno-cart');
    const cart   = stored ? JSON.parse(stored) : [];
    const index  = cart.findIndex(item => item.id === productId);

    if (index !== -1) {
        cart[index].quantity += 1;
    } else {
        cart.push({
            id:       product.id,
            title:    product.title,
            price:    product.price,
            category: product.category,
            image:    product.image,
            quantity: 1
        });
    }

    localStorage.setItem('zuno-cart', JSON.stringify(cart));

    // Actualizar badge del navbar
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.querySelector('.cart-count');
    if (badge) badge.textContent = total;
}
*/

// ✅ Nueva funcion puente para tarjetas renderizadas desde IDs.
// Busca el producto en el array local y delega en addToCart(product), que persiste
// en localStorage con la estructura global [{ id, title, price, image, category }].
function addProductIdToCart(productId) {
    const product = products.find(p => String(p.id) === String(productId));
    if (!product) return false;

    const added = addToCart(product);
    updateCartCount();
    return added;
}

// openProductModal — mantenida por compatibilidad pero ya no se usa en tarjetas.
// Las tarjetas ahora navegan directamente a product.html?id=ID.
// La lógica de vistas y trending se ejecuta en script-product.js al abrir el detalle.
function openProductModal(product) {
    window.location.href = `./product.html?id=${product.id}`;
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Renderizar categorías
    renderCategories();

    // Configurar scroll de categorías
    setupCategoryScroll();

    // Renderizar productos trending
    // Cómo funciona tendencias: Automáticos por interacción (4+ vistas), sección adicional
    const trendingProducts = products.filter(product => product.trending);
    renderProducts(trendingProducts, 'trending-grid', true, 'trending');

    // Eliminado: Renderizado de productos destacados
    // Anteriormente: const featuredProducts = products.filter(product => product.featured);
    // renderProducts(featuredProducts, 'featured-grid');
    // Razón: Sección de destacados eliminada según requerimientos

    // Renderizar todos los productos en exploración
    renderProducts(products, 'explore-grid');
});
