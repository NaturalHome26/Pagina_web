from django.shortcuts import render, redirect, get_object_or_404
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import Producto
from django.db.models import Q
from django.http import JsonResponse
import json
import base64
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.contrib.sessions.backends.db import SessionStore

def login_required_admin(view_func):
    """Decorador personalizado para verificar si el usuario está logueado como admin"""
    def wrapper(request, *args, **kwargs):
        if request.session.get('admin_logged_in'):
            return view_func(request, *args, **kwargs)
        return redirect('admin_login')
    return wrapper

def admin_login(request):
    """Vista para login del admin"""
    if request.session.get('admin_logged_in'):
        return redirect('admin_products')
    
    error = None
    
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '').strip()

        # Verificar credenciales desde settings (cargadas desde .env)
        if username == settings.ADMIN_USERNAME and password == settings.ADMIN_PASSWORD:
            # Credenciales correctas
            request.session['admin_logged_in'] = True
            request.session['admin_username'] = username
            # Guardar la sesión
            request.session.save()
            return redirect('admin_products')
        else:
            error = "Usuario o contraseña incorrectos"
    
    return render(request, "admin_login.html", {"error": error})

def admin_logout(request):
    """Vista para logout del admin"""
    if 'admin_logged_in' in request.session:
        del request.session['admin_logged_in']
    if 'admin_username' in request.session:
        del request.session['admin_username']
    request.session.save()
    return redirect('admin_login')

@login_required_admin
def admin_products(request):
    # Búsqueda en admin
    query = request.GET.get('q', '')
    productos_list = Producto.objects.all()
    
    if query:
        productos_list = productos_list.filter(
            Q(titulo__icontains=query) | 
            Q(categoria__icontains=query)
        )
    
    # Paginación
    paginator = Paginator(productos_list, 10)
    page = request.GET.get('page')
    
    try:
        productos = paginator.page(page)
    except PageNotAnInteger:
        productos = paginator.page(1)
    except EmptyPage:
        productos = paginator.page(paginator.num_pages)
    
    # Obtener el nombre de usuario de la sesión
    username = request.session.get('admin_username', 'Admin')
    
    return render(request, "admin_products.html", {
        "productos": productos,
        "query": query,
        "username": username
    })

@login_required_admin
def admin_new(request):
    # Obtener el nombre de usuario de la sesión
    username = request.session.get('admin_username', 'Admin')
    
    if request.method == "POST":
        titulo = request.POST.get("titulo", "").strip()
        precio = request.POST.get("precio", "").strip()
        unidad = request.POST.get("unidad", "").strip()
        categoria = request.POST.get("categoria", "").strip()
        descripcion = request.POST.get("descripcion", "").strip()

        if not titulo or not precio or not unidad or not categoria:
            return render(request, "admin_new.html", {
                "producto": None,
                "error": "Todos los campos marcados con * son obligatorios",
                "username": username
            })

        if "imagen" not in request.FILES:
            return render(request, "admin_new.html", {
                "producto": None,
                "error": "Debe subir una imagen principal para el producto",
                "username": username
            })

        # FRACCIONADO
        fraccionado = "fraccionado" in request.POST

        # DESCUENTO
        descuento_activo = "descuento_activo" in request.POST
        if descuento_activo:
            porcentaje_raw = request.POST.get("porcentaje_descuento", "").strip()
            porcentaje = int(porcentaje_raw) if porcentaje_raw.isdigit() else 0
        else:
            porcentaje = 0

        try:
            # Crear producto con imagen principal
            producto = Producto(
                titulo=titulo,
                precio=precio,
                unidad=unidad,
                categoria=categoria,
                descripcion=descripcion,
                fraccionado=fraccionado,
                descuento_activo=descuento_activo,
                porcentaje_descuento=porcentaje,
                imagen=request.FILES["imagen"]
            )
            
            # Guardar primero para tener un ID
            producto.save()
            
            # Procesar imágenes adicionales si existen
            imagenes_adicionales = []
            if 'additional_images_data' in request.POST and request.POST['additional_images_data']:
                try:
                    additional_images = json.loads(request.POST['additional_images_data'])
                    for img_data in additional_images:
                        if 'base64' in img_data:
                            # CORRECCIÓN: Manejar diferentes formatos de base64
                            base64_data = img_data['base64']
                            
                            # Verificar si tiene el formato completo o solo los datos
                            if ';base64,' in base64_data:
                                # Formato completo: data:image/png;base64,iVBORw0...
                                format_part, imgstr = base64_data.split(';base64,')
                                ext = format_part.split('/')[-1] if '/' in format_part else 'png'
                            else:
                                # Solo datos base64 sin formato
                                imgstr = base64_data
                                # Intentar obtener extensión del tipo
                                ext = img_data.get('type', 'png').split('/')[-1] if '/' in img_data.get('type', '') else 'png'
                            
                            # Generar nombre único
                            from datetime import datetime
                            filename = f"additional_{producto.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{len(imagenes_adicionales)}.{ext}"
                            
                            # Guardar archivo
                            try:
                                data = ContentFile(base64.b64decode(imgstr))
                                file_path = default_storage.save(f'productos/adicionales/{filename}', data)
                                
                                # Agregar a la lista
                                imagenes_adicionales.append({
                                    'url': file_path,
                                    'filename': filename
                                })
                            except Exception as decode_error:
                                print(f"Error decodificando base64: {decode_error}")
                                continue
                except Exception as e:
                    print(f"Error procesando imágenes adicionales: {e}")
            
            # Guardar imágenes adicionales
            producto.set_imagenes_adicionales(imagenes_adicionales)
            producto.save()
            
            return redirect("admin_products")
        except Exception as e:
            return render(request, "admin_new.html", {
                "producto": None,
                "error": f"Error: {str(e)}",
                "username": username
            })

    # GET request - mostrar formulario vacío
    return render(request, "admin_new.html", {
        "producto": None,
        "username": username
    })

