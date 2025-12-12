/* =========================================================
   CARRITO - SISTEMA COMPLETO CORREGIDO
   Problema resuelto: Cuando se agrega desde la tarjeta del producto,
   debe agregar 1kg (1000g), no 500 unidades
========================================================= */

// Si no existe en localStorage lo crea
function cargarCarrito() {
    let carrito = localStorage.getItem("carrito");

    if (!carrito) {
        localStorage.setItem("carrito", JSON.stringify([]));
        return [];
    }

    try {
        return JSON.parse(carrito);
    } catch (e) {
        localStorage.setItem("carrito", JSON.stringify([]));
        return [];
    }
}

function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContador();
}

/* =========================================================
   CONTADOR DEL CARRITO
========================================================= */
function actualizarContador() {
    const carrito = cargarCarrito();
    const total = carrito.length;
    const badge = document.getElementById("carritoCount");
    if (badge) badge.textContent = total;
}

/* =========================================================
   AGREGAR PRODUCTO AL CARRITO - CORREGIDO COMPLETAMENTE
   
   CASOS:
   1. Desde tarjeta del producto (add-to-cart-btn):
      - Si es fraccionado: agregar 1000g (1kg)
      - Si no es fraccionado: agregar 1 unidad
   
   2. Desde modal del producto (modalProductoAgregar):
      - Usa la cantidad ingresada por el usuario
========================================================= */
function agregarAlCarrito(id, titulo, precio, cantidad = 1, esFraccionado = false, unidad = "unidad", desdeModal = false) {
    cantidad = Number(cantidad);
    precio = Number(precio);

    const carrito = cargarCarrito();

    // IMPORTANTE: Cuando se agrega desde la tarjeta y es fraccionado, 
    // cantidad debe ser 1000g (1kg) no 500
    if (!desdeModal && esFraccionado && unidad === "kg") {
        cantidad = 1000; // 1kg = 1000g
    }
    
    // Si viene desde modal y es fraccionado, ya está en gramos (ej: 500g)
    // No necesitamos convertir nada

    // Buscar si ya existe el producto con las mismas características
    let item = carrito.find(p => 
        p.id == id && 
        p.esFraccionado === esFraccionado && 
        p.unidad === unidad
    );

    if (item) {
        // Si ya existe, sumar la cantidad
        item.cantidad += cantidad;
    } else {
        // Si no existe, agregarlo nuevo
        carrito.push({
            id: id,
            titulo: titulo,
            precio: precio,   // precio por unidad o por kg
            cantidad: cantidad,
            esFraccionado: esFraccionado,
            unidad: unidad
        });
    }

    guardarCarrito(carrito);
    mostrarCarrito();

    // Mensaje de confirmación
    let textoCantidad;
    if (esFraccionado && unidad === "kg") {
        // Mostrar en kg o g según corresponda
        if (cantidad >= 1000) {
            const kg = cantidad / 1000;
            textoCantidad = `${kg.toFixed(2)} kg`;  // Mostrar con 2 decimales
        } else {
            textoCantidad = `${cantidad} g`;
        }
    } else {
        textoCantidad = `${cantidad} ${unidad}`;
    }
    
    // Mostrar notificación
    mostrarNotificacion(`✓ ${titulo}<br><small>${textoCantidad} agregado al carrito</small>`);
}

