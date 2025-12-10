from django.shortcuts import render, redirect, get_object_or_404
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import Producto
from django.db.models import Q
from django.http import JsonResponse

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
    
    return render(request, "admin_products.html", {
        "productos": productos,
        "query": query
    })

def admin_edit(request, id):
    producto = get_object_or_404(Producto, id=id)
    
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

        # ✔ GUARDAR DESCRIPCIÓN
        producto.descripcion = request.POST.get("descripcion", "")

        # ✔ GUARDAR FRACCIONADO
        producto.fraccionado = "fraccionado" in request.POST
        
        # ✔ DESCUENTOS
        producto.descuento_activo = "descuento_activo" in request.POST
        porcentaje = request.POST.get("porcentaje_descuento", "0")
        producto.porcentaje_descuento = int(porcentaje) if porcentaje.isdigit() else 0
        
        # ✔ Imagen (solo si subieron una nueva)
        if "imagen" in request.FILES:
            producto.imagen = request.FILES["imagen"]
        
        producto.save()
        return redirect("admin_products")
    
    return render(request, "admin_edit.html", {"producto": producto})

def admin_new(request):
    if request.method == "POST":
        titulo = request.POST.get("titulo", "").strip()
        precio = request.POST.get("precio", "").strip()
        unidad = request.POST.get("unidad", "").strip()
        categoria = request.POST.get("categoria", "").strip()
        descripcion = request.POST.get("descripcion", "").strip()

        if not titulo or not precio or not unidad or not categoria:
            return render(request, "admin_new.html", {
                "error": "Todos los campos marcados con * son obligatorios"
            })

        if "imagen" not in request.FILES:
            return render(request, "admin_new.html", {
                "error": "Debe subir una imagen para el producto"
            })

        # ✔ FRACCIONADO
        fraccionado = "fraccionado" in request.POST

        # ✔ DESCUENTO
        descuento_activo = "descuento_activo" in request.POST
        if descuento_activo:
            porcentaje_raw = request.POST.get("porcentaje_descuento", "").strip()
            porcentaje = int(porcentaje_raw) if porcentaje_raw.isdigit() else 0
        else:
            porcentaje = 0

        try:
            producto = Producto(
                titulo=titulo,
                precio=precio,
                unidad=unidad,
                categoria=categoria,
                descripcion=descripcion,   # ✔ NUEVO
                fraccionado=fraccionado,   # ✔ NUEVO
                descuento_activo=descuento_activo,
                porcentaje_descuento=porcentaje,
                imagen=request.FILES["imagen"]
            )
            producto.save()
            return redirect("admin_products")
        except Exception as e:
            return render(request, "admin_new.html", {
                "error": f"Error: {str(e)}"
            })

    return render(request, "admin_new.html", {"producto": None})


def api_producto(request, id):
    p = Producto.objects.get(id=id)

    return JsonResponse({
        "id": p.id,
        "titulo": p.titulo,
        "descripcion": p.descripcion or "",
        "precio": float(p.precio),
        "precio_final": float(p.precio_con_descuento()),
        "unidad": p.unidad,
        "unidad_display": p.get_unidad_display(),
        "imagen": p.imagen.url if p.imagen else "",
        "fraccionado": bool(p.fraccionado),
    })