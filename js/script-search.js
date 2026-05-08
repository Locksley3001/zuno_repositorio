// script-search.js - Busqueda inteligente y compartida de productos Zuno
// Mantiene intactos los inputs existentes; solo conecta su comportamiento funcional.
// Para ajustar el debounce: cambiar SEARCH_DEBOUNCE_MS.

const SEARCH_DEBOUNCE_MS = 180;
const SEARCH_QUERY_PARAM = 'q';
const SEARCH_PRODUCT_STORAGE_KEY = 'zuno-products';
const SEARCH_RESULT_MESSAGE = 'No se encontraron productos relacionados';
const SEARCH_SHORT_TERMS = new Set(['ia', 'ai', 'ux', 'ui', 'ml']);
const SEARCH_STOP_WORDS = new Set(['a', 'al', 'de', 'del', 'el', 'en', 'la', 'las', 'lo', 'los', 'no', 'o', 'para', 'por', 'que', 'un', 'una', 'y']);

// Campos analizados por producto. Se agrego aiTool y una categoria legible para que
// la busqueda no dependa solo del titulo exacto.
const searchFields = ['title', 'description', 'category', 'categoryName', 'aiTool'];

// Diccionario semantico: no hardcodea productos, solo relaciona intenciones de busqueda
// con palabras que pueden aparecer en productos futuros. Para agregar nuevas palabras
// clave, sumar terminos al grupo correspondiente o crear un grupo nuevo.
const SEARCH_KEYWORD_GROUPS = [
    ['redes sociales', 'redes', 'social', 'instagram', 'tiktok', 'facebook', 'reels', 'viral', 'virales', 'contenido', 'calendario', 'post', 'posts', 'stories', 'social media'],
    ['ropa', 'moda', 'camiseta', 'camisetas', 'camisa', 'prenda', 'prendas', 'vestuario', 'outfit', 'textil', 'modelo', 'modelos', 'indumentaria'],
    ['logo', 'logos', 'marca', 'branding', 'identidad', 'startup', 'empresa'],
    ['marketing', 'publicidad', 'campana', 'campanas', 'ads', 'anuncios', 'ventas', 'estrategia'],
    ['web', 'website', 'pagina', 'landing', 'ux', 'ui', 'responsive', 'interfaz', 'diseno web'],
    ['video', 'videos', 'script', 'guion', 'reel', 'corporativo', 'produccion'],
    ['ia', 'ai', 'inteligencia artificial', 'machine learning', 'ml', 'modelo', 'modelos', 'chatgpt', 'claude', 'gemini', 'midjourney', 'dall-e', 'dalle'],
    ['negocio', 'negocios', 'business', 'plan', 'empresa', 'emprendimiento'],
    ['creativo', 'creativa', 'creatividad', 'ideas', 'proyecto', 'proyectos']
];

let searchTimeout;
let currentSearchTerm = '';
let currentCategoryFilter = null;
let isSyncingSearchInputs = false;

