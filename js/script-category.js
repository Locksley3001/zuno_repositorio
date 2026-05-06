// script-category.js - Renderizado dinámico de productos por categoría
// Cómo funciona la navegación de categorías: 
//   - Click en categoría → redirect a category.html?name=nombreCategoria
//   - URL se lee con URLSearchParams
//   - Productos se filtran por categoria
// Cómo se obtiene la categoría desde la URL:
//   - new URLSearchParams(window.location.search).get('name')
// Cómo se filtran los productos:
//   - products.filter(p => p.category === categoryId)
// Cómo se separan tendencias:
//   - views >= 4 son trending, el resto normales
//   - Se renderiza cada sección por separado

document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que los productos estén disponibles (script-shop.js debe cargar primero)
    const checkProducts = () => {
        if (typeof products === 'undefined' || typeof categories === 'undefined') {
            // Reintentar en 100ms si no están disponibles
            setTimeout(checkProducts, 100);
            return;
        }

        // Una vez que los productos están disponibles, ejecutar la lógica
        loadCategoryPage();
    };

    checkProducts();
});

function loadCategoryPage() {
    // Leer parámetro 'name' de la URL (ej: category.html?name=marketing)
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('name');

    // Validar que existe el parámetro
    if (!categoryId) {
        document.getElementById('category-title').textContent = 'Categoría no encontrada';
        document.getElementById('category-description').textContent = 'Por favor, selecciona una categoría válida.';
        document.getElementById('trending-section').style.display = 'none';
        document.getElementById('explore-grid').innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.7); padding: 40px;">No hay productos en esta categoría.</p>';
        return;
    }

    // Obtener información de la categoría desde el array global 'categories' (importado de script-shop.js)
    const category = categories.find(cat => cat.id === categoryId);
    
    if (!category) {
        document.getElementById('category-title').textContent = 'Categoría no encontrada';
        document.getElementById('category-description').textContent = 'La categoría solicitada no existe.';
        document.getElementById('trending-section').style.display = 'none';
        document.getElementById('explore-grid').innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.7); padding: 40px;">Categoría no disponible.</p>';
        return;
    }

    // Actualizar título y descripción dinámicamente con información de la categoría
    document.getElementById('category-title').textContent = category.name;
    document.getElementById('category-description').textContent = category.description;

    // Filtrar productos de esta categoría (devuelve array de productos)
    const categoryProducts = products.filter(product => product.category === categoryId);

    // Validar si hay productos en la categoría
    if (categoryProducts.length === 0) {
        document.getElementById('trending-section').style.display = 'none';
        document.getElementById('explore-grid').innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.7); padding: 40px;">No hay productos en esta categoría.</p>';
        return;
    }

    // Separar productos trending de los normales
    // Trending: productos con views >= 4
    const trendingProducts = categoryProducts.filter(product => product.views >= 4);
    const normalProducts = categoryProducts.filter(product => product.views < 4);

    // Si no hay productos trending, ocultar la sección
    if (trendingProducts.length === 0) {
        document.getElementById('trending-section').style.display = 'none';
    } else {
        // Renderizar productos trending de la categoría
        // renderProducts es función global de script-shop.js
        renderProducts(trendingProducts, 'trending-grid', true, 'trending');
    }

    // Renderizar todos los productos de la categoría (normales + trending para tener lista completa)
    renderProducts(categoryProducts, 'explore-grid');
}
