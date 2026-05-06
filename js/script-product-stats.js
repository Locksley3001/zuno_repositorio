// script-product-stats.js
// =============================================
// Lógica para la página de estadísticas de un producto.
//
// ESTRUCTURA:
//   1. Mapa de categorías
//   2. Lectura del producto desde localStorage
//   3. Generación de métricas simuladas
//   4. Renderizado: info del producto
//   5. Renderizado: tarjetas de métricas
//   6. Renderizado: gráfico SVG de vistas
//   7. Renderizado: actividad reciente
//   8. Inicialización
//
// CÓMO MODIFICAR DATOS SIMULADOS:
//   - Compras:          ajustar la fórmula en generateSimulatedStats()
//   - Datos del gráfico: ajustar generateChartData()
//   - Actividad:        ajustar generateActivity()
// =============================================

// =============================================
// 1. MAPA DE CATEGORÍAS
// Igual que en script-seller.js para consistencia
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

// =============================================
// 2. OBTENER PRODUCTO DESDE LOCALSTORAGE
// =============================================

/**
 * getProductById(id)
 * Lee todos los productos de localStorage y devuelve
 * el que coincide con el ID recibido.
 *
 * Si no existe ninguno, devuelve null.
 * @param {number} id
 * @returns {Object|null}
 */
function getProductById(id) {
    const stored = localStorage.getItem('zuno-products');
    if (!stored) return null;
    const products = JSON.parse(stored);
    // Comparar como número porque el ID se guardó con Date.now() (number)
    return products.find(p => p.id === id) || null;
}

/**
 * getIdFromUrl()
 * Lee el parámetro ?id= de la URL actual.
 * Ej: product-stats.html?id=1718123456789 → 1718123456789
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
// 3. GENERACIÓN DE MÉTRICAS SIMULADAS
// En producción estos datos vendrían del backend.
// Para cambiar los valores: ajustar las fórmulas aquí.
// =============================================

/**
 * generateSimulatedStats(product)
 * Genera estadísticas simuladas a partir del producto.
 *
 * - views:    usa product.views si existe, si no genera uno seudo-aleatorio
 *             basado en el ID (determinista: mismo producto = mismo número)
 * - purchases: ~15% de las vistas (conversión típica de marketplace digital)
 * - revenue:   purchases × precio
 *
 * El uso del ID como semilla garantiza que al recargar
 * la página los números no cambien (coherencia visual).
 *
 * @param {Object} product
 * @returns {Object} { views, purchases, revenue, isTrending }
 */
function generateSimulatedStats(product) {
    // Semilla determinista: últimos 4 dígitos del ID
    const seed = product.id % 10000;

    // Vistas: si el producto ya tiene vistas reales las usamos,
    // si no, simulamos entre 50 y 850 basado en la semilla
    const views = product.views > 0
        ? product.views
        : 50 + (seed % 800);

    // Compras simuladas: aproximadamente 12-18% de las vistas
    // Usamos la semilla para que el porcentaje sea estable
    const conversionRate = 0.12 + ((seed % 7) / 100); // 0.12 a 0.18
    const purchases      = Math.floor(views * conversionRate);

    // Ingresos totales
    const revenue = purchases * parseFloat(product.price);

    return {
        views,
        purchases,
        revenue,
        isTrending: product.trending || false
    };
}

/**
 * generateChartData(views)
 * Genera datos de vistas para los últimos 14 días.
 *
 * La distribución simula un patrón realista:
 * - crecimiento gradual hacia el día actual
 * - algo de variación aleatoria pero determinista
 *
 * Para cambiar el período: ajustar DAYS.
 * Para cambiar el patrón: modificar la fórmula de cada valor.
 *
 * @param {number} views - total de vistas del producto
 * @returns {Array<{day: string, value: number}>}
 */
function generateChartData(views, productId) {
    const DAYS   = 14;
    const seed   = productId % 1000;
    const data   = [];
    const today  = new Date();

    for (let i = DAYS - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Etiqueta del día: "Lun 3", "Mar 4", etc.
        const label = date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });

        // Valor: distribución que crece hacia el presente
        // con ruido determinista usando el índice y la semilla
        const progress    = (DAYS - i) / DAYS;               // 0 → 1
        const noise       = ((seed + i * 37) % 40) - 20;     // -20 a +20
        const base        = Math.floor((views / DAYS) * progress * 2.2);
        const value       = Math.max(0, base + noise);

        data.push({ label, value });
    }

    return data;
}

