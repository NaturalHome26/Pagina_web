let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Funciones del carrito
function abrirCarrito() {
    document.getElementById('modalCarrito').style.display = 'flex';
    renderCarrito();
}

function cerrarCarrito(event) {
    if (event) event.stopPropagation();
    document.getElementById('modalCarrito').style.display = 'none';
}

function agregarAlCarrito(id, titulo, precio) {
    const productoExistente = carrito.find(item => item.id === id);
    
    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({
            id: id,
            titulo: titulo,
            precio: precio,
            cantidad: 1
        });
    }
    
    guardarCarrito();
    renderCarrito();
    
    // Mostrar notificación
    mostrarNotificacion(`${titulo} agregado al carrito`);
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarCarrito();
    renderCarrito();
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
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContador();
}

function actualizarContador() {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    document.getElementById('carritoCount').textContent = totalItems;
}

function renderCarrito() {
    const listaCarrito = document.getElementById('listaCarrito');
    const totalCarrito = document.getElementById('totalCarrito');
    
    if (carrito.length === 0) {
        listaCarrito.innerHTML = `
            <div class="empty-carrito">
                <p>🛒 Tu carrito está vacío</p>
                <p class="small">Agrega productos desde la tienda</p>
            </div>
        `;
        totalCarrito.textContent = '$0';
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
                    <p>$${item.precio} c/u</p>
                </div>
                <div class="item-carrito-actions">
                    <button class="btn-cantidad" onclick="actualizarCantidad(${item.id}, ${item.cantidad - 1})">-</button>
                    <span>${item.cantidad}</span>
                    <button class="btn-cantidad" onclick="actualizarCantidad(${item.id}, ${item.cantidad + 1})">+</button>
                    <button class="btn-cantidad" onclick="eliminarDelCarrito(${item.id})" style="background:#ffeaea; color:#e63946;">✕</button>
                </div>
            </div>
        `;
    });
    
    listaCarrito.innerHTML = html;
    totalCarrito.textContent = `$${total.toFixed(2)}`;
}

// Funciones de búsqueda y filtrado
function buscarProductos() {
    const texto = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const nombre = card.dataset.nombre;
        const display = nombre.includes(texto) ? 'block' : 'none';
        card.style.display = display;
    });
}

function filtrar(categoria) {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        if (categoria === 'todas' || card.dataset.categoria === categoria) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Notificación
function mostrarNotificacion(mensaje) {
    // Crear notificación
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #12b84e;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notificacion);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

// Cerrar modal al hacer clic fuera
document.addEventListener('DOMContentLoaded', function() {
    actualizarContador();
    
    // Inicializar búsqueda si existe
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Agregar animación de notificación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .empty-carrito {
            text-align: center;
            padding: 40px 20px;
            color: #666;
        }
        .empty-carrito .small {
            font-size: 14px;
            margin-top: 5px;
        }
    `;
    document.head.appendChild(style);
});

// Prevenir cierre del modal al hacer clic dentro
document.addEventListener('click', function(event) {
    const modal = document.getElementById('modalCarrito');
    const modalContent = document.querySelector('.modal-content');
    
    if (modal && modal.style.display === 'flex' && 
        !modalContent.contains(event.target) && 
        event.target !== modalContent) {
        cerrarCarrito();
    }
});