/* =========================================================
   MOSTRAR CARRITO EN MODAL - DISEÑO MEJORADO
========================================================= */
function mostrarCarrito() {
    const lista = document.getElementById("listaCarrito");
    const totalSpan = document.getElementById("totalCarrito");
    const carritoVacioDiv = document.getElementById("carritoVacio");

    const carrito = cargarCarrito();

    if (!lista || !totalSpan) return;

    lista.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
        // Mostrar estado vacío
        if (carritoVacioDiv) carritoVacioDiv.style.display = "block";
        totalSpan.textContent = "$0.00";
        return;
    }

    if (carritoVacioDiv) carritoVacioDiv.style.display = "none";

    carrito.forEach((item, index) => {
        let subtotal = 0;
        let textoCantidad = "";
        let precioUnitarioTexto = "";

        if (item.esFraccionado && item.unidad === "kg") {
            // Producto fraccionado por peso (kg)
            const kg = item.cantidad / 1000; // Convertir gramos a kg
            subtotal = item.precio * kg;
            
            // Mostrar en formato legible
            if (item.cantidad >= 1000) {
                const kgDisplay = item.cantidad / 1000;
                textoCantidad = `${kgDisplay.toFixed(2)} kg`;
            } else {
                textoCantidad = `${item.cantidad} g`;
            }
            
            precioUnitarioTexto = `$${item.precio}/kg`;
        } else {
            // Producto por unidades
            subtotal = item.precio * item.cantidad;
            textoCantidad = `${item.cantidad} ${item.unidad}`;
            precioUnitarioTexto = `$${item.precio}/${item.unidad}`;
        }

        total += subtotal;

        const div = document.createElement("div");
        div.className = "carrito-item";
        
        // Determinar step para aumentar/disminuir
        const step = (item.esFraccionado && item.unidad === "kg") ? 100 : 1;

        div.innerHTML = `
            <div class="carrito-info">
                <h4>
                    ${item.titulo}
                    <span class="producto-id">#${item.id}</span>
                </h4>
                <div class="carrito-details">
                    <span class="cantidad-badge">${textoCantidad}</span>
                    <span class="precio-unit">a <span>${precioUnitarioTexto}</span></span>
                </div>
                <div class="carrito-subtotal">Subtotal: $${subtotal.toFixed(2)}</div>
            </div>
            
            <div class="carrito-actions">
                <button class="btn-minus" data-id="${item.id}" data-esfraccionado="${item.esFraccionado ? 1 : 0}" data-unidad="${item.unidad}">
                    <i class="fas fa-minus"></i>
                </button>
                <button class="btn-plus" data-id="${item.id}" data-esfraccionado="${item.esFraccionado ? 1 : 0}" data-unidad="${item.unidad}">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="btn-remove" data-id="${item.id}" data-esfraccionado="${item.esFraccionado ? 1 : 0}" data-unidad="${item.unidad}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        lista.appendChild(div);
    });

    // Configurar event listeners para los botones recién creados
    lista.querySelectorAll('.btn-minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            const esFraccionado = this.dataset.esfraccionado === '1';
            const unidad = this.dataset.unidad;
            const step = esFraccionado && unidad === "kg" ? 100 : 1;
            cambiarCantidad(id, step * -1, esFraccionado, unidad);
        });
    });

    lista.querySelectorAll('.btn-plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            const esFraccionado = this.dataset.esfraccionado === '1';
            const unidad = this.dataset.unidad;
            const step = esFraccionado && unidad === "kg" ? 100 : 1;
            cambiarCantidad(id, step, esFraccionado, unidad);
        });
    });

    lista.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            const esFraccionado = this.dataset.esfraccionado === '1';
            const unidad = this.dataset.unidad;
            eliminarItem(id, esFraccionado, unidad);
        });
    });

    totalSpan.textContent = "$" + total.toFixed(2);
}

/* =========================================================
   CAMBIAR CANTIDAD - CORREGIDO
========================================================= */
function cambiarCantidad(id, delta, esFraccionado, unidad) {
    const carrito = cargarCarrito();

    let item = carrito.find(p => 
        p.id == id && 
        p.esFraccionado === esFraccionado && 
        p.unidad === unidad
    );
    
    if (!item) return;

    item.cantidad += delta;

    // Para productos fraccionados, asegurar mínimo 50g
    if (esFraccionado && item.unidad === "kg") {
        if (item.cantidad < 50) item.cantidad = 50;
    } else {
        // Para productos por unidad, mínimo 1
        if (item.cantidad < 1) item.cantidad = 1;
    }

    guardarCarrito(carrito);
    mostrarCarrito();
}

/* =========================================================
   ELIMINAR PRODUCTO DEL CARRITO
========================================================= */
function eliminarItem(id, esFraccionado, unidad) {
    let carrito = cargarCarrito();
    
    carrito = carrito.filter(p => 
        !(p.id == id && p.esFraccionado === esFraccionado && p.unidad === unidad)
    );
    
    guardarCarrito(carrito);
    mostrarCarrito();
    
    mostrarNotificacion("✗ Producto eliminado del carrito");
}

/* =========================================================
   ABRIR / CERRAR MODAL DEL CARRITO
========================================================= */
function abrirCarrito() {
    mostrarCarrito();
    const modal = document.getElementById("modalCarrito");
    if (modal) {
        modal.style.display = "flex";
    }
}

function cerrarCarrito() {
    const modal = document.getElementById("modalCarrito");
    if (modal) {
        modal.style.display = "none";
    }
}

/* =========================================================
   NOTIFICACIONES
========================================================= */
function mostrarNotificacion(mensaje) {
    // Crear notificación
    const notif = document.createElement("div");
    notif.className = "notificacion";
    notif.innerHTML = mensaje;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1f8e3c 0%, #12b84e 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(31, 142, 60, 0.3);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        font-weight: 600;
        text-align: center;
    `;
    
    document.body.appendChild(notif);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notif.style.animation = "slideOutRight 0.3s ease";
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

/* =========================================================
   BUSCADOR
========================================================= */
function buscarProductos() {
    const q = document.getElementById("searchInput").value.toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const nombre = card.dataset.nombre;
        card.style.display = nombre.includes(q) ? "block" : "none";
    });
}
/* =========================================================
   MODAL DE PRODUCTO - VERSIÓN MEJORADA
========================================================= */