/**
 * generateActivity(stats, product)
 * Genera una lista de eventos recientes simulados.
 *
 * Para agregar tipos de eventos: añadir objetos al array.
 * Para cambiar los tiempos: modificar el campo 'time'.
 *
 * @param {Object} stats - { views, purchases, isTrending }
 * @param {Object} product
 * @returns {Array<{type, text, time}>}
 */
function generateActivity(stats, product) {
    const seed     = product.id % 100;
    const viewsHoy = 3 + (seed % 8);   // 3-10 vistas hoy
    const activity = [];

    activity.push({
        type: 'view',
        text: `<strong>+${viewsHoy} vistas</strong> hoy en tu producto`,
        time: 'Hoy'
    });

    if (stats.purchases > 0) {
        activity.push({
            type: 'purchase',
            text: `<strong>+1 compra</strong> reciente registrada`,
            time: 'Hace 2h'
        });
    }

    if (stats.views > 200) {
        activity.push({
            type: 'view',
            text: `Tu producto superó las <strong>${Math.floor(stats.views / 100) * 100} vistas</strong>`,
            time: 'Ayer'
        });
    }

    if (stats.isTrending) {
        activity.push({
            type: 'trending',
            text: `Tu producto está marcado como <strong>Trending</strong>`,
            time: 'Esta semana'
        });
    }

    activity.push({
        type: 'view',
        text: `<strong>+${2 + (seed % 5)} vistas</strong> desde búsquedas orgánicas`,
        time: 'Ayer'
    });

    if (stats.purchases >= 2) {
        activity.push({
            type: 'purchase',
            text: `<strong>+${stats.purchases}</strong> compras en total esta semana`,
            time: 'Esta semana'
        });
    }

    return activity;
}

// =============================================
// 4. RENDER: INFO DEL PRODUCTO
// =============================================

/**
 * renderProductInfo(product)
 * Inyecta imagen, categoría, título y precio
 * en la tarjeta #product-info-card del HTML.
 */
function renderProductInfo(product) {
    const card         = document.getElementById('product-info-card');
    const categoryName = CATEGORY_MAP[product.category] || product.category;
    const price        = parseFloat(product.price).toFixed(2);
    const trendingHtml = product.trending
        ? '<span class="product-info-badge">Trending</span>'
        : '';

    card.innerHTML = `
        <img
            class="product-info-thumb"
            src="${product.image}"
            alt="${escapeHtml(product.title)}"
        />
        <div class="product-info-details">
            <p class="product-info-category">${escapeHtml(categoryName)}</p>
            <h2 class="product-info-title" title="${escapeHtml(product.title)}">${escapeHtml(product.title)}</h2>
            <p class="product-info-price">$${price}</p>
        </div>
        ${trendingHtml}
    `;
}

// =============================================
// 5. RENDER: MÉTRICAS
// =============================================

/**
 * renderMetrics(stats)
 * Genera las 4 tarjetas de métricas en #metrics-grid.
 *
 * Para agregar métricas: añadir objetos al array 'metrics'.
 * Para cambiar iconos: modificar el SVG en el campo 'icon'.
 *
 * @param {Object} stats - { views, purchases, revenue, isTrending }
 */
function renderMetrics(stats) {
    const grid = document.getElementById('metrics-grid');

    const metrics = [
        {
            label:    'Vistas',
            value:    stats.views.toLocaleString('es-ES'),
            sublabel: 'vistas totales',
            iconColor:'metric-icon--blue',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                     <path d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="1.8"/>
                     <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/>
                   </svg>`
        },
        {
            label:    'Compras',
            value:    stats.purchases.toLocaleString('es-ES'),
            sublabel: 'ventas simuladas',
            iconColor:'metric-icon--green',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                     <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                   </svg>`
        },
        {
            label:    'Estado',
            value:    stats.isTrending ? 'Trending' : 'Activo',
            sublabel: stats.isTrending ? 'en tendencia' : 'publicado',
            iconColor: stats.isTrending ? 'metric-icon--yellow' : 'metric-icon--blue',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                     <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                     <polyline points="16 7 22 7 22 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                   </svg>`
        },
        {
            label:    'Ingresos',
            value:    `$${stats.revenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sublabel: 'ingresos simulados',
            iconColor:'metric-icon--purple',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                     <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                     <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                   </svg>`
        }
    ];

    grid.innerHTML = metrics.map((m, i) => `
        <div class="metric-card" style="animation-delay:${i * 0.08}s">
            <div class="metric-icon ${m.iconColor}">${m.icon}</div>
            <p class="metric-label">${m.label}</p>
            <p class="metric-value">${m.value}</p>
            <p class="metric-sublabel">${m.sublabel}</p>
        </div>
    `).join('');
}

