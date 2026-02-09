/* =========================================================
   MODAL DE PRODUCTO CON CARRUSEL DE IMÁGENES
========================================================= */

let productoActual = null;
let esFraccionado = false;
let unidadProducto = '';
let currentImageIndex = 0;
let totalImages = 0;
let todasLasImagenes = [];

// Detectar si es dispositivo móvil
function esMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// Funciones para el carrusel de imágenes
function nextImage() {
    if (totalImages <= 1) return;
    currentImageIndex = (currentImageIndex + 1) % totalImages;
    updateImageCarousel();
}

function prevImage() {
    if (totalImages <= 1) return;
    currentImageIndex = (currentImageIndex - 1 + totalImages) % totalImages;
    updateImageCarousel();
}

function setCurrentImage(index) {
    currentImageIndex = index;
    updateImageCarousel();
}

function updateImageCarousel() {
    const carouselTrack = document.getElementById('carouselTrackImages');
    const dots = document.querySelectorAll('.carousel-dot-image');
    const counter = document.getElementById('imageCounter');
    const prevBtn = document.querySelector('.prev-image');
    const nextBtn = document.querySelector('.next-image');
    
    if (carouselTrack) {
        // Mover el carrusel
        carouselTrack.style.transform = `translateX(-${currentImageIndex * 100}%)`;
        
        // Actualizar imágenes en el track
        carouselTrack.querySelectorAll('.carousel-slide-image').forEach((slide, index) => {
            slide.classList.toggle('active', index === currentImageIndex);
        });
    }
    
    // Actualizar dots activos
    if (dots) {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentImageIndex);
        });
    }
    
    // Actualizar contador
    if (counter && totalImages > 1) {
        counter.textContent = `${currentImageIndex + 1}/${totalImages}`;
        counter.style.display = 'block';
    }
    
    // Mostrar/ocultar botones de navegación
    if (prevBtn) prevBtn.style.display = totalImages > 1 ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = totalImages > 1 ? 'flex' : 'none';
}

// Crear carrusel de imágenes
function crearCarruselImagenes(imagenes) {
    const carouselTrack = document.getElementById('carouselTrackImages');
    const dotsContainer = document.getElementById('carouselDotsImages');
    
    if (!carouselTrack || !dotsContainer) return;
    
    // Limpiar contenedores
    carouselTrack.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    todasLasImagenes = imagenes;
    totalImages = imagenes.length;
    currentImageIndex = 0;
    
    // Si no hay imágenes, mostrar placeholder
    if (imagenes.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'carousel-slide-image';
        placeholder.innerHTML = `
            <div class="no-image-placeholder">
                <i class="fas fa-image"></i>
                <p>No hay imágenes disponibles</p>
            </div>
        `;
        carouselTrack.appendChild(placeholder);
        return;
    }
    
    // Crear slides para cada imagen
    imagenes.forEach((imgSrc, index) => {
        // Crear slide
        const slideDiv = document.createElement('div');
        slideDiv.className = 'carousel-slide-image';
        slideDiv.classList.toggle('active', index === 0);
        
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = productoActual ? productoActual.titulo : `Imagen ${index + 1}`;
        img.loading = 'lazy';
        
        // Manejar errores de carga
        img.onerror = function() {
            console.error(`Error cargando imagen: ${imgSrc}`);
            this.src = '/static/img/no-image.png';
            this.onerror = null; // Prevenir bucles infinitos
        };
        
        slideDiv.appendChild(img);
        carouselTrack.appendChild(slideDiv);
        
        // Crear dot para esta imagen
        if (imagenes.length > 1) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot-image';
            dot.type = 'button';
            dot.setAttribute('aria-label', `Ir a imagen ${index + 1}`);
            if (index === 0) dot.classList.add('active');
            dot.onclick = () => setCurrentImage(index);
            dotsContainer.appendChild(dot);
        }
    });
    
    // Asegurarse de que el carrusel esté en la posición correcta
    carouselTrack.style.transform = 'translateX(0%)';
    
    // Mostrar controles solo si hay más de una imagen
    const carouselContainer = document.getElementById('imageCarousel');
    const prevBtn = carouselContainer ? carouselContainer.querySelector('.prev-image') : null;
    const nextBtn = carouselContainer ? carouselContainer.querySelector('.next-image') : null;
    const counter = document.getElementById('imageCounter');
    const dots = document.getElementById('carouselDotsImages');
    
    if (imagenes.length > 1) {
        if (prevBtn) {
            prevBtn.style.display = 'flex';
            prevBtn.onclick = prevImage;
        }
        if (nextBtn) {
            nextBtn.style.display = 'flex';
            nextBtn.onclick = nextImage;
        }
        if (counter) {
            counter.style.display = 'block';
            counter.textContent = `1/${imagenes.length}`;
        }
        if (dots) dots.style.display = 'flex';
    } else {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (counter) counter.style.display = 'none';
        if (dots) dots.style.display = 'none';
    }
}

