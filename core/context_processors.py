"""
Context processors personalizados para Natural Home.
Proveen variables globales accesibles en todos los templates.
"""
from django.conf import settings


def configuracion_negocio(request):
    """
    Provee configuración de negocio a todos los templates.
    Esto permite acceder a WHATSAPP_NUMBER desde cualquier template.
    """
    return {
        'WHATSAPP_NUMBER': settings.WHATSAPP_NUMBER,
    }
