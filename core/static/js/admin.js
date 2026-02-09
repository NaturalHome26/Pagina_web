/* =========================================================
   FUNCIONES ADMINISTRACIÓN
========================================================= */

// Vista previa de imagen única (para compatibilidad)
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            const preview = document.getElementById('preview');
            if (preview) {
                preview.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }
}

// Función para vista previa de imagen principal
function previewMainImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            const preview = document.getElementById('previewMain');
            if (preview) {
                preview.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }
}

// Vista previa de múltiples imágenes (para el sistema anterior)
function previewMultipleImages(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById('multiPreview');
    const fileCount = document.getElementById('selected-files-count');
    
    if (!previewContainer || !fileCount) return;
    
    // Limpiar contenedor
    previewContainer.innerHTML = '';
    
    // Actualizar contador
    fileCount.textContent = `${files.length} archivo(s) seleccionado(s)`;
    
    // Procesar cada archivo
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Crear elemento de vista previa
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            
            // Crear imagen
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = `Imagen ${i + 1}`;
            
            // Botón para eliminar
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image-btn';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.onclick = function() {
                previewItem.remove();
                updateFileCount();
            };
            
            // Añadir elementos
            previewItem.appendChild(img);
            previewItem.appendChild(removeBtn);
            previewContainer.appendChild(previewItem);
        };
        
        reader.readAsDataURL(file);
    }
    
    // Si no hay archivos, mostrar mensaje
    if (files.length === 0) {
        previewContainer.innerHTML = `
            <div class="image-preview-item" id="defaultPreview">
                <img src="/static/img/no-image.png" class="thumb-preview">
                <div class="image-info">
                    <i class="fas fa-info-circle"></i> No hay imágenes seleccionadas
                </div>
            </div>
        `;
    }
}

// Actualizar contador de archivos (sistema anterior)
function updateFileCount() {
    const fileCount = document.getElementById('selected-files-count');
    const previewContainer = document.getElementById('multiPreview');
    
    if (!fileCount || !previewContainer) return;
    
    const imageItems = previewContainer.querySelectorAll('.image-preview-item');
    const defaultPreview = previewContainer.querySelector('#defaultPreview');
    
    let count = imageItems.length;
    if (defaultPreview) count--;
    
    fileCount.textContent = `${count} archivo(s) seleccionado(s)`;
}

// Alternar visibilidad de descuento
function toggleDescuento(checkbox) {
    const wrapPorcentaje = document.getElementById('wrap_porcentaje');
    if (wrapPorcentaje) {
        wrapPorcentaje.style.display = checkbox.checked ? "block" : "none";
    }
    calcularDescuento();
}

// Calcular precio con descuento
function calcularDescuento() {
    const precio = parseFloat(document.getElementById('id_precio').value) || 0;
    const porcentaje = parseInt(document.getElementById('id_porcentaje').value) || 0;
    const precioFinalElement = document.getElementById('precioFinal');

    if (precioFinalElement) {
        if (porcentaje > 0) {
            const descuento = precio * (porcentaje / 100);
            const precioFinal = precio - descuento;
            precioFinalElement.textContent = `$${precioFinal.toFixed(2)}`;
        } else {
            precioFinalElement.textContent = `$${precio.toFixed(2)}`;
        }
    }
}

// Confirmar eliminación de producto (para formulario individual)
function confirmarEliminacion() {
    if (confirm("¿Seguro que quieres eliminar este producto?")) {
        document.getElementById('deleteForm').submit();
    }
}

// Confirmar eliminación desde la lista
function confirmarEliminacionLista(button) {
    const productId = button.getAttribute('data-id');
    const productTitle = button.getAttribute('data-title');
    const deleteUrl = button.getAttribute('data-url');
    
    if (confirm(`¿Seguro que quieres eliminar el producto "${productTitle}"?`)) {
        // Crear formulario dinámico para enviar la solicitud de eliminación
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = deleteUrl;
        
        // Agregar CSRF token (necesario para Django)
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrfmiddlewaretoken';
            csrfInput.value = csrfToken.value;
            form.appendChild(csrfInput);
        }
        
        // Agregar formulario al DOM y enviar
        document.body.appendChild(form);
        form.submit();
    }
}

// Configurar eventos de formulario admin
document.addEventListener('DOMContentLoaded', function() {
    const precioInput = document.getElementById('id_precio');
    const porcentajeInput = document.getElementById('id_porcentaje');
    
    if (precioInput && porcentajeInput) {
        precioInput.addEventListener('input', calcularDescuento);
        porcentajeInput.addEventListener('input', calcularDescuento);
    }
    
    // Calcular descuento inicial si hay valores
    calcularDescuento();
    
    // Configurar eventos para botones de eliminar en la lista
    const deleteButtons = document.querySelectorAll('.btn-delete-table');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            confirmarEliminacionLista(this);
        });
    });
});