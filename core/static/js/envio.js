/* =========================================================
   SISTEMA DE ENVÍO - FORMULARIO Y WHATSAPP (MEJORADO)
   ========================================================= */

// Obtener número de WhatsApp desde configuración Django
const WHATSAPP_NUMERO = (function() {
    const configData = document.getElementById('config-data');
    if (configData && configData.dataset.whatsapp) {
        return configData.dataset.whatsapp;
    }
    // Fallback en caso de error
    console.warn('No se pudo cargar el número de WhatsApp desde configuración, usando fallback');
    return "59892313925";
})();

let whatsappWindow = null; // Referencia a la ventana de WhatsApp

// Detectar si es dispositivo móvil
function esMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// =========================================================
// FUNCIONES DEL MODAL (MANTENIDAS IGUAL)
// =========================================================

function abrirEnvio() {
    const modal = document.getElementById('modalEnvio');
    if (!modal) {
        console.error('No se encontró el modal de envío');
        return;
    }
    
    const totalCarrito = document.getElementById('totalCarrito').textContent;
    const totalPedidoForm = document.getElementById('totalPedidoForm');
    if (totalPedidoForm) {
        totalPedidoForm.textContent = totalCarrito;
    }
    
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    cerrarCarrito();
}

function cerrarEnvio() {
    const modal = document.getElementById('modalEnvio');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

// =========================================================
// GENERACIÓN DE MENSAJE (EMOJIS CORREGIDOS Y FORMATO MEJORADO)
// =========================================================

function generarMensajeWhatsApp(datos) {
    const carritoInfo = obtenerResumenCarrito();
    
    // Formato de fecha y hora mejorado: 16/12/2024 - 11:17 AM
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString('es-UY', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
    const hora = ahora.toLocaleTimeString('es-UY', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    }).toUpperCase();
    
    // Construir mensaje con emojis Unicode seguros
    let mensaje = "Hola! Quiero hacer un pedido.\n\n";
    mensaje += "*PEDIDO* - " + fecha + " a las " + hora + "\n\n";
    mensaje += "*Cliente:* " + datos.nombre + "\n";
    mensaje += "*Telefono:* " + datos.telefono + "\n";
    mensaje += "*Direccion:* " + datos.direccion + "\n";
    
    if (datos.observaciones) {
        mensaje += "*Observaciones:* " + datos.observaciones + "\n";
    }
    
    mensaje += "\n*PRODUCTOS:*\n";
    mensaje += carritoInfo.resumen + "\n";
    mensaje += "*TOTAL:* $" + carritoInfo.total + "\n";
    mensaje += "*Pago:* " + (datos.metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia Bancaria') + "\n\n";
    mensaje += "*Nota:* Los precios son aproximados segun las cantidades disponibles. Nos pondremos en contacto al numero proporcionado para confirmar disponibilidad y precio final. Muchas gracias por elegirnos!";
    
    return mensaje;
}

// =========================================================
// ENVÍO POR WHATSAPP (MEJORADO - DETECTA DISPOSITIVO)
// =========================================================

function enviarPedidoWhatsApp(datos) {
    const mensaje = generarMensajeWhatsApp(datos);
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Detectar si es móvil
    const esMobil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Verificar formato del número
    const numeroFormateado = WHATSAPP_NUMERO.startsWith('+') ? 
        WHATSAPP_NUMERO : 
        '+' + WHATSAPP_NUMERO;
    
    let url;
    
    if (esMobil) {
        // En móvil: usar whatsapp:// para abrir la app directamente
        url = `whatsapp://send?phone=${numeroFormateado}&text=${mensajeCodificado}`;
        
        // Fallback a wa.me si whatsapp:// falla
        const fallbackUrl = `https://wa.me/${numeroFormateado}?text=${mensajeCodificado}`;
        
        // Intentar abrir la app
        window.location.href = url;
        
        // Si no se abre en 2 segundos, usar fallback
        setTimeout(() => {
            window.location.href = fallbackUrl;
        }, 2000);
        
    } else {
        // En desktop: usar wa.me y gestionar ventanas
        url = `https://wa.me/${numeroFormateado}?text=${mensajeCodificado}`;
        
        // Intentar enfocar ventana existente de WhatsApp
        if (whatsappWindow && !whatsappWindow.closed) {
            try {
                whatsappWindow.location.href = url;
                whatsappWindow.focus();
            } catch (e) {
                // Si falla, cerrar y abrir nueva
                whatsappWindow.close();
                whatsappWindow = window.open(url, 'whatsappWindow', 'width=800,height=600');
            }
        } else {
            // Abrir nueva ventana
            whatsappWindow = window.open(url, 'whatsappWindow', 'width=800,height=600');
            
            if (!whatsappWindow) {
                // Fallback si bloqueador de pop-ups
                window.open(url, '_blank');
            }
        }
    }
    
    // Mostrar confirmación
    mostrarConfirmacionPedido(datos, obtenerResumenCarrito());
}

// =========================================================
// CONFIRMACIÓN DEL PEDIDO (MANTENIDO)
// =========================================================

function mostrarConfirmacionPedido(datos, carritoInfo) {
    const modal = document.getElementById('modalEnvio');
    if (!modal) return;
    
    const fechaHora = new Date().toLocaleString('es-UY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const confirmacionHTML = `
        <div class="confirmacion-pedido">
            <div class="confirmacion-icon">
                <i class="fab fa-whatsapp"></i>
            </div>
            <h3 style="color: #1f8e3c; margin-bottom: 15px;">¡Pedido Enviado Exitosamente!</h3>
            <p style="color: #555; margin-bottom: 20px; line-height: 1.6;">
                Hemos enviado tu pedido por WhatsApp. Pronto nos pondremos en contacto contigo
                para confirmar disponibilidad y coordinar el envío.
            </p>

            <div class="confirmacion-detalles">
                <div class="detalle-item">
                    <span class="detalle-label">Fecha y Hora:</span>
                    <span class="detalle-valor">${fechaHora}</span>
                </div>
                <div class="detalle-item">
                    <span class="detalle-label">Cliente:</span>
                    <span class="detalle-valor">${datos.nombre}</span>
                </div>
                <div class="detalle-item">
                    <span class="detalle-label">Teléfono:</span>
                    <span class="detalle-valor">${datos.telefono}</span>
                </div>
                <div class="detalle-item">
                    <span class="detalle-label">Total Pedido:</span>
                    <span class="detalle-valor">$${carritoInfo.total}</span>
                </div>
            </div>

            <p style="margin-bottom: 20px;"><strong>Número de contacto:</strong> +${WHATSAPP_NUMERO}</p>

            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn-send" onclick="finalizarPedido()"
                    style="padding: 12px 24px; background: #1f8e3c; color: white; border: none;
                    border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600;">
                    <i class="fas fa-home"></i> Volver al Inicio
                </button>
                <button class="btn-send" onclick="cerrarEnvio()" 
                    style="padding: 12px 24px; background: #6c757d; color: white; border: none; 
                    border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600;">
                    <i class="fas fa-shopping-cart"></i> Seguir Comprando
                </button>
            </div>
        </div>
    `;
    
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) {
        modalBody.innerHTML = confirmacionHTML;
    }
}

// =========================================================
// FINALIZAR PEDIDO (MEJORADO)
// =========================================================

function finalizarPedido() {
    // Cerrar ventana de WhatsApp si está abierta
    if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.close();
        whatsappWindow = null;
    }
    
    // Vaciar carrito
    localStorage.setItem("carrito", JSON.stringify([]));
    actualizarContador();
    
    // Cerrar modales
    cerrarEnvio();
    
    // Mostrar notificación
    mostrarNotificacion('✅ Pedido completado. ¡Gracias por tu compra!');
    
    // Redirigir al inicio
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}

// =========================================================
// INICIALIZACIÓN (CON MEJORAS)
// =========================================================

document.addEventListener('DOMContentLoaded', function() {
    const formEnvio = document.getElementById('formEnvio');
    
    if (formEnvio) {
        formEnvio.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Formulario de envío enviado');
            
            // Validar que hay productos en el carrito
            const carrito = cargarCarrito();
            if (carrito.length === 0) {
                mostrarNotificacion('❌ Tu carrito está vacío. Agrega productos antes de enviar el pedido.', 'error');
                return;
            }
            
            // Recoger datos
            const datos = {
                nombre: document.getElementById('nombreCliente').value.trim(),
                telefono: document.getElementById('telefonoCliente').value.trim(),
                direccion: document.getElementById('direccionCliente').value.trim(),
                observaciones: document.getElementById('observaciones').value.trim(),
                metodoPago: document.querySelector('input[name="metodoPago"]:checked')?.value || 'efectivo'
            };
            
            // Validaciones
            if (!datos.nombre || !datos.telefono || !datos.direccion) {
                mostrarNotificacion('❌ Por favor completa todos los campos obligatorios', 'error');
                return;
            }
            
            if (datos.telefono.length < 8) {
                mostrarNotificacion('❌ Por favor ingresa un número de teléfono válido', 'error');
                return;
            }
            
            // Mostrar carga
            mostrarNotificacion('⏳ Generando pedido...', 'info');
            
            // Pequeño delay para mejor UX
            setTimeout(() => {
                enviarPedidoWhatsApp(datos);
            }, 500);
        });
    }
    
    // Cerrar modal al hacer clic fuera
    const modalEnvio = document.getElementById('modalEnvio');
    if (modalEnvio) {
        modalEnvio.addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarEnvio();
            }
        });
    }
});

// =========================================================
// FUNCIÓN DE NOTIFICACIÓN MEJORADA
// =========================================================

function mostrarNotificacion(mensaje, tipo = 'success') {
    // Remover notificaciones anteriores
    const notifsAnteriores = document.querySelectorAll('.notificacion-flotante');
    notifsAnteriores.forEach(notif => notif.remove());

    const notif = document.createElement("div");
    notif.className = `notificacion-flotante ${tipo}`;

    // Icono según tipo
    let icono = '';
    if (mensaje.includes('✅')) icono = '';
    else if (tipo === 'error') icono = '❌ ';
    else if (tipo === 'info') icono = '⏳ ';

    notif.innerHTML = icono + mensaje;

    document.body.appendChild(notif);
    
    // Eliminar después de 4 segundos
    setTimeout(() => {
        notif.style.animation = "slideOutRight 0.3s ease";
        setTimeout(() => {
            if (notif.parentNode) {
                notif.remove();
            }
        }, 300);
    }, 4000);
}

/* =========================================================
   CARRITO - SISTEMA COMPLETO
   ========================================================= */

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

// =========================================================
// FUNCIÓN PARA OBTENER RESUMEN DEL CARRITO (CORREGIDA)
// =========================================================

function obtenerResumenCarrito() {
    const carrito = cargarCarrito();
    let resumen = "";
    let total = 0;
    
    if (carrito.length === 0) {
        return {
            resumen: "No hay productos en el carrito",
            total: "0.00"
        };
    }
    
    carrito.forEach((item, index) => {
        let subtotal = 0;
        let textoCantidad = "";
        
        if (item.esFraccionado && item.unidad === "kg") {
            const kg = item.cantidad / 1000;
            subtotal = item.precio * kg;
            
            if (item.cantidad >= 1000) {
                const kgDisplay = item.cantidad / 1000;
                textoCantidad = `${kgDisplay.toFixed(2)} kg`;
            } else {
                textoCantidad = `${item.cantidad} g`;
            }
        } else {
            subtotal = item.precio * item.cantidad;
            textoCantidad = `${item.cantidad} ${item.unidad}`;
        }
        
        total += subtotal;
        resumen += `${index + 1}. ${item.titulo} - ${textoCantidad} - $${subtotal.toFixed(2)}\n`;
    });
    
    return {
        resumen: resumen,
        total: total.toFixed(2)
    };
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
                <button class="btn-minus" data-id="${item.id}" 
                    data-esfraccionado="${item.esFraccionado ? 1 : 0}" 
                    data-unidad="${item.unidad}">
                    <i class="fas fa-minus"></i>
                </button>
                <button class="btn-plus" data-id="${item.id}" 
                    data-esfraccionado="${item.esFraccionado ? 1 : 0}" 
                    data-unidad="${item.unidad}">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="btn-remove" data-id="${item.id}" 
                    data-esfraccionado="${item.esFraccionado ? 1 : 0}" 
                    data-unidad="${item.unidad}">
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
        p.id == id && 
        p.esFraccionado === esFraccionado && 
        p.unidad === unidad
    );
    
    carrito = carrito.filter(p => 
        !(p.id == id && 
          p.esFraccionado === esFraccionado && 
          p.unidad === unidad)
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