let productoActual = null;
let esFraccionado = false;
let unidadProducto = '';

function abrirProducto(id) {
    fetch(`/api/producto/${id}/`)
        .then(res => res.json())
        .then(p => {
            productoActual = p;
            esFraccionado = (p.fraccionado === true && p.unidad === "kg");
            unidadProducto = p.unidad;
            
            // Configurar título
            document.getElementById('modalProductoTitulo').textContent = p.titulo;
            
            // Configurar imagen
            const img = document.getElementById('modalProductoImagen');
            img.src = p.imagen;
            img.alt = p.titulo;
            img.onerror = function() {
                this.src = '{% static "img/no-image.png" %}';
            };
            
            // Configurar descripción
            const descEl = document.getElementById('modalProductoDescripcion');
            if (p.descripcion && p.descripcion.trim() !== '') {
                descEl.textContent = p.descripcion;
            } else {
                descEl.textContent = "Sin descripción disponible.";
            }
            
            // Configurar precio
            const precioEl = document.getElementById('modalProductoPrecio');
            precioEl.textContent = "$" + p.precio_final;
            
            // Configurar unidad en el precio
            const unidadEl = document.getElementById('modalProductoUnidad');
            const unidadBadge = document.getElementById('modalUnidadBadge');
            
            const cantidadInput = document.getElementById('modalProductoCantidad');
            const unidadSuffix = document.getElementById('modalUnidadSuffix');
            const cantidadLabel = document.getElementById('cantidadLabelText');
            const cantidadPresets = document.getElementById('cantidadPresets');
            
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
                unidadSuffix.style.fontSize = "14px"; // Texto más pequeño
                
                // Crear predefinidos para gramos
                const presetsGramos = [250, 500, 1000, 2000];
                cantidadPresets.innerHTML = '';
                presetsGramos.forEach(preset => {
                    const button = document.createElement('button');
                    button.className = 'preset-cantidad';
                    if (preset < 1000) {
                        button.textContent = preset + 'g';
                    } else {
                        button.textContent = (preset / 1000) + 'kg';
                    }
                    button.onclick = () => setCantidad(preset);
                    cantidadPresets.appendChild(button);
                });
                
            } else {
                // PRODUCTO NO FRACCIONADO (unidad, kg entero, etc.)
                const unidadDisplay = p.unidad_display.toLowerCase();
                unidadEl.textContent = "por " + unidadDisplay;
                unidadBadge.textContent = p.unidad_display;
                
                // Configurar input según unidad
                cantidadInput.min = 1;
                cantidadInput.max = 100;
                cantidadInput.step = 1;
                cantidadInput.value = 1;
                
                // Ajustar sufijo según la unidad - USAR NOMBRE CORTO
                cantidadLabel.textContent = "Cantidad";
                
                if (p.unidad === "unidad") {
                    unidadSuffix.textContent = "unid"; // Abreviado
                } else if (p.unidad === "kg") {
                    unidadSuffix.textContent = "kg";
                } else {
                    // Si es otro tipo de unidad, usar abreviación o nombre corto
                    unidadSuffix.textContent = unidadDisplay.length > 6 ? 
                        unidadDisplay.substring(0, 5) + "." : unidadDisplay;
                }
                
                unidadSuffix.style.fontSize = "13px"; // Texto más pequeño para caber
                
                // Crear predefinidos para unidades
                const presetsUnidades = [1, 2, 3, 5];
                cantidadPresets.innerHTML = '';
                presetsUnidades.forEach(preset => {
                    const button = document.createElement('button');
                    button.className = 'preset-cantidad';
                    button.textContent = preset;
                    button.onclick = () => setCantidad(preset);
                    cantidadPresets.appendChild(button);
                });
            }
            
            // Configurar botón agregar
            const btnAgregar = document.getElementById('modalProductoAgregar');
            btnAgregar.onclick = agregarProductoDesdeModal;
            
            // Mostrar modal
            document.getElementById('modalProducto').style.display = "flex";
        })
        .catch(error => {
            console.error("Error al cargar producto:", error);
            mostrarNotificacion("Error al cargar el producto. Intente nuevamente.", "error");
        });
}

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
}

