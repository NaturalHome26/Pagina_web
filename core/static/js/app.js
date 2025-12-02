let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Funciones del carrito
function abrirCarrito() {
    const modal = document.getElementById('modalCarrito');
    if (modal) {
        modal.style.display = 'flex';
        renderCarrito();
        // Agregar animación de entrada
        modal.querySelector('.modal-content').style.animation = 'modalAppear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }
}

function cerrarCarrito() {
    const modal = document.getElementById('modalCarrito');
    if (modal) {
        // Agregar animación de salida
        modal.querySelector('.modal-content').style.animation = 'modalDisappear 0.3s ease';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 250);
    }
}

// Agregar animación CSS para cerrar
if (!document.querySelector('#modal-animations')) {
    const style = document.createElement('style');
    style.id = 'modal-animations';
    style.textContent = `
        @keyframes modalDisappear {
            from {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
            to {
                opacity: 0;
                transform: scale(0.9) translateY(20px);
            }
        }
    `;
    document.head.appendChild(style);
}

function agregarAlCarrito(id, titulo, precio) {
    // Buscar si el producto ya está en el carrito
    const productoExistente = carrito.find(item => item.id === id);
    
    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({
            id: id,
            titulo: titulo,
            precio: parseFloat(precio),
            cantidad: 1
        });
    }
    
    guardarCarrito();
    renderCarrito();
    
    // Mostrar notificación con efecto
    mostrarNotificacion(`✓ ${titulo} agregado al carrito`);
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarCarrito();
    renderCarrito();
    
    // Mostrar notificación de eliminación
    mostrarNotificacion('✗ Producto eliminado del carrito', 'error');
}

function actualizarCantidad(id, nuevaCantidad) {
    if (nuevaCantidad < 1) {
        eliminarDelCarrito(id);
        return;
    }
    
    const producto = carrito.find(item => item.id === id);
    if (producto) {
        producto.cantidad = nuevaCantidad;
        guardarCarrito();
        renderCarrito();
    }
}

function guardarCarrito() {
    try {
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContador();
    } catch (e) {
        console.error('Error al guardar el carrito:', e);
        mostrarNotificacion('Error al guardar el carrito', 'error');
    }
}

function actualizarContador() {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    const contador = document.getElementById('carritoCount');
    if (contador) {
        contador.textContent = totalItems;
        // Animación del contador
        contador.style.transform = 'scale(1.3)';
        setTimeout(() => {
            contador.style.transform = 'scale(1)';
        }, 300);
    }
}

function renderCarrito() {
    const listaCarrito = document.getElementById('listaCarrito');
    const totalCarrito = document.getElementById('totalCarrito');
    
    if (!listaCarrito || !totalCarrito) {
        return;
    }
    
    if (carrito.length === 0) {
        listaCarrito.innerHTML = `
            <div class="empty-carrito">
                <div class="empty-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <p>Tu carrito está vacío</p>
                <p class="small">Agrega productos desde la tienda</p>
            </div>
        `;
        totalCarrito.textContent = '$0.00';
        return;
    }
    
    let html = '';
    let total = 0;
    
    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        html += `
            <div class="item-carrito">
                <div class="item-carrito-info">
                    <h4>${item.titulo}</h4>
                    <p>$${item.precio.toFixed(2)} c/u</p>
                </div>
                <div class="item-carrito-actions">
                    <button class="btn-cantidad" onclick="actualizarCantidad(${item.id}, ${item.cantidad - 1})">-</button>
                    <span style="min-width: 35px; text-align: center; font-weight: 700;">${item.cantidad}</span>
                    <button class="btn-cantidad" onclick="actualizarCantidad(${item.id}, ${item.cantidad + 1})">+</button>
                    <button class="btn-eliminar" onclick="eliminarDelCarrito(${item.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    listaCarrito.innerHTML = html;
    totalCarrito.textContent = `$${total.toFixed(2)}`;
}

// Funciones de búsqueda y filtrado
function buscarProductos() {
    const texto = document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    // Solo usar búsqueda cliente si no hay búsqueda servidor
    if (texto && !window.location.search.includes('q=')) {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            const nombre = card.dataset.nombre;
            const display = nombre.includes(texto) ? 'block' : 'none';
            card.style.display = display;
            
            // Efecto de búsqueda
            if (display === 'block') {
                card.style.animation = 'fadeIn 0.5s ease';
            }
        });
    }
}

// Notificación mejorada
function mostrarNotificacion(mensaje, tipo = 'success') {
    // Crear notificación
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    
    const bgColor = tipo === 'error' ? '#e63946' : '#12b84e';
    const icon = tipo === 'error' ? '✗' : '✓';
    
    notificacion.style.cssText = `
        position: fixed;
        top: 25px;
        right: 25px;
        background: ${bgColor};
        color: white;
        padding: 18px 25px;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        font-weight: 700;
        font-size: 15px;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 350px;
        border-left: 5px solid rgba(255,255,255,0.3);
    `;
    
    notificacion.innerHTML = `
        <span style="font-size: 20px;">${icon}</span>
        <span>${mensaje}</span>
    `;
    
    document.body.appendChild(notificacion);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 350);
    }, 3000);
}

// Agregar animaciones CSS para notificaciones
if (!document.querySelector('#notification-animations')) {
    const style = document.createElement('style');
    style.id = 'notification-animations';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .empty-carrito {
            text-align: center;
            padding: 40px 20px;
            color: #666;
        }
        .empty-carrito .empty-icon {
            font-size: 60px;
            color: #d0e7d6;
            margin-bottom: 20px;
        }
        .empty-carrito p {
            margin: 10px 0;
            font-size: 16px;
        }
        .empty-carrito .small {
            font-size: 14px;
            color: #999;
        }
    `;
    document.head.appendChild(style);
}

// Inicializar cuando la página carga
document.addEventListener('DOMContentLoaded', function() {
    // Asegurarse de que el carrito esté inicializado
    actualizarContador();
    
    // Configurar el botón del carrito
    const btnCarrito = document.getElementById('btnAbrirCarrito');
    if (btnCarrito) {
        btnCarrito.addEventListener('click', abrirCarrito);
    }
    
    // Configurar el modal para cerrar al hacer clic fuera
    const modal = document.getElementById('modalCarrito');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarCarrito();
            }
        });
    }
    
    // Agregar efecto a los botones "Agregar al carrito"
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
    
    console.log('Aplicación inicializada correctamente');
});