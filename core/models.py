from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class Producto(models.Model):
    CATEGORIAS = [
        ('frutas', 'Frutas'),
        ('verduras', 'Verduras'),
        ('otros', 'Otros'),
    ]
    
    UNIDADES = [
        ('kg', 'Kilogramo (kg)'),
        ('unidad', 'Unidad'),
        ('paquete', 'Paquete'),
    ]
    
    titulo = models.CharField(max_length=100, verbose_name="Título")
    imagen = models.ImageField(upload_to="productos/", verbose_name="Imagen")
    categoria = models.CharField(max_length=20, choices=CATEGORIAS, verbose_name="Categoría")
    precio = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name="Precio",
        validators=[MinValueValidator(0)]
    )
    unidad = models.CharField(
        max_length=20, 
        choices=UNIDADES, 
        default="unidad",
        verbose_name="Unidad de medida"
    )
    descuento_activo = models.BooleanField(default=False, verbose_name="¿Activar descuento?")
    porcentaje_descuento = models.IntegerField(
        default=0,
        verbose_name="Porcentaje de descuento",
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name="Última actualización")
    
    def precio_con_descuento(self):
        if self.descuento_activo and self.porcentaje_descuento > 0:
            descuento = self.precio * self.porcentaje_descuento / 100
            return round(float(self.precio) - float(descuento), 2)
        return self.precio
    
    def ahorro(self):
        if self.descuento_activo and self.porcentaje_descuento > 0:
            return round(float(self.precio) - float(self.precio_con_descuento()), 2)
        return 0
    
    def precio_original_formateado(self):
        return f"${self.precio}"
    
    def precio_descuento_formateado(self):
        return f"${self.precio_con_descuento()}"
    
    def __str__(self):
        return self.titulo
    
    def get_categoria_display(self):
        return dict(self.CATEGORIAS).get(self.categoria, self.categoria)
    
    def get_unidad_display(self):
        return dict(self.UNIDADES).get(self.unidad, self.unidad)
    
    class Meta:
        ordering = ['-id']
        verbose_name = "Producto"
        verbose_name_plural = "Productos"