function setCantidad(cantidad) {
    const input = document.getElementById('modalProductoCantidad');
    input.value = cantidad;
    
    // Actualizar estado activo de botones
    document.querySelectorAll('.preset-cantidad').forEach(btn => {
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

function agregarProductoDesdeModal() {
    if (!productoActual) return;
    
    const input = document.getElementById('modalProductoCantidad');
    let cantidad = parseFloat(input.value);
    
    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarNotificacion("Ingrese una cantidad válida.", "error");
        return;
    }
    
    let precioFinal;
    
    if (esFraccionado) {
        // Calcular precio proporcional (gramos a kg)
        precioFinal = (productoActual.precio_final * cantidad) / 1000;
    } else {
        // Precio por unidad multiplicado por cantidad
        precioFinal = productoActual.precio_final * cantidad;
    }
    
    // Llamar a tu función existente para agregar al carrito
    agregarAlCarrito(
        productoActual.id,
        productoActual.titulo,
        precioFinal,
        cantidad,
        esFraccionado,
        unidadProducto,
        true
    );
    
    cerrarProducto();
}

/* =========================================================
   VACIAR CARRITO COMPLETO
========================================================= */
function vaciarCarrito() {
    if (confirm("¿Está seguro de vaciar todo el carrito?")) {
        localStorage.setItem("carrito", JSON.stringify([]));
        actualizarContador();
        mostrarCarrito();
        mostrarNotificacion("Carrito vaciado");
    }
}

/* =========================================================
   INICIALIZACIÓN GENERAL
========================================================= */
document.addEventListener('DOMContentLoaded', function() {

    // Botón abrir carrito
    document.getElementById('btnAbrirCarrito')
        .addEventListener('click', abrirCarrito);

    // Inicializar carrito desde localStorage
    actualizarContador();

    // Cerrar modal al hacer clic fuera (solo para modal de carrito)
    document.getElementById('modalCarrito')
        .addEventListener('click', function(e) {
            if (e.target === this) cerrarCarrito();
        });

    // Cerrar modal producto al hacer clic fuera
    document.getElementById('modalProducto')
        .addEventListener('click', function(e) {
            if (e.target === this) cerrarProducto();
        });

    // Botón cerrar producto (USANDO EVENT LISTENER)
    document.getElementById('btnCerrarProducto')
        .addEventListener('click', cerrarProducto);

    setupFilters();
    initCarousel();
});

/* =========================================================
   FUNCIONES DE CIERRE
========================================================= */
function cerrarProducto(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    productoActual = null;
    document.getElementById('modalProducto').style.display = "none";
}

function cerrarCarrito(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    document.getElementById('modalCarrito').style.display = "none";
}

/* =========================================================
   FUNCIONES DE APERTURA
========================================================= */
function abrirCarrito(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    document.getElementById('modalCarrito').style.display = "flex";
    actualizarCarritoUI();
}

function abrirProducto(id) {
    // Previene múltiples aperturas si ya está abierto
    if (document.getElementById('modalProducto').style.display === "flex") {
        return;
    }
    
    fetch(`/api/producto/${id}/`)
        .then(res => res.json())
        .then(p => {
            productoActual = p;
            esFraccionado = (p.fraccionado === true && p.unidad === "kg");
            unidadProducto = p.unidad;
            
            // Configurar título
            document.getElementById('modalProductoTitulo').textContent = p.titulo;
            
            // Configurar imagen
            const img = document.getElementById('modalProductoImagen');
            img.src = p.imagen;
            img.alt = p.titulo;
            img.onerror = function() {
                this.src = '{% static "img/no-image.png" %}';
            };
            
            // Configurar descripción
            const descEl = document.getElementById('modalProductoDescripcion');
            if (p.descripcion && p.descripcion.trim() !== '') {
                descEl.textContent = p.descripcion;
            } else {
                descEl.textContent = "Sin descripción disponible.";
            }
            
            // Configurar precio
            const precioEl = document.getElementById('modalProductoPrecio');
            precioEl.textContent = "$" + p.precio_final;
            
            // Configurar unidad en el precio
            const unidadEl = document.getElementById('modalProductoUnidad');
            const unidadBadge = document.getElementById('modalUnidadBadge');
            
            const cantidadInput = document.getElementById('modalProductoCantidad');
            const unidadSuffix = document.getElementById('modalUnidadSuffix');
            const cantidadLabel = document.getElementById('cantidadLabelText');
            const cantidadPresets = document.getElementById('cantidadPresets');
            
            // Limpiar presets anteriores
            cantidadPresets.innerHTML = '';
            
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
                
                // Crear predefinidos para gramos
                const presetsGramos = [250, 500, 1000, 2000];
                presetsGramos.forEach(preset => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'preset-cantidad';
                    if (preset < 1000) {
                        button.textContent = preset + 'g';
                    } else {
                        button.textContent = (preset / 1000) + 'kg';
                    }
                    button.onclick = () => setCantidad(preset);
                    cantidadPresets.appendChild(button);
                });
                
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
                } else {
                    unidadSuffix.textContent = unidadDisplay.length > 6 ? 
                        unidadDisplay.substring(0, 5) + "." : unidadDisplay;
                }
                
                // Crear predefinidos para unidades
                const presetsUnidades = [1, 2, 3, 5];
                presetsUnidades.forEach(preset => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'preset-cantidad';
                    button.textContent = preset;
                    button.onclick = () => setCantidad(preset);
                    cantidadPresets.appendChild(button);
                });
            }
            
            // Configurar botón agregar
            const btnAgregar = document.getElementById('modalProductoAgregar');
            btnAgregar.onclick = agregarProductoDesdeModal;
            
            // Mostrar modal
            document.getElementById('modalProducto').style.display = "flex";
        })
        .catch(error => {
            console.error("Error al cargar producto:", error);
            mostrarNotificacion("Error al cargar el producto. Intente nuevamente.", "error");
        });
}

/* =========================================================
   FIN DEL ARCHIVO
========================================================= */