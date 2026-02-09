/* =========================================================
   CARRITO - SISTEMA COMPLETO
========================================================= */

// Detectar si es dispositivo móvil
function esMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// Cargar carrito desde localStorage
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

// Guardar carrito en localStorage
function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContador();
}

// Actualizar contador del carrito
function actualizarContador() {
    const carrito = cargarCarrito();
    const totalItems = carrito.length;
    const badge = document.getElementById("carritoCount");
    if (badge) badge.textContent = totalItems;
}

// Agregar producto al carrito
function agregarAlCarrito(id, titulo, precio, cantidad = 1, esFraccionado = false, unidad = "unidad", desdeModal = false) {
    cantidad = Number(cantidad);
    precio = Number(precio);

    const carrito = cargarCarrito();

    // IMPORTANTE: Cuando se agrega desde la tarjeta y es fraccionado, 
    // cantidad debe ser 1000g (1kg) no 500
    if (!desdeModal && esFraccionado && unidad === "kg") {
        cantidad = 1000; // 1kg = 1000g
    }
    
    // Buscar si ya existe el producto con las mismas características
    let item = carrito.find(p => 
        p.id == id && 
        p.esFraccionado === esFraccionado && 
        p.unidad === unidad
    );

    let esNuevoProducto = false;

    if (item) {
        // Si ya existe, sumar la cantidad
        item.cantidad += cantidad;
    } else {
        // Si no existe, agregarlo nuevo
        carrito.push({
            id: id,
            titulo: titulo,
            precio: precio,
            cantidad: cantidad,
            esFraccionado: esFraccionado,
            unidad: unidad
        });
        esNuevoProducto = true;
    }

    guardarCarrito(carrito);
    mostrarCarrito();

    // Mensaje de confirmación
    let textoNotificacion;
    
    if (esFraccionado && unidad === "kg") {
        let textoCantidad;
        if (cantidad >= 1000) {
            const kg = cantidad / 1000;
            textoCantidad = `${kg.toFixed(2)} kg`;
        } else {
            textoCantidad = `${cantidad} g`;
        }
        
        if (esNuevoProducto) {
            textoNotificacion = `✓ ${titulo}<br><small>${textoCantidad} agregado al carrito</small>`;
        } else {
            textoNotificacion = `✓ ${titulo}<br><small>Cantidad actualizada en el carrito</small>`;
        }
    } else {
        if (esNuevoProducto) {
            if (cantidad === 1) {
                textoNotificacion = `✓ ${titulo}<br><small>1 ${unidad} agregado al carrito</small>`;
            } else {
                textoNotificacion = `✓ ${titulo}<br><small>${cantidad} ${unidad} agregados al carrito</small>`;
            }
        } else {
            textoNotificacion = `✓ ${titulo}<br><small>Cantidad actualizada en el carrito</small>`;
        }
    }
    
    mostrarNotificacion(textoNotificacion);
}

// Mostrar carrito en modal
function mostrarCarrito() {
    const lista = document.getElementById("listaCarrito");
    const totalSpan = document.getElementById("totalCarrito");
    const carritoVacioDiv = document.getElementById("carritoVacio");

    const carrito = cargarCarrito();

    if (!lista || !totalSpan) return;

    lista.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
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
            const kg = item.cantidad / 1000;
            subtotal = item.precio * kg;
            
            if (item.cantidad >= 1000) {
                const kgDisplay = item.cantidad / 1000;
                textoCantidad = `${kgDisplay.toFixed(2)} kg`;
            } else {
                textoCantidad = `${item.cantidad} g`;
            }
            
            precioUnitarioTexto = `$${item.precio}/kg`;
        } else {
            subtotal = item.precio * item.cantidad;
            textoCantidad = `${item.cantidad} ${item.unidad}`;
            precioUnitarioTexto = `$${item.precio}/${item.unidad}`;
        }

        total += subtotal;

        const div = document.createElement("div");
        div.className = "carrito-item";
        
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

    // Configurar event listeners
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

// Cambiar cantidad de un producto en el carrito
function cambiarCantidad(id, delta, esFraccionado, unidad) {
    const carrito = cargarCarrito();

    let item = carrito.find(p => 
        p.id == id && 
        p.esFraccionado === esFraccionado && 
        p.unidad === unidad
    );
    
    if (!item) return;

    item.cantidad += delta;

    if (esFraccionado && item.unidad === "kg") {
        if (item.cantidad < 50) item.cantidad = 50;
    } else {
        if (item.cantidad < 1) item.cantidad = 1;
    }

    guardarCarrito(carrito);
    mostrarCarrito();
}

// Eliminar producto del carrito
function eliminarItem(id, esFraccionado, unidad) {
    let carrito = cargarCarrito();
    
    const producto = carrito.find(p => 
        p.id == id && p.esFraccionado === esFraccionado && p.unidad === unidad
    );
    
    carrito = carrito.filter(p => 
        !(p.id == id && p.esFraccionado === esFraccionado && p.unidad === unidad)
    );
    
    guardarCarrito(carrito);
    mostrarCarrito();
    
    if (producto) {
        mostrarNotificacion(`✗ ${producto.titulo}<br><small>eliminado del carrito</small>`);
    }
}

// Vaciar carrito completo
function vaciarCarrito() {
    if (confirm("¿Está seguro de vaciar todo el carrito?")) {
        localStorage.setItem("carrito", JSON.stringify([]));
        actualizarContador();
        mostrarCarrito();
        mostrarNotificacion("Carrito vaciado");
    }
}

// Abrir modal del carrito - CORREGIDO
function abrirCarrito() {
    mostrarCarrito();
    const modal = document.getElementById("modalCarrito");
    if (modal) {
        modal.style.display = "flex";
        document.body.classList.add('modal-open');
    }
}

// Cerrar modal del carrito
function cerrarCarrito() {
    const modal = document.getElementById("modalCarrito");
    if (modal) {
        modal.style.display = "none";
        document.body.classList.remove('modal-open');
    }
}

// Agregar desde tarjeta (función de apoyo)
function agregarDesdeTarjeta(id, nombre, precio, fraccionado, unidad) {
    agregarAlCarrito(id, nombre, precio, 1, fraccionado, unidad, false);
}

// Agregar desde botón en tarjeta
function agregarDesdeTarjetaDesdeBoton(btn) {
    const card = btn.closest('.card');
    const id = card.dataset.id;
    const nombre = card.dataset.nombre;
    const precio = parseFloat(card.dataset.precio);
    const fraccionado = card.dataset.fraccionado === 'true';
    const unidad = card.dataset.unidad;
    
    agregarAlCarrito(id, nombre, precio, 1, fraccionado, unidad, false);
}

// Mostrar notificación
function mostrarNotificacion(mensaje) {
    const notif = document.createElement("div");
    notif.className = mensaje.includes("✗") ? "notificacion notificacion-error" : "notificacion";
    notif.innerHTML = mensaje;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = "slideOutRight 0.3s ease";
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Inicializar carrito al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    actualizarContador();
    
    // Asegurar que el botón del carrito funcione
    const btnCarrito = document.getElementById("btnAbrirCarrito");
    if (btnCarrito) {
        btnCarrito.addEventListener('click', abrirCarrito);
    }
    
    // Cerrar modal al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                if (this.id === 'modalCarrito') cerrarCarrito();
                if (this.id === 'modalProducto') cerrarProducto();
                if (this.id === 'modalEnvio') cerrarEnvio();
            }
        });
    });
});