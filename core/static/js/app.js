/* =========================================================
   CARRITO - SISTEMA COMPLETO
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
    const total = carrito.reduce((acc, item) => acc + Number(item.cantidad), 0);
    document.getElementById("carritoCount").textContent = total;
}

/* =========================================================
   AGREGAR PRODUCTO AL CARRITO
========================================================= */
function agregarAlCarrito(id, titulo, precio, cantidad = 1) {
    cantidad = Number(cantidad);

    const carrito = cargarCarrito();

    // Ver si el producto ya está en el carrito
    let item = carrito.find(p => p.id === id);

    if (item) {
        item.cantidad += cantidad;
    } else {
        carrito.push({
            id: id,
            titulo: titulo,
            precio: precio,
            cantidad: cantidad
        });
    }

    guardarCarrito(carrito);
    mostrarCarrito();

    // Mostrar mensaje visual
    alert(`Añadido: ${titulo} (${cantidad})`);
}

/* =========================================================
   MOSTRAR CARRITO EN MODAL
========================================================= */
function mostrarCarrito() {
    const lista = document.getElementById("listaCarrito");
    const totalSpan = document.getElementById("totalCarrito");

    const carrito = cargarCarrito();

    lista.innerHTML = "";
    let total = 0;

    carrito.forEach(item => {

        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        const div = document.createElement("div");
        div.classList.add("carrito-item");

        div.innerHTML = `
            <div class="carrito-info">
                <h4>${item.titulo}</h4>
                <p>${item.cantidad} x $${item.precio}</p>
            </div>

            <div class="carrito-actions">
                <button onclick="cambiarCantidad(${item.id}, -1)">-</button>
                <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
                <button class="btn-remove" onclick="eliminarItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        lista.appendChild(div);
    });

    totalSpan.textContent = "$" + total.toFixed(2);
}

/* =========================================================
   CAMBIAR CANTIDAD
========================================================= */
function cambiarCantidad(id, delta) {
    const carrito = cargarCarrito();
    let item = carrito.find(p => p.id === id);

    if (!item) return;

    item.cantidad += delta;

    if (item.cantidad <= 0) {
        eliminarItem(id);
        return;
    }

    guardarCarrito(carrito);
    mostrarCarrito();
}

/* =========================================================
   ELIMINAR PRODUCTO DEL CARRITO
========================================================= */
function eliminarItem(id) {
    let carrito = cargarCarrito();
    carrito = carrito.filter(p => p.id !== id);
    guardarCarrito(carrito);
    mostrarCarrito();
}

/* =========================================================
   ABRIR / CERRAR MODAL DEL CARRITO
========================================================= */
function abrirCarrito() {
    mostrarCarrito();
    document.getElementById("modalCarrito").style.display = "flex";
}

function cerrarCarrito() {
    document.getElementById("modalCarrito").style.display = "none";
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
   FUNCIONES PARA EL MODAL DE PRODUCTO (DETALLE)
========================================================= */

function abrirProducto(id) {

    fetch(window.location.origin + `/api/producto/${id}/`)
        .then(res => res.json())
        .then(p => {

            document.getElementById("modalProductoTitulo").textContent = p.titulo;
            document.getElementById("modalProductoImagen").src = p.imagen;
            document.getElementById("modalProductoDescripcion").textContent =
                p.descripcion && p.descripcion.trim() !== "" ?
                p.descripcion : "Sin descripción disponible.";

            // Mostrar precio
            document.getElementById("modalProductoPrecio").textContent = "$" + p.precio_final;
            document.getElementById("modalProductoUnidad").textContent = p.unidad_display;

            const input = document.getElementById("modalProductoCantidad");
            const unidadTexto = document.getElementById("modalUnidadTexto");

            if (p.fraccionado === true && p.unidad === "kg") {
                input.min = 1;
                input.step = 50;
                input.value = 500;
                unidadTexto.textContent = "g"; // gramos
            } else {
                input.min = 1;
                input.step = 1;
                input.value = 1;
                unidadTexto.textContent = p.unidad_display;
            }

            // Botón agregar
            document.getElementById("modalProductoAgregar").onclick = function() {
                
                let cantidad = parseFloat(input.value);

                // Convertir gramos a kilos si aplica
                if (p.fraccionado === true && p.unidad === "kg") {
                    cantidad = cantidad / 1000;
                }

                agregarAlCarrito(p.id, p.titulo, p.precio_final, cantidad);
            };

            document.getElementById("modalProducto").style.display = "flex";
        });
}

function cerrarProducto() {
    document.getElementById("modalProducto").style.display = "none";
}

/* =========================================================
   FIN DEL ARCHIVO
========================================================= */
