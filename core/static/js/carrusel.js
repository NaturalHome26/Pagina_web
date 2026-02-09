/* =========================================================
   CARRUSEL DE DESCUENTOS - 1 PRODUCTO COMPLETO EN MÓVILES
   - Móviles: 1 producto centrado SIN mostrar pedazos de otros
   - PC/Tablet: Múltiples productos visibles
========================================================= */

let currentSlide = 0;
let slidesToShow = 4;
let totalSlides = 0;
let autoSlideInterval;
let isDragging = false;
let startPos = 0;
let startTranslate = 0;

// Calcular slides visibles según el ancho de pantalla
function calculateSlidesToShow() {
    const width = window.innerWidth;
    if (width < 576) {
        return 1; // Móviles: 1 producto completo
    } else if (width < 768) {
        return 2; // Tablets pequeñas: 2 productos
    } else if (width < 1024) {
        return 3; // Tablets: 3 productos
    }
    return 4; // Desktop: 4 productos
}

// Inicializar carrusel
function initCarousel() {
    const track = document.getElementById('carruselTrack');
    if (!track) return;

    const slides = Array.from(track.children);
    totalSlides = slides.length;
    
    if (totalSlides === 0) return;

    slidesToShow = calculateSlidesToShow();

    // Resetear el slide actual si está fuera de rango
    const maxSlide = Math.max(0, totalSlides - slidesToShow);
    if (currentSlide > maxSlide) {
        currentSlide = 0;
    }

    // CLAVE: En móviles (1 producto), usar 100% del contenedor
    // En otros tamaños, distribuir el espacio
    if (slidesToShow === 1) {
        // MÓVILES: Cada slide ocupa TODO el ancho del contenedor
        slides.forEach(slide => {
            slide.style.flex = '0 0 100%';
            slide.style.maxWidth = '100%';
            slide.style.minWidth = '100%';
            slide.style.width = '100%';
        });
    } else {
        // PC/TABLET: Distribuir el ancho entre slides visibles
        const slideWidth = 100 / slidesToShow;
        slides.forEach(slide => {
            slide.style.flex = `0 0 ${slideWidth}%`;
            slide.style.maxWidth = `${slideWidth}%`;
            slide.style.minWidth = `${slideWidth}%`;
            slide.style.width = `${slideWidth}%`;
        });
    }

    // Posicionar el carrusel sin animación inicial
    updateCarouselPosition(false);
    
    // Crear puntos de navegación
    createDots();

    // Configurar eventos táctiles
    setupTouchEvents(track);

    // Iniciar auto slide solo si hay más slides que los visibles
    if (totalSlides > slidesToShow) {
        startAutoSlide();
    }
}

