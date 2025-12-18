from django.db import models
import json
from django.core.files.storage import default_storage
from django.conf import settings

class Producto(models.Model):
    UNIDADES = [
        ("kg", "Kilogramo (kg)"),
        ("unidad", "Unidad"),
        ("paquete", "Paquete"),
        ("litro", "Litro"),
        ("docena", "Docena"),
    ]

    CATEGORIAS = [
        ("frutas", "Frutas"),
        ("verduras", "Verduras"),
        ("canastas", "Canastas"),
        ("combos", "Combos"),
        ("otros", "Otros"),
    ]

    titulo = models.CharField(max_length=200)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    unidad = models.CharField(max_length=20, choices=UNIDADES, default="unidad")
    categoria = models.CharField(max_length=20, choices=CATEGORIAS, default="otros")
    descripcion = models.TextField(blank=True, null=True)

    # Imagen principal
    imagen = models.ImageField(upload_to="productos/", blank=True, null=True)

    # Campo para almacenar imágenes adicionales como JSON
    imagenes_adicionales = models.TextField(default='[]', blank=True)

    # Descuentos
    descuento_activo = models.BooleanField(default=False)
    porcentaje_descuento = models.IntegerField(default=0)

    # Nueva opción: fraccionamiento
    fraccionado = models.BooleanField(default=False)

    def get_imagenes_adicionales(self):
        """Devuelve la lista de imágenes adicionales como diccionarios con URLs completas"""
        try:
            imagenes = json.loads(self.imagenes_adicionales)
            # Añadir URL completa a cada imagen
            for img in imagenes:
                if 'url' in img:
                    try:
                        img['url_completa'] = default_storage.url(img['url'])
                    except:
                        img['url_completa'] = settings.MEDIA_URL + img['url'] if img['url'].startswith('productos/') else img['url']
            return imagenes
        except:
            return []

    def set_imagenes_adicionales(self, lista):
        """Guarda la lista de imágenes adicionales como JSON"""
        self.imagenes_adicionales = json.dumps(lista)

    def get_todas_imagenes(self):
        """Devuelve todas las imágenes del producto (principal + adicionales)"""
        imagenes = []
        
        # Imagen principal
        if self.imagen:
            imagenes.append({
                'url': self.imagen.url,
                'tipo': 'principal',
                'nombre': str(self.imagen)
            })
        
        # Imágenes adicionales
        adicionales = self.get_imagenes_adicionales()
        for img in adicionales:
            if 'url_completa' in img:
                imagenes.append({
                    'url': img['url_completa'],
                    'tipo': 'adicional',
                    'nombre': img.get('filename', '')
                })
        
        return imagenes

    def precio_con_descuento(self):
        if self.descuento_activo and self.porcentaje_descuento > 0:
            d = (self.precio * self.porcentaje_descuento) / 100
            return round(self.precio - d, 2)
        return self.precio

    def __str__(self):
        return self.titulo