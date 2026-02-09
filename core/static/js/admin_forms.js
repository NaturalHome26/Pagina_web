/* ============================================
   ADMIN FORMS - DESCUENTOS Y VALIDACIONES
   ============================================ */

/**
 * Inicializa los controles de descuento en formularios de admin
 */
function inicializarControlDescuento() {
    const checkboxDescuento = document.getElementById('descuento_activo');
    const camposDescuento = document.getElementById('descuentoFields');
    const inputPrecio = document.getElementById('precio');
    const inputPorcentaje = document.getElementById('porcentaje_descuento');

    if (!checkboxDescuento || !camposDescuento) return;

    // Toggle visibility de campos de descuento
    checkboxDescuento.addEventListener('change', function() {
        if (this.checked) {
            camposDescuento.classList.remove('hidden');
            camposDescuento.classList.add('visible');
        } else {
            camposDescuento.classList.remove('visible');
            camposDescuento.classList.add('hidden');
        }
        calcularDescuento();
    });

    // Calcular descuento cuando cambian valores
    if (inputPrecio) {
        inputPrecio.addEventListener('input', calcularDescuento);
    }

    if (inputPorcentaje) {
        inputPorcentaje.addEventListener('input', calcularDescuento);
    }

    // Calcular descuento inicial
    calcularDescuento();
}

/**
 * Calcula y muestra el precio con descuento
 */
function calcularDescuento() {
    const inputPrecio = document.getElementById('precio');
    const inputPorcentaje = document.getElementById('porcentaje_descuento');
    const spanPrecioOriginal = document.getElementById('precioOriginal');
    const spanDescuentoAplicado = document.getElementById('descuentoAplicado');
    const spanPorcentajeAhorro = document.getElementById('porcentajeAhorro');
    const spanPrecioFinal = document.getElementById('precioFinal');

    if (!inputPrecio) return;

    const precio = parseFloat(inputPrecio.value) || 0;
    const porcentaje = parseInt(inputPorcentaje?.value) || 0;

    const descuento = (precio * porcentaje) / 100;
    const precioFinal = precio - descuento;

    if (spanPrecioOriginal) spanPrecioOriginal.textContent = precio.toFixed(2);
    if (spanDescuentoAplicado) spanDescuentoAplicado.textContent = descuento.toFixed(2);
    if (spanPorcentajeAhorro) spanPorcentajeAhorro.textContent = porcentaje;
    if (spanPrecioFinal) spanPrecioFinal.textContent = precioFinal.toFixed(2);
}

/**
 * Inicializa la vista previa de imagen
 */
function inicializarVistaPrevia() {
    const inputImagen = document.getElementById('imagen');
    const divPreview = document.getElementById('imagePreview');
    const imgPreview = document.getElementById('previewImage');

    if (!inputImagen || !divPreview || !imgPreview) return;

    inputImagen.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const reader = new FileReader();

            reader.onload = function(e) {
                imgPreview.src = e.target.result;
                divPreview.classList.remove('hidden');
                divPreview.classList.add('visible');
            }

            reader.readAsDataURL(this.files[0]);
        } else {
            divPreview.classList.remove('visible');
            divPreview.classList.add('hidden');
            imgPreview.src = '#';
        }
    });
}

/**
 * Confirmación de eliminación de producto
 * @param {HTMLFormElement} form - Formulario de eliminación
 * @param {string} titulo - Título del producto
 * @returns {boolean} - True si el usuario confirma
 */
function confirmarEliminacionProducto(form, titulo) {
    return confirm(`¿Estás seguro de que quieres eliminar el producto "${titulo}"?`);
}

/**
 * Confirmación de eliminación desde lista
 * @param {HTMLFormElement} form - Formulario de eliminación
 * @param {string} titulo - Título del producto
 * @returns {boolean} - True si el usuario confirma
 */
function confirmarEliminacionLista(form, titulo) {
    return confirm(`¿Seguro que quieres eliminar el producto "${titulo}"?`);
}

/**
 * Inicializa los event listeners de formularios de eliminación
 */
function inicializarConfirmacionesEliminacion() {
    // Botón de eliminar en formulario de edición
    const btnDelete = document.querySelector('button[name="delete"]');
    if (btnDelete) {
        // Remover el onclick del HTML si existe
        btnDelete.removeAttribute('onclick');
        btnDelete.addEventListener('click', function(e) {
            if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                e.preventDefault();
            }
        });
    }
}

// ============================================
// INICIALIZACIÓN AL CARGAR EL DOM
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar controles de descuento
    inicializarControlDescuento();

    // Inicializar vista previa de imagen
    inicializarVistaPrevia();

    // Inicializar confirmaciones de eliminación
    inicializarConfirmacionesEliminacion();
});