// =============================================
// 6. RENDER: GRÁFICO SVG
// =============================================

/**
 * renderChart(chartData)
 * Genera un gráfico de línea con área rellena en SVG puro.
 *
 * No depende de ninguna librería externa.
 *
 * ESTRUCTURA DEL SVG:
 *   - defs: gradientes para la línea y el área
 *   - grilla horizontal
 *   - eje X con etiquetas de días
 *   - eje Y con etiquetas de valores
 *   - path del área rellena
 *   - path de la línea
 *   - círculos de puntos
 *
 * Para cambiar dimensiones: ajustar W, H, PADDING.
 * Para cambiar colores: ajustar los gradientes en <defs>.
 *
 * @param {Array<{label, value}>} chartData
 */
function renderChart(chartData) {
    const canvas = document.getElementById('chart-canvas');

    // Dimensiones del SVG (unidades abstractas, se escala con CSS)
    const W       = 900;
    const H       = 260;
    const PAD     = { top: 20, right: 20, bottom: 40, left: 45 };
    const plotW   = W - PAD.left - PAD.right;
    const plotH   = H - PAD.top  - PAD.bottom;

    // Rango de valores
    const maxVal  = Math.max(...chartData.map(d => d.value), 10);
    const minVal  = 0;
    const range   = maxVal - minVal || 1;

    const n       = chartData.length;

    // Función para convertir un índice a coordenada X
    const xOf = i => PAD.left + (i / (n - 1)) * plotW;

    // Función para convertir un valor a coordenada Y (invertido: 0 arriba en SVG)
    const yOf = v => PAD.top + plotH - ((v - minVal) / range) * plotH;

    // Construir el string de puntos para la línea
    const linePoints = chartData.map((d, i) => `${xOf(i)},${yOf(d.value)}`).join(' ');

    // Construir el path del área (línea + cierre hacia abajo)
    const areaPath =
        `M ${xOf(0)},${yOf(chartData[0].value)} ` +
        chartData.slice(1).map((d, i) => `L ${xOf(i + 1)},${yOf(d.value)}`).join(' ') +
        ` L ${xOf(n - 1)},${PAD.top + plotH} L ${xOf(0)},${PAD.top + plotH} Z`;

    // Línea suavizada con curvas cúbicas de Bezier
    function smoothLine(points) {
        if (points.length < 2) return '';
        let d = `M ${points[0][0]},${points[0][1]}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpx  = (prev[0] + curr[0]) / 2;
            d += ` C ${cpx},${prev[1]} ${cpx},${curr[1]} ${curr[0]},${curr[1]}`;
        }
        return d;
    }

    const coords     = chartData.map((d, i) => [xOf(i), yOf(d.value)]);
    const smoothPath = smoothLine(coords);

    // Área suavizada (misma lógica + cierre)
    const smoothArea = smoothPath +
        ` L ${xOf(n - 1)},${PAD.top + plotH} L ${xOf(0)},${PAD.top + plotH} Z`;

    // Grilla horizontal (4 líneas)
    const gridLines = [0.25, 0.5, 0.75, 1].map(frac => {
        const y     = PAD.top + plotH * (1 - frac);
        const label = Math.round(minVal + range * frac);
        return `
            <line class="chart-axis-line" x1="${PAD.left}" y1="${y}" x2="${W - PAD.right}" y2="${y}"/>
            <text class="chart-axis-label" x="${PAD.left - 8}" y="${y + 4}" text-anchor="end">${label}</text>
        `;
    }).join('');

    // Etiquetas del eje X (solo cada 2 días para no amontonar)
    const xLabels = chartData.map((d, i) => {
        if (i % 2 !== 0) return '';
        return `<text class="chart-axis-label" x="${xOf(i)}" y="${H - 6}" text-anchor="middle">${d.label}</text>`;
    }).join('');

    // Puntos del gráfico
    const dots = chartData.map((d, i) => `
        <circle class="chart-dot" cx="${xOf(i)}" cy="${yOf(d.value)}" r="4">
            <title>${d.label}: ${d.value} vistas</title>
        </circle>
    `).join('');

    // SVG completo
    canvas.innerHTML = `
        <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <!-- Gradiente para el área rellena -->
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stop-color="#a8d8ff" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="#a8d8ff" stop-opacity="0"/>
                </linearGradient>
                <!-- Gradiente para la línea (izquierda a derecha) -->
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stop-color="#4968ff"/>
                    <stop offset="100%" stop-color="#a8d8ff"/>
                </linearGradient>
            </defs>

            <!-- Grilla y etiquetas Y -->
            ${gridLines}

            <!-- Línea base del eje X -->
            <line class="chart-axis-line"
                x1="${PAD.left}" y1="${PAD.top + plotH}"
                x2="${W - PAD.right}" y2="${PAD.top + plotH}"/>

            <!-- Etiquetas eje X -->
            ${xLabels}

            <!-- Área bajo la curva -->
            <path class="chart-area" d="${smoothArea}"/>

            <!-- Línea suavizada -->
            <path class="chart-line" d="${smoothPath}"/>

            <!-- Puntos interactivos -->
            ${dots}
        </svg>
    `;

    // Badge de tendencia: comparar primera mitad vs segunda mitad
    const firstHalf  = chartData.slice(0, 7).reduce((s, d) => s + d.value, 0);
    const secondHalf = chartData.slice(7).reduce((s, d) => s + d.value, 0);
    const badge      = document.getElementById('chart-trend-badge');

    if (firstHalf > 0) {
        const pct = Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
        const sign = pct >= 0 ? '+' : '';
        badge.textContent = `${sign}${pct}% vs semana anterior`;
        if (pct < 0) {
            badge.style.background = 'rgba(239,68,68,0.1)';
            badge.style.borderColor= 'rgba(239,68,68,0.2)';
            badge.style.color      = '#f87171';
        }
    } else {
        badge.textContent = 'Datos insuficientes';
    }
}

// =============================================
// 7. RENDER: ACTIVIDAD RECIENTE
// =============================================

/**
 * renderActivity(activity)
 * Genera los ítems de la lista de actividad reciente.
 * Cada item tiene un punto de color, texto y tiempo.
 *
 * Para agregar tipos: añadir en generateActivity() y
 * asegurarse de que el tipo tenga clase .activity-dot--TIPO en CSS.
 *
 * @param {Array<{type, text, time}>} activity
 */
function renderActivity(activity) {
    const list = document.getElementById('activity-list');

    list.innerHTML = activity.map((item, i) => `
        <li class="activity-item" style="animation-delay:${i * 0.07}s">
            <span class="activity-dot activity-dot--${item.type}"></span>
            <span class="activity-text">${item.text}</span>
            <span class="activity-time">${item.time}</span>
        </li>
    `).join('');
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
// 8. INICIALIZACIÓN
// =============================================

document.addEventListener('DOMContentLoaded', function () {
    // 1. Leer el ID del producto desde la URL (?id=...)
    const productId = getIdFromUrl();

    const loadingEl = document.getElementById('loading-state');
    const errorEl   = document.getElementById('error-state');
    const mainEl    = document.getElementById('stats-main');

    // 2. Si no hay ID válido en la URL → mostrar error
    if (!productId) {
        loadingEl.style.display = 'none';
        errorEl.style.display   = 'flex';
        return;
    }

    // 3. Buscar el producto en localStorage
    const product = getProductById(productId);

    // 4. Si no se encuentra el producto → mostrar error
    if (!product) {
        loadingEl.style.display = 'none';
        errorEl.style.display   = 'flex';
        return;
    }

    // 5. Producto encontrado: ocultar carga, mostrar contenido
    loadingEl.style.display = 'none';
    mainEl.style.display    = 'block';

    // 6. Actualizar el <title> de la página con el nombre del producto
    document.title = `${product.title} — Estadísticas · Zuno`;

    // 7. Generar estadísticas y datos del gráfico
    const stats     = generateSimulatedStats(product);
    const chartData = generateChartData(stats.views, product.id);
    const activity  = generateActivity(stats, product);

    // 8. Renderizar todas las secciones
    renderProductInfo(product);   // Imagen + título + precio en el header
    renderMetrics(stats);          // 4 tarjetas: vistas, compras, estado, ingresos
    renderChart(chartData);        // Gráfico SVG de línea
    renderActivity(activity);      // Lista de eventos recientes
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