// Abrir modal de producto
function abrirProducto(id) {
    // Prevenir scroll en el body cuando el modal está abierto
    document.body.classList.add('modal-open');
    
    console.log(`Solicitando producto ID: ${id}`);
    
    fetch(`/api/producto/${id}/`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status}`);
            }
            return res.json();
        })
        .then(p => {
            console.log("Producto cargado:", p);
            console.log("Imágenes disponibles:", p.imagenes);
            
            productoActual = p;
            esFraccionado = (p.fraccionado === true && p.unidad === "kg");
            unidadProducto = p.unidad;
            
            // Configurar título
            document.getElementById('modalProductoTitulo').textContent = p.titulo;
            
            // Configurar carrusel de imágenes
            let imagenes = [];
            
            // Usar el array 'imagenes' si está disponible y no está vacío
            if (p.imagenes && Array.isArray(p.imagenes) && p.imagenes.length > 0) {
                imagenes = p.imagenes;
            } 
            // Si no hay imágenes en el array, usar la imagen principal
            else if (p.imagen) {
                imagenes = [p.imagen];
            }
            // Si no hay ninguna imagen, usar placeholder
            else {
                imagenes = ['https://via.placeholder.com/400x400?text=No+Image+Available'];
            }
            
            console.log("Imágenes a mostrar en carrusel:", imagenes);
            
            // Crear el carrusel
            crearCarruselImagenes(imagenes);
            
            // Configurar descripción
            const descEl = document.getElementById('modalProductoDescripcion');
            if (p.descripcion && p.descripcion.trim() !== '') {
                descEl.innerHTML = p.descripcion.replace(/\n/g, '<br>');
                descEl.style.display = 'block';
            } else {
                descEl.textContent = "Este producto no tiene descripción.";
                descEl.style.display = 'block';
            }
            
            // Configurar precio
            const precioEl = document.getElementById('modalProductoPrecio');
            precioEl.textContent = "$" + p.precio_final.toFixed(2);
            
            // Configurar unidad en el precio
            const unidadEl = document.getElementById('modalProductoUnidad');
            const unidadBadge = document.getElementById('modalUnidadBadge');
            
            const cantidadInput = document.getElementById('modalProductoCantidad');
            const unidadSuffix = document.getElementById('modalUnidadSuffix');
            const cantidadLabel = document.getElementById('cantidadLabelText');
            const cantidadPresets = document.getElementById('cantidadPresets');
            const cantidadLinea = document.querySelector('.cantidad-linea');
            
            // Limpiar presets anteriores
            if (cantidadPresets) cantidadPresets.innerHTML = '';
            
            // Configurar clases del contenedor de cantidad
            if (cantidadLinea) cantidadLinea.classList.remove('solo-kg', 'fraccionado');
            
            if (esFraccionado) {
                // PRODUCTO FRACCIONADO (kg -> gramos)
                unidadEl.textContent = "por kg";
                unidadBadge.textContent = "KILO";
                
                // Configurar input para gramos
                cantidadInput.min = 50;
                cantidadInput.max = 5000;
                cantidadInput.step = 50;
                cantidadInput.value = 500;
                
                // Ajustar etiqueta y sufijo
                cantidadLabel.textContent = "Cantidad";
                unidadSuffix.textContent = "g";
                cantidadLinea.classList.add('fraccionado');
                
                // Crear predefinidos para gramos
                const presetsGramos = [250, 500, 1000, 2000, 4000];
                presetsGramos.forEach(preset => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'cantidad-preset';
                    if (preset < 1000) {
                        button.textContent = preset + 'g';
                    } else {
                        button.textContent = (preset / 1000) + 'kg';
                    }
                    button.onclick = () => setCantidad(preset);
                    cantidadPresets.appendChild(button);
                });
                
                // Marcar el preset de 500g como activo por defecto
                setTimeout(() => {
                    document.querySelectorAll('.cantidad-preset').forEach(btn => {
                        if (btn.textContent === '500g') {
                            btn.classList.add('active');
                        }
                    });
                }, 10);
                
            } else {
                // PRODUCTO NO FRACCIONADO
                const unidadDisplay = p.unidad_display.toLowerCase();
                unidadEl.textContent = "por " + unidadDisplay;
                unidadBadge.textContent = p.unidad_display;
                
                // Configurar input según unidad
                cantidadInput.min = 1;
                cantidadInput.max = 100;
                cantidadInput.step = 1;
                cantidadInput.value = 1;
                
                // Ajustar sufijo según la unidad
                cantidadLabel.textContent = "Cantidad";
                
                if (p.unidad === "unidad") {
                    unidadSuffix.textContent = "unid";
                } else if (p.unidad === "kg") {
                    unidadSuffix.textContent = "kg";
                    cantidadLinea.classList.add('solo-kg');
                } else {
                    unidadSuffix.textContent = unidadDisplay.length > 6 ? 
                        unidadDisplay.substring(0, 5) + "." : unidadDisplay;
                }
                
                // Crear predefinidos para unidades
                const presetsUnidades = [1, 2, 3, 5, 10];
                presetsUnidades.forEach(preset => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'cantidad-preset';
                    button.textContent = preset;
                    button.onclick = () => setCantidad(preset);
                    cantidadPresets.appendChild(button);
                });
                
                // Marcar el preset de 1 como activo por defecto
                setTimeout(() => {
                    document.querySelectorAll('.cantidad-preset').forEach(btn => {
                        if (btn.textContent === '1') {
                            btn.classList.add('active');
                        }
                    });
                }, 10);
            }
            
            // Configurar botón agregar
            const btnAgregar = document.getElementById('modalProductoAgregar');
            btnAgregar.onclick = agregarProductoDesdeModal;
            
            // Mostrar modal
            const modal = document.getElementById('modalProducto');
            modal.style.display = "flex";
            
            // Animar la aparición
            setTimeout(() => {
                modal.querySelector('.modal-content').classList.add('visible');
            }, 10);
            
            // SOLO EN PC: Enfocar el input de cantidad
            setTimeout(() => {
                if (!esMobile()) {
                    cantidadInput.focus();
                    cantidadInput.select();
                }
            }, 100);
        })
        .catch(error => {
            console.error("Error al cargar producto:", error);
            mostrarNotificacion("Error al cargar el producto. Intente nuevamente.", "error");
            // Restaurar scroll si hay error
            document.body.classList.remove('modal-open');
        });
}

// Ajustar cantidad (+/-)
function ajustarCantidad(cambio) {
    const input = document.getElementById('modalProductoCantidad');
    const step = parseFloat(input.step) || 1;
    let valor = parseFloat(input.value) || parseFloat(input.min) || 1;
    
    valor += cambio * step;
    
    // Asegurar límites
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    
    if (valor < min) valor = min;
    if (valor > max) valor = max;
    
    // Para gramos (step = 50), ajustar al múltiplo más cercano
    if (step > 1) {
        valor = Math.round(valor / step) * step;
    }
    
    input.value = valor;
    
    // Actualizar botón preset activo
    actualizarPresetActivo(valor);
    
    // SOLO EN PC: Cambiar foco al input para mejor UX
    if (!esMobile()) {
        input.focus();
        input.select();
    }
}

// Establecer cantidad específica
function setCantidad(cantidad) {
    const input = document.getElementById('modalProductoCantidad');
    input.value = cantidad;
    
    // Actualizar estado activo de botones
    actualizarPresetActivo(cantidad);
    
    // SOLO EN PC: Cambiar foco al input para mejor UX
    if (!esMobile()) {
        input.focus();
        input.select();
    }
}

// Actualizar botón preset activo
function actualizarPresetActivo(cantidad) {
    document.querySelectorAll('.cantidad-preset').forEach(btn => {
        btn.classList.remove('active');
        
        // Obtener el valor numérico del botón
        const btnText = btn.textContent;
        let btnCantidad;
        
        if (btnText.includes('g') || btnText.includes('kg')) {
            // Es un botón de gramos
            if (btnText.includes('kg')) {
                btnCantidad = parseFloat(btnText.replace('kg', '')) * 1000;
            } else {
                btnCantidad = parseInt(btnText.replace('g', ''));
            }
        } else {
            // Es un botón de unidades
            btnCantidad = parseInt(btnText);
        }
        
        if (btnCantidad === cantidad) {
            btn.classList.add('active');
        }
    });
}

// Agregar producto desde modal
function agregarProductoDesdeModal() {
    if (!productoActual) return;
    
    const input = document.getElementById('modalProductoCantidad');
    let cantidad = parseFloat(input.value);
    
    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarNotificacion("Ingrese una cantidad válida.", "error");
        if (!esMobile()) {
            input.focus();
            input.select();
        }
        return;
    }
    
    let precioFinal;
    let cantidadDisplay;
    
    if (esFraccionado) {
        // Calcular precio proporcional (gramos a kg)
        precioFinal = (productoActual.precio_final * cantidad) / 1000;
        cantidadDisplay = cantidad >= 1000 ? `${cantidad/1000}kg` : `${cantidad}g`;
    } else {
        // Precio por unidad multiplicado por cantidad
        precioFinal = productoActual.precio_final * cantidad;
        cantidadDisplay = `${cantidad} ${productoActual.unidad_display}`;
    }
    
    // Llamar a función para agregar al carrito
    agregarAlCarrito(
        productoActual.id,
        productoActual.titulo,
        precioFinal,
        cantidad,
        esFraccionado,
        unidadProducto,
        true
    );
    
    // Mostrar confirmación con cantidad específica
    mostrarNotificacion(`¡Agregado! ${productoActual.titulo} (${cantidadDisplay})`, "success");
    
    cerrarProducto();
}

// Cerrar modal de producto
function cerrarProducto() {
    productoActual = null;
    todasLasImagenes = [];
    currentImageIndex = 0;
    totalImages = 0;
    
    const modal = document.getElementById('modalProducto');
    modal.querySelector('.modal-content').classList.remove('visible');
    
    setTimeout(() => {
        modal.style.display = "none";
        // Restaurar scroll del body
        document.body.classList.remove('modal-open');
        
        // Limpiar input
        const cantidadInput = document.getElementById('modalProductoCantidad');
        if (cantidadInput) cantidadInput.value = "1";
        
        // Limpiar presets activos
        document.querySelectorAll('.cantidad-preset').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Limpiar carrusel
        const carouselTrack = document.getElementById('carouselTrackImages');
        const dotsContainer = document.getElementById('carouselDotsImages');
        if (carouselTrack) carouselTrack.innerHTML = '';
        if (dotsContainer) dotsContainer.innerHTML = '';
    }, 300);
}

// Inicializar eventos
document.addEventListener('DOMContentLoaded', function() {
    const cantidadInput = document.getElementById('modalProductoCantidad');
    
    if (cantidadInput) {
        cantidadInput.addEventListener('input', function() {
            let valor = parseFloat(this.value);
            const min = parseFloat(this.min) || 1;
            const max = parseFloat(this.max) || 100;
            const step = parseFloat(this.step) || 1;
            
            if (isNaN(valor) || valor < min) {
                this.value = min;
            } else if (valor > max) {
                this.value = max;
            } else if (step > 1) {
                // Para gramos, ajustar al múltiplo más cercano de step
                valor = Math.round(valor / step) * step;
                this.value = valor;
            }
            
            // Actualizar preset activo
            actualizarPresetActivo(parseFloat(this.value));
        });
        
        cantidadInput.addEventListener('blur', function() {
            let valor = parseFloat(this.value);
            const min = parseFloat(this.min) || 1;
            
            if (isNaN(valor) || valor < min) {
                this.value = min;
                actualizarPresetActivo(min);
            }
        });
    }
    
    // Configurar eventos para navegación del carrusel
    const prevBtn = document.querySelector('.prev-image');
    const nextBtn = document.querySelector('.next-image');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevImage);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextImage);
    }
    
    // Cerrar modal producto al hacer clic fuera
    const modalProducto = document.getElementById('modalProducto');
    if (modalProducto) {
        modalProducto.addEventListener('click', function(e) {
            if (e.target === this) cerrarProducto();
        });
    }
    
    // También cerrar con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('modalProducto').style.display === 'flex') {
            cerrarProducto();
        }
    });
    
    // Eventos táctiles para el carrusel en móviles
    let touchStartX = 0;
    let touchEndX = 0;
    
    const carouselTrack = document.getElementById('carouselTrackImages');
    if (carouselTrack) {
        carouselTrack.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        carouselTrack.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Deslizamiento a la izquierda - siguiente imagen
                nextImage();
            } else {
                // Deslizamiento a la derecha - imagen anterior
                prevImage();
            }
        }
    }
});

// Mostrar notificación (función de apoyo)
function mostrarNotificacion(mensaje, tipo = "success") {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    
    // Agregar ícono según tipo
    let icono = '';
    if (tipo === "success") icono = '✓';
    if (tipo === "error") icono = '✗';
    if (tipo === "info") icono = 'ℹ';
    
    notificacion.innerHTML = `
        <span class="notificacion-icon">${icono}</span>
        <span class="notificacion-text">${mensaje}</span>
    `;
    
    // Agregar al body
    document.body.appendChild(notificacion);
    
    // Mostrar con animación
    setTimeout(() => {
        notificacion.classList.add('show');
    }, 10);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}