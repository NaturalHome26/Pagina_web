/* =========================================================
   FILTROS Y BÚSQUEDA
========================================================= */

// Detectar si es dispositivo móvil
function esMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// Configurar filtros activos
function setupFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoria = urlParams.get('categoria');

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (categoria) {
        const activeBtn = document.querySelector(`.filter-btn[onclick*="${categoria}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    } else {
        const allBtn = document.querySelector('.filter-btn[onclick*="todas"]');
        if (allBtn) allBtn.classList.add('active');
    }
}

// Filtrar por categoría
function filtrar(categoria) {
    const url = new URL(window.location);

    if (categoria === 'todas') {
        url.searchParams.delete('categoria');
    } else {
        url.searchParams.set('categoria', categoria);
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value) {
        url.searchParams.set('q', searchInput.value);
    }

    window.location.href = url.toString();
}

// Búsqueda en tiempo real (opcional)
function buscarProductos() {
    const q = document.getElementById("searchInput").value.toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const nombre = card.dataset.nombre;
        card.style.display = nombre.includes(q) ? "block" : "none";
    });
}

// Inicializar filtros al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    setupFilters();
    
    // Configurar búsqueda en tiempo real si existe el input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', buscarProductos);
    }
});