@login_required_admin
def admin_edit(request, id):
    producto = get_object_or_404(Producto, id=id)
    
    # Obtener el nombre de usuario de la sesión
    username = request.session.get('admin_username', 'Admin')
    
    if request.method == "POST":
        # ELIMINAR
        if "delete" in request.POST:
            producto.delete()
            return redirect("admin_products")
        
        # EDITAR CAMPOS BÁSICOS
        producto.titulo = request.POST.get("titulo", producto.titulo)
        producto.precio = request.POST.get("precio", producto.precio)
        producto.unidad = request.POST.get("unidad", producto.unidad)
        producto.categoria = request.POST.get("categoria", producto.categoria)
        producto.descripcion = request.POST.get("descripcion", "")
        producto.fraccionado = "fraccionado" in request.POST
        
        # DESCUENTOS
        producto.descuento_activo = "descuento_activo" in request.POST
        porcentaje = request.POST.get("porcentaje_descuento", "0")
        producto.porcentaje_descuento = int(porcentaje) if porcentaje.isdigit() else 0
        
        # Imagen principal (solo si subieron una nueva)
        if "imagen" in request.FILES:
            producto.imagen = request.FILES["imagen"]
        
        # Obtener imágenes adicionales existentes
        imagenes_adicionales = producto.get_imagenes_adicionales()
        
        # Eliminar imágenes marcadas para eliminación
        imagenes_a_mantener = []
        for i, img in enumerate(imagenes_adicionales):
            keep_input = request.POST.get(f"keep_additional_image_{i}", "1")
            if keep_input == "1":
                imagenes_a_mantener.append(img)
        
        # Procesar nuevas imágenes adicionales (si las hay)
        if 'additional_images_data' in request.POST and request.POST['additional_images_data']:
            try:
                additional_images = json.loads(request.POST['additional_images_data'])
                
                for img_data in additional_images:
                    if 'base64' in img_data:
                        # CORRECCIÓN: Manejar diferentes formatos de base64
                        base64_data = img_data['base64']
                        
                        # Verificar si tiene el formato completo o solo los datos
                        if ';base64,' in base64_data:
                            # Formato completo: data:image/png;base64,iVBORw0...
                            format_part, imgstr = base64_data.split(';base64,')
                            ext = format_part.split('/')[-1] if '/' in format_part else 'png'
                        else:
                            # Solo datos base64 sin formato
                            imgstr = base64_data
                            # Intentar obtener extensión del tipo
                            ext = img_data.get('type', 'png').split('/')[-1] if '/' in img_data.get('type', '') else 'png'
                        
                        # Generar nombre único para el archivo
                        from datetime import datetime
                        filename = f"additional_{producto.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{len(imagenes_a_mantener)}.{ext}"
                        
                        # Guardar archivo
                        try:
                            data = ContentFile(base64.b64decode(imgstr))
                            file_path = default_storage.save(f'productos/adicionales/{filename}', data)
                            
                            # Agregar a la lista
                            imagenes_a_mantener.append({
                                'url': file_path,
                                'filename': filename
                            })
                        except Exception as decode_error:
                            print(f"Error decodificando base64: {decode_error}")
                            continue
                
            except Exception as e:
                print(f"Error procesando imágenes adicionales: {e}")
        
        # Guardar la lista actualizada
        producto.set_imagenes_adicionales(imagenes_a_mantener)
        producto.save()
        return redirect("admin_products")
    
    # GET request - mostrar formulario con datos del producto
    return render(request, "admin_edit.html", {
        "producto": producto,
        "username": username
    })

