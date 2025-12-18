from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("", views.home, name="home"),
    path("admin/", views.admin_login, name="admin_login"),
    path("admin/logout/", views.admin_logout, name="admin_logout"),
    path("admin/productos/", views.admin_products, name="admin_products"),
    path("admin/productos/nuevo/", views.admin_new, name="admin_new"),
    path("admin/productos/<int:id>/editar/", views.admin_edit, name="admin_edit"),
    path("admin/productos/<int:id>/eliminar/", views.admin_delete, name="admin_delete"),
    path("api/producto/<int:id>/", views.api_producto, name="api_producto"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)