// Crear puntos de navegación
function createDots() {
    const dotsContainer = document.getElementById('carruselDots');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = "";
    
    // Calcular número de puntos
    const maxSlide = Math.max(0, totalSlides - slidesToShow);
    const dotsCount = maxSlide + 1;
    
    for (let i = 0; i < dotsCount; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carrusel-dot';
        if (i === currentSlide) dot.classList.add('active');
        dot.innerHTML = '●';
        dot.setAttribute('aria-label', `Ir al producto ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
}

// Mover carrusel
function moveCarousel(direction) {
    const maxSlide = Math.max(0, totalSlides - slidesToShow);
    
    // Calcular nuevo slide
    let newSlide = currentSlide + direction;
    
    // Loop infinito
    if (newSlide > maxSlide) {
        newSlide = 0;
    } else if (newSlide < 0) {
        newSlide = maxSlide;
    }
    
    currentSlide = newSlide;
    
    updateCarouselPosition(true);
    updateDots();
    resetAutoSlide();
}

// Ir a slide específico
function goToSlide(slideIndex) {
    const maxSlide = Math.max(0, totalSlides - slidesToShow);
    
    if (slideIndex >= 0 && slideIndex <= maxSlide) {
        currentSlide = slideIndex;
        updateCarouselPosition(true);
        updateDots();
        resetAutoSlide();
    }
}

// Actualizar posición del carrusel
function updateCarouselPosition(animated = true) {
    const track = document.getElementById('carruselTrack');
    if (!track) return;

    // CLAVE: El cálculo depende del número de slides visibles
    let translateX;
    
    if (slidesToShow === 1) {
        // MÓVILES: Cada slide es 100% del ancho, más el gap
        // Necesitamos calcular el desplazamiento incluyendo los gaps
        const container = track.parentElement;
        const containerWidth = container.offsetWidth;
        const gap = 10; // gap en px para móviles (debe coincidir con CSS)
        
        // Desplazamiento = (ancho del contenedor + gap) * índice del slide
        const displacement = (containerWidth + gap) * currentSlide;
        const translatePercentage = (displacement / containerWidth) * 100;
        translateX = translatePercentage;
    } else {
        // PC/TABLET: Cálculo estándar por porcentaje
        const slidePercentage = 100 / slidesToShow;
        translateX = currentSlide * slidePercentage;
    }
    
    // Aplicar transición
    track.style.transition = animated ? 
        'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 
        'none';
    
    // Aplicar transformación
    track.style.transform = `translateX(-${translateX}%)`;
    
    // Forzar repaint para evitar glitches
    if (!animated) {
        void track.offsetWidth;
    }
}

// Actualizar puntos de navegación
function updateDots() {
    const dots = document.querySelectorAll('#carruselDots .carrusel-dot');
    if (dots.length === 0) return;
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// Configurar eventos táctiles
function setupTouchEvents(track) {
    if (!track) return;

    // Limpiar eventos previos
    const events = ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'mousedown', 'mousemove', 'mouseup', 'mouseleave'];
    events.forEach(event => {
        const oldHandler = track[`_${event}Handler`];
        if (oldHandler) {
            track.removeEventListener(event, oldHandler);
        }
    });
    
    // Crear handlers
    const handlers = {
        touchstart: (e) => touchStart(e),
        touchmove: (e) => touchMove(e),
        touchend: (e) => touchEnd(e),
        touchcancel: (e) => touchEnd(e),
        mousedown: (e) => touchStart(e),
        mousemove: (e) => touchMove(e),
        mouseup: (e) => touchEnd(e),
        mouseleave: (e) => touchEnd(e)
    };
    
    // Agregar eventos
    track._touchstartHandler = handlers.touchstart;
    track._touchmoveHandler = handlers.touchmove;
    track._touchendHandler = handlers.touchend;
    track._touchcancelHandler = handlers.touchcancel;
    track._mousedownHandler = handlers.mousedown;
    track._mousemoveHandler = handlers.mousemove;
    track._mouseupHandler = handlers.mouseup;
    track._mouseleaveHandler = handlers.mouseleave;
    
    track.addEventListener('touchstart', handlers.touchstart, { passive: true });
    track.addEventListener('touchmove', handlers.touchmove, { passive: false });
    track.addEventListener('touchend', handlers.touchend);
    track.addEventListener('touchcancel', handlers.touchcancel);
    track.addEventListener('mousedown', handlers.mousedown);
    track.addEventListener('mousemove', handlers.mousemove);
    track.addEventListener('mouseup', handlers.mouseup);
    track.addEventListener('mouseleave', handlers.mouseleave);
}

function touchStart(event) {
    if (event.type === 'mousedown' && event.button !== 0) return;
    
    isDragging = true;
    startPos = getPositionX(event);
    
    const track = document.getElementById('carruselTrack');
    if (track) {
        // Guardar la posición ACTUAL exacta
        if (slidesToShow === 1) {
            const container = track.parentElement;
            const containerWidth = container.offsetWidth;
            const gap = 10;
            const displacement = (containerWidth + gap) * currentSlide;
            startTranslate = (displacement / containerWidth) * 100;
        } else {
            const slidePercentage = 100 / slidesToShow;
            startTranslate = currentSlide * slidePercentage;
        }
        
        track.style.transition = 'none';
        track.style.cursor = 'grabbing';
    }
    
    if (event.type === 'mousedown') {
        event.preventDefault();
    }
}

function touchMove(event) {
    if (!isDragging) return;
    
    const track = document.getElementById('carruselTrack');
    if (!track) return;
    
    const currentPosition = getPositionX(event);
    const diff = currentPosition - startPos;
    
    // Calcular desplazamiento como porcentaje
    const trackWidth = track.offsetWidth;
    const diffPercentage = (diff / trackWidth) * 100;
    
    // Nueva posición = posición inicial - diferencia
    let newTranslate = startTranslate - diffPercentage;
    
    // Límites
    let maxTranslate;
    if (slidesToShow === 1) {
        const container = track.parentElement;
        const containerWidth = container.offsetWidth;
        const gap = 10;
        const displacement = (containerWidth + gap) * (totalSlides - 1);
        maxTranslate = (displacement / containerWidth) * 100;
    } else {
        const slidePercentage = 100 / slidesToShow;
        maxTranslate = (totalSlides - slidesToShow) * slidePercentage;
    }
    
    // Aplicar límites con resistencia
    if (newTranslate < 0) {
        newTranslate = newTranslate * 0.3;
    } else if (newTranslate > maxTranslate) {
        newTranslate = maxTranslate + (newTranslate - maxTranslate) * 0.3;
    }
    
    track.style.transform = `translateX(-${newTranslate}%)`;
    
    // Prevenir scroll en móviles
    if (event.type === 'touchmove' && Math.abs(diff) > 10) {
        event.preventDefault();
    }
}

function touchEnd(event) {
    if (!isDragging) return;
    
    isDragging = false;
    const track = document.getElementById('carruselTrack');
    if (!track) return;
    
    track.style.cursor = 'grab';
    
    const currentPosition = getPositionX(event);
    const diff = currentPosition - startPos;
    const trackWidth = track.offsetWidth;
    
    // Calcular cuánto se movió
    let slideWidth;
    if (slidesToShow === 1) {
        slideWidth = trackWidth; // En móviles, cada slide es el ancho completo
    } else {
        slideWidth = trackWidth / slidesToShow;
    }
    
    const movedSlides = diff / slideWidth;
    
    // Umbral: 30% de un slide
    const threshold = 0.3;
    
    if (Math.abs(movedSlides) > threshold) {
        if (movedSlides > 0) {
            // Arrastró hacia la derecha -> anterior
            moveCarousel(-1);
        } else {
            // Arrastró hacia la izquierda -> siguiente
            moveCarousel(1);
        }
    } else {
        // No alcanzó el umbral, volver a la posición actual
        updateCarouselPosition(true);
    }
}

function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : (event.touches && event.touches[0] ? event.touches[0].clientX : 0);
}

// Auto slide
function startAutoSlide() {
    // Limpiar intervalo anterior
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
    
    if (totalSlides <= slidesToShow) return;
    
    autoSlideInterval = setInterval(() => {
        moveCarousel(1);
    }, 4000);
}

function resetAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }
}

// Manejar redimensionamiento
function handleResize() {
    const oldSlidesToShow = slidesToShow;
    slidesToShow = calculateSlidesToShow();
    
    if (oldSlidesToShow !== slidesToShow) {
        // Ajustar currentSlide para que esté dentro de los límites
        const maxSlide = Math.max(0, totalSlides - slidesToShow);
        if (currentSlide > maxSlide) {
            currentSlide = maxSlide;
        }
        
        // Reinicializar
        initCarousel();
    }
}

// Detener animaciones cuando la pestaña no está visible
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
    } else {
        if (totalSlides > slidesToShow) {
            startAutoSlide();
        }
    }
});

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que todo esté renderizado
    setTimeout(() => {
        initCarousel();
    }, 100);
    
    // Redimensionamiento con debounce
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResize, 250);
    });
    
    // Pausar auto slide al hacer hover (solo desktop)
    const carrusel = document.querySelector('.carrusel-descuentos');
    if (carrusel && window.innerWidth >= 768) {
        carrusel.addEventListener('mouseenter', () => {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
            }
        });
        
        carrusel.addEventListener('mouseleave', () => {
            if (totalSlides > slidesToShow) {
                startAutoSlide();
            }
        });
    }
});

// Exportar funciones
window.initCarousel = initCarousel;
window.moveCarousel = moveCarousel;
window.goToSlide = goToSlide;