def home(request):
    # Búsqueda
    query = request.GET.get('q', '')
    categoria = request.GET.get('categoria', '')
    
    productos_list = Producto.objects.all()
    
    if query:
        productos_list = productos_list.filter(
            Q(titulo__icontains=query)
        )
    
    if categoria:
        productos_list = productos_list.filter(categoria=categoria)
    
    # Productos con descuento para el carrusel
    productos_con_descuento = Producto.objects.filter(descuento_activo=True)[:10]
    
    # Paginación (20 por página) - Nota: el usuario quiere 10 en el futuro
    paginator = Paginator(productos_list, 20)
    page = request.GET.get('page')
    
    try:
        productos = paginator.page(page)
    except PageNotAnInteger:
        productos = paginator.page(1)
    except EmptyPage:
        productos = paginator.page(paginator.num_pages)
    
    return render(request, "home.html", {
        "productos": productos,
        "query": query,
        "categoria_actual": categoria,
        "productos_descuento": productos_con_descuento
    })

def api_producto(request, id):
    try:
        p = get_object_or_404(Producto, id=id)
        
        # Obtener todas las imágenes
        todas_imagenes = []
        
        # Imagen principal
        if p.imagen:
            try:
                # Construir URL absoluta para la imagen principal
                main_image_url = request.build_absolute_uri(p.imagen.url)
                todas_imagenes.append(main_image_url)
            except Exception as e:
                print(f"Error obteniendo URL de imagen principal: {e}")
        
        # Imágenes adicionales
        imagenes_adicionales = p.get_imagenes_adicionales()
        for img in imagenes_adicionales:
            if 'url_completa' in img:
                try:
                    # Usar la URL completa ya construida por el modelo
                    todas_imagenes.append(request.build_absolute_uri(img['url_completa']))
                except:
                    # Si falla, intentar construir la URL desde el campo 'url'
                    if 'url' in img:
                        try:
                            img_url = default_storage.url(img['url'])
                            todas_imagenes.append(request.build_absolute_uri(img_url))
                        except:
                            pass
            elif 'url' in img:
                try:
                    # Construir URL desde el campo 'url'
                    img_url = default_storage.url(img['url'])
                    todas_imagenes.append(request.build_absolute_uri(img_url))
                except:
                    pass
        
        # Si no hay imágenes, usar placeholder
        if not todas_imagenes:
            todas_imagenes = [request.build_absolute_uri(settings.STATIC_URL + 'img/no-image.png')]
        
        return JsonResponse({
            "id": p.id,
            "titulo": p.titulo,
            "descripcion": p.descripcion or "",
            "precio": float(p.precio),
            "precio_final": float(p.precio_con_descuento()),
            "unidad": p.unidad,
            "unidad_display": p.get_unidad_display(),
            "imagen": p.imagen.url if p.imagen else "",
            "imagenes": todas_imagenes,  # Lista de TODAS las imágenes
            "fraccionado": bool(p.fraccionado),
        })
    except Exception as e:
        print(f"Error en API producto: {e}")
        return JsonResponse({"error": str(e)}, status=500)

# Nueva función para eliminar producto desde la lista
@require_POST
@login_required_admin
def admin_delete(request, id):
    producto = get_object_or_404(Producto, id=id)
    
    try:
        producto.delete()
        # Redirigir con un mensaje de éxito (opcional)
        return redirect('admin_products')
    except Exception as e:
        # En caso de error, redirigir con un mensaje de error
        return redirect('admin_products')