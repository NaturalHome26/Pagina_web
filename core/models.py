from django.db import models

class Producto(models.Model):
    UNIDADES = [
        ("kg", "Kilogramo (kg)"),
        ("unidad", "Unidad"),
        ("paquete", "Paquete"),
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

    # Imagen
    imagen = models.ImageField(upload_to="productos/", blank=True, null=True)

    # Descuentos
    descuento_activo = models.BooleanField(default=False)
    porcentaje_descuento = models.IntegerField(default=0)

    # Nueva opción: fraccionamiento
    fraccionado = models.BooleanField(default=False)

    def precio_con_descuento(self):
        if self.descuento_activo and self.porcentaje_descuento > 0:
            d = (self.precio * self.porcentaje_descuento) / 100
            return round(self.precio - d, 2)
        return self.precio

    def __str__(self):
        return self.titulo
