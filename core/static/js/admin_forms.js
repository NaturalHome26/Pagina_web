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

/* ============================================
   GESTIÓN DE IMÁGENES ADICIONALES
   ============================================ */

// Array para almacenar imágenes en base64
let imagenesAdicionalesBase64 = [];

/**
 * Inicializa el input de imágenes adicionales
 */
function inicializarImagenesAdicionales() {
    const input = document.getElementById('imagenesAdicionales');
    const gallery = document.getElementById('additionalGallery');
    const hiddenField = document.getElementById('additionalImagesData');

    if (!input) return;

    input.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        const maxImages = 5;

        // Validar número máximo de imágenes
        const totalImages = imagenesAdicionalesBase64.length + files.length;
        if (totalImages > maxImages) {
            alert(`Solo puedes subir un máximo de ${maxImages} imágenes adicionales`);
            return;
        }

        // Procesar cada archivo
        files.forEach((file, index) => {
            if (!file.type.startsWith('image/')) {
                alert(`El archivo ${file.name} no es una imagen válida`);
                return;
            }

            // Validar tamaño (máx 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert(`La imagen ${file.name} es demasiado grande (máx. 5MB)`);
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const base64 = e.target.result;

                // Agregar al array
                imagenesAdicionalesBase64.push({
                    base64: base64,
                    filename: file.name,
                    type: file.type
                });

                // Actualizar vista previa
                actualizarGaleriaPreview();

                // Actualizar campo oculto
                if (hiddenField) {
                    hiddenField.value = JSON.stringify(imagenesAdicionalesBase64);
                }
            };
            reader.readAsDataURL(file);
        });

        // Limpiar input
        e.target.value = '';
    });
}

/**
 * Actualiza la galería de preview de imágenes
 */
function actualizarGaleriaPreview() {
    const gallery = document.getElementById('additionalGallery');
    if (!gallery) return;

    if (imagenesAdicionalesBase64.length === 0) {
        gallery.classList.add('hidden');
        gallery.innerHTML = '';
        return;
    }

    gallery.classList.remove('hidden');
    gallery.innerHTML = imagenesAdicionalesBase64.map((img, index) => `
        <div class="additional-image-item" data-index="${index}">
            <img src="${img.base64}" alt="${img.filename}">
            <div class="additional-image-actions">
                <button type="button" class="btn-remove-additional"
                        title="Eliminar imagen"
                        data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <span class="additional-image-name">${img.filename}</span>
        </div>
    `).join('');

    // Agregar event listeners a los botones de eliminar
    gallery.querySelectorAll('.btn-remove-additional').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const index = parseInt(this.getAttribute('data-index'));
            eliminarImagenNueva(index);
        });
    });
}

/**
 * Elimina una imagen nueva (no guardada aún)
 */
function eliminarImagenNueva(index) {
    if (index < 0 || index >= imagenesAdicionalesBase64.length) {
        console.error('Índice inválido:', index);
        return;
    }

    // Eliminar del array
    imagenesAdicionalesBase64.splice(index, 1);

    // Actualizar vista
    actualizarGaleriaPreview();

    // Actualizar campo oculto
    const hiddenField = document.getElementById('additionalImagesData');
    if (hiddenField) {
        hiddenField.value = JSON.stringify(imagenesAdicionalesBase64);
    }

    console.log(`Imagen eliminada. Total de imágenes: ${imagenesAdicionalesBase64.length}`);
}

/**
 * Marca una imagen existente para eliminación (solo en edit)
 */
function eliminarImagenAdicional(index) {
    if (!confirm('¿Seguro que quieres eliminar esta imagen?')) {
        return;
    }

    const keepInput = document.getElementById(`keep_${index}`);
    const item = document.querySelector(`[data-index="${index}"]`);

    if (keepInput && item) {
        keepInput.value = '0';
        item.style.opacity = '0.3';
        item.style.filter = 'grayscale(100%)';

        // Agregar indicador visual
        const overlay = document.createElement('div');
        overlay.className = 'deleted-overlay';
        overlay.innerHTML = '<i class="fas fa-trash"></i> Eliminada';
        item.appendChild(overlay);

        // Deshabilitar botón de eliminar
        const btn = item.querySelector('.btn-remove-additional');
        if (btn) {
            btn.disabled = true;
            btn.removeEventListener('click', function() {});
        }
    }
}

/**
 * Inicializa los event listeners de la galería existente (solo en edit)
 */
function inicializarGaleriaExistente() {
    const existingGallery = document.getElementById('existingGallery');
    if (!existingGallery) return;

    // Agregar event listeners a los botones de eliminar de imágenes existentes
    existingGallery.querySelectorAll('.btn-remove-additional').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const index = parseInt(this.getAttribute('data-index'));
            eliminarImagenAdicional(index);
        });
    });
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

    // Inicializar imágenes adicionales
    inicializarImagenesAdicionales();

    // Inicializar galería existente (solo en página de edición)
    inicializarGaleriaExistente();
});
