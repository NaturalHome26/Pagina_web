/* ============================================
   ADMIN LOGIN - FOCUS Y ESTADOS
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Focus automático en campo de usuario
    const inputUsername = document.getElementById('username');
    if (inputUsername) {
        inputUsername.focus();
    }

    // Mostrar loading al enviar formulario
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const btn = this.querySelector('.btn-login');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
                btn.disabled = true;
            }
        });
    }
});