// Normaliza texto para comparar de forma flexible: minusculas, sin acentos,
// sin caracteres especiales repetidos y con espacios compactados.
function normalizeSearchText(value) {
    return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function tokenizeSearchText(value) {
    return normalizeSearchText(value)
        .split(' ')
        .filter(token => token && !SEARCH_STOP_WORDS.has(token));
}

function isRelevantSearchTerm(term) {
    return SEARCH_SHORT_TERMS.has(term) || term.length > 2;
}
function isQueryRelatedToTerm(normalizedQuery, queryTokens, term) {
    if (!term) return false;

    // Terminos cortos como ia/ai/ux solo cuentan como palabra completa;
    // esto evita que "social" active IA por contener la subcadena "ia".
    if (SEARCH_SHORT_TERMS.has(term)) {
        return queryTokens.includes(term);
    }

    return normalizedQuery.includes(term) || term.includes(normalizedQuery);
}

function getCategoryName(categoryId) {
    if (typeof categories === 'undefined') return categoryId || '';
    const match = categories.find(category => category.id === categoryId);
    return match ? match.name : (categoryId || '');
}

// Lee productos dinamicamente: primero localStorage para incluir productos creados
// o editados; si no existe, usa el array global products ya cargado por script-shop.js.
function getSearchProducts() {
    try {
        const stored = localStorage.getItem(SEARCH_PRODUCT_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (error) {
        console.warn('[Zuno] No se pudieron leer productos para busqueda:', error);
    }

    return Array.isArray(window.products) ? window.products : (typeof products !== 'undefined' ? products : []);
}

function buildProductSearchText(product) {
    const categoryName = getCategoryName(product.category);
    return searchFields
        .map(field => field === 'categoryName' ? categoryName : product[field])
        .join(' ');
}

// Expande una consulta con palabras relacionadas. Ejemplo: "redes sociales"
// tambien prueba instagram, tiktok, viral, calendario, etc. Esto permite
// coincidencias similares y parciales sin depender del titulo exacto.
function expandSearchTerms(query) {
    const normalizedQuery = normalizeSearchText(query);
    const queryTokens = tokenizeSearchText(normalizedQuery);
    const expanded = new Set(queryTokens);

    if (normalizedQuery) expanded.add(normalizedQuery);

    SEARCH_KEYWORD_GROUPS.forEach(group => {
        const normalizedGroup = group.map(normalizeSearchText);
        const matchesGroup = normalizedGroup.some(term =>
            isQueryRelatedToTerm(normalizedQuery, queryTokens, term)
        );

        if (matchesGroup) {
            normalizedGroup.forEach(term => {
                tokenizeSearchText(term).forEach(token => expanded.add(token));
                if (term) expanded.add(term);
            });
        }
    });

    // Se descartan conectores cortos como "no" o "de" para evitar falsos positivos.
    // Terminos cortos utiles como IA/AI/UX/UI se conservan en SEARCH_SHORT_TERMS.
    return Array.from(expanded).filter(isRelevantSearchTerm);
}

function productTextMatchesTerm(productText, productTokens, term) {
    if (SEARCH_SHORT_TERMS.has(term)) {
        return productTokens.includes(term);
    }

    return productText.includes(term) || productTokens.some(token => token.includes(term));
}

function productMatchesSearch(product, query) {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return true;

    const productText = normalizeSearchText(buildProductSearchText(product));
    const expandedTerms = expandSearchTerms(normalizedQuery);

    const productTokens = tokenizeSearchText(productText);

    // Coincidencia directa por frase o coincidencia parcial por token relevante.
    // La comparacion parcial usa token.includes(term): asi "model" encuentra "modelos"
    // sin que frases largas arrastren productos por tokens pequenos contenidos dentro de ellas.
    return productText.includes(normalizedQuery) || expandedTerms.some(term =>
        productTextMatchesTerm(productText, productTokens, term)
    );
}

function scoreSearchProduct(product, query) {
    const normalizedQuery = normalizeSearchText(query);
    const productText = normalizeSearchText(buildProductSearchText(product));
    const titleText = normalizeSearchText(product.title);
    const expandedTerms = expandSearchTerms(normalizedQuery);
    let score = 0;

    if (titleText.includes(normalizedQuery)) score += 12;
    if (productText.includes(normalizedQuery)) score += 8;

    const productTokens = tokenizeSearchText(productText);
    const titleTokens = tokenizeSearchText(titleText);

    expandedTerms.forEach(term => {
        if (productTextMatchesTerm(titleText, titleTokens, term)) score += 4;
        if (productTextMatchesTerm(productText, productTokens, term)) score += 2;
    });

    return score;
}

function getSearchTargetGrid() {
    return document.getElementById('explore-grid') || document.getElementById('trending-grid');
}

function getSearchResultsContainer() {
    const grid = getSearchTargetGrid();
    return grid ? grid.closest('section') || grid.parentElement : null;
}

function canRenderSearchOnCurrentPage() {
    return Boolean(getSearchTargetGrid() && typeof renderProducts === 'function');
}

function syncSearchInputs(value, sourceInput) {
    if (isSyncingSearchInputs) return;
    isSyncingSearchInputs = true;

    document.querySelectorAll('#main-search-input, #navbar-search').forEach(input => {
        if (input !== sourceInput) input.value = value;
    });

    isSyncingSearchInputs = false;
}

function updateSearchUrl(query) {
    if (!canRenderSearchOnCurrentPage()) return;
    const url = new URL(window.location.href);

    if (query) {
        url.searchParams.set(SEARCH_QUERY_PARAM, query);
    } else {
        url.searchParams.delete(SEARCH_QUERY_PARAM);
    }

    window.history.replaceState({}, '', url);
}

function navigateToShopSearch(query) {
    const normalizedQuery = String(query || '').trim();
    if (!normalizedQuery) return;
    window.location.href = `./shop.html?${SEARCH_QUERY_PARAM}=${encodeURIComponent(normalizedQuery)}`;
}

function performSearch(searchTerm, options = {}) {
    clearTimeout(searchTimeout);
    currentSearchTerm = String(searchTerm || '').trim();

    syncSearchInputs(currentSearchTerm, options.sourceInput || null);

    if (!canRenderSearchOnCurrentPage()) {
        if (options.submit) navigateToShopSearch(currentSearchTerm);
        return;
    }

    const delay = options.immediate ? 0 : SEARCH_DEBOUNCE_MS;
    searchTimeout = setTimeout(() => {
        filterProducts();
    }, delay);
}

function restoreDefaultProducts() {
    const allProducts = getSearchProducts();
    const targetGrid = getSearchTargetGrid();
    if (!targetGrid || typeof renderProducts !== 'function') return;

    // Si una pagina de categoria tiene su propio render, se respeta al limpiar busqueda.
    if (typeof loadCategoryPage === 'function' && window.location.pathname.endsWith('category.html')) {
        loadCategoryPage();
        return;
    }

    if (targetGrid.id === 'trending-grid' && !document.getElementById('explore-grid')) {
        renderProducts(allProducts.filter(product => product.trending), 'trending-grid', true, 'trending');
        return;
    }

    renderProducts(allProducts, targetGrid.id);
}

function filterProducts() {
    const allProducts = getSearchProducts();
    const targetGrid = getSearchTargetGrid();
    if (!targetGrid) return;

    let filteredProducts = [...allProducts];

    if (currentSearchTerm) {
        filteredProducts = filteredProducts
            .filter(product => productMatchesSearch(product, currentSearchTerm))
            .sort((a, b) => scoreSearchProduct(b, currentSearchTerm) - scoreSearchProduct(a, currentSearchTerm));
    }

    if (currentCategoryFilter) {
        filteredProducts = filteredProducts.filter(product => product.category === currentCategoryFilter);
    }

    if (!currentSearchTerm && !currentCategoryFilter) {
        restoreDefaultProducts();
    } else {
        renderProducts(filteredProducts, targetGrid.id);
    }

    showNoResultsMessage(filteredProducts.length === 0 && Boolean(currentSearchTerm || currentCategoryFilter));
    updateSearchUrl(currentSearchTerm);
}

function showNoResultsMessage(show) {
    const container = getSearchResultsContainer();
    if (!container) return;

    let noResultsMsg = container.querySelector('.no-results');

    if (show) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results';
            // Mantiene la identidad visual existente: texto claro, espaciado amplio y sin tocar inputs.
            noResultsMsg.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: rgba(255, 255, 255, 0.7);">
                    <h3 style="margin-bottom: 16px; color: rgba(255, 255, 255, 0.9);">${SEARCH_RESULT_MESSAGE}</h3>
                    <p>Prueba con palabras relacionadas, categorias o la IA que quieres usar.</p>
                </div>
            `;
            container.appendChild(noResultsMsg);
        }
        noResultsMsg.style.display = 'block';
    } else if (noResultsMsg) {
        noResultsMsg.style.display = 'none';
    }
}

function setCategoryFilter(categoryId) {
    currentCategoryFilter = categoryId;
    filterProducts();

    const target = getSearchResultsContainer();
    if (target) target.scrollIntoView({ behavior: 'smooth' });
}

function clearFilters() {
    currentSearchTerm = '';
    currentCategoryFilter = null;
    syncSearchInputs('', null);
    restoreDefaultProducts();
    showNoResultsMessage(false);
    updateSearchUrl('');
}

function showSearchSuggestions() {
    // Las sugerencias visuales siguen en el HTML. La busqueda real usa productos dinamicos
    // y SEARCH_KEYWORD_GROUPS para ampliar coincidencias sin hardcodear productos.
}

function initializeSearchFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get(SEARCH_QUERY_PARAM) || '';
    if (!initialQuery) return;

    syncSearchInputs(initialQuery, null);
    performSearch(initialQuery, { immediate: true });
}

document.addEventListener('DOMContentLoaded', function() {
    const mainSearchInput = document.getElementById('main-search-input');
    const navbarSearchInput = document.getElementById('navbar-search');

    [mainSearchInput, navbarSearchInput].filter(Boolean).forEach(input => {
        input.addEventListener('input', function(e) {
            performSearch(e.target.value, { sourceInput: input });
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(e.target.value, { sourceInput: input, submit: true, immediate: true });
            }
        });
    });

    document.querySelectorAll('.main-search-btn, .search-btn').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const input = button.closest('.search-input-wrapper, .search-bar')?.querySelector('input');
            if (input) performSearch(input.value, { sourceInput: input, submit: true, immediate: true });
        });
    });

    if (mainSearchInput) {
        mainSearchInput.addEventListener('focus', showSearchSuggestions);
    }

    initializeSearchFromUrl();
});