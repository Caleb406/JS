// Sistema de Gestión de Inventario Inteligente - Frontend JavaScript

// Configuración de la API
const API_BASE_URL = 'http://localhost:5000/api';

// Variables globales
let productos = [];
let categorias = [];

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Sistema de Inventario Frontend...');
    
    // Configurar navegación
    setupNavigation();
    
    // Configurar eventos de imagen
    configurarEventosImagen();
    
    // Cargar datos iniciales
    cargarDashboard();
    
    // Verificar estado del sistema
    verificarEstadoSistema();
});

// Configurar navegación entre secciones
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase active de todos los links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Agregar clase active al link clickeado
            this.classList.add('active');
            
            // Ocultar todas las secciones
            sections.forEach(section => section.style.display = 'none');
            
            // Mostrar la sección correspondiente
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
                
                // Cargar datos específicos de la sección
                if (targetId === 'productos') {
                    cargarProductos();
                } else if (targetId === 'categorias') {
                    cargarCategorias();
                } else if (targetId === 'alertas') {
                    cargarAlertas();
                }
            }
        });
    });
}

// Verificar estado del sistema
async function verificarEstadoSistema() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        
        const statusElement = document.getElementById('system-status');
        
        if (data.status === 'ok' && data.database === 'conectado') {
            statusElement.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>Sistema Operativo</strong><br>
                    <small>Base de datos: Conectada</small><br>
                    <small>Última verificación: ${new Date().toLocaleTimeString()}</small>
                </div>
            `;
        } else {
            statusElement.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Error del Sistema</strong><br>
                    <small>Estado: ${data.database}</small>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error verificando estado del sistema:', error);
        document.getElementById('system-status').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error de Conexión</strong><br>
                <small>No se pudo conectar con el servidor</small>
            </div>
        `;
    }
}

// Cargar dashboard con estadísticas
async function cargarDashboard() {
    try {
        // Cargar productos, categorías y alertas en paralelo
        const [productosResponse, categoriasResponse, alertasResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/productos`),
            fetch(`${API_BASE_URL}/categorias`),
            fetch(`${API_BASE_URL}/alertas`)
        ]);
        
        const productosData = await productosResponse.json();
        const categoriasData = await categoriasResponse.json();
        const alertasData = await alertasResponse.json();
        
        if (productosData.success && categoriasData.success) {
            productos = productosData.productos;
            categorias = categoriasData.categorias;
            
            // Actualizar estadísticas
            actualizarEstadisticas();
        }
        
        if (alertasData.success) {
            mostrarAlertasRecientes(alertasData.alertas);
        }
    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
}

// Actualizar estadísticas del dashboard
function actualizarEstadisticas() {
    // Total productos
    document.getElementById('total-productos').textContent = productos.length;
    
    // Productos con stock bajo
    const stockBajo = productos.filter(p => p.stock_actual <= p.stock_minimo).length;
    document.getElementById('stock-bajo').textContent = stockBajo;
    
    // Total categorías
    document.getElementById('total-categorias').textContent = categorias.length;
    
    // Valor total del inventario
    const valorTotal = productos.reduce((total, producto) => {
        return total + (producto.precio * producto.stock_actual);
    }, 0);
    document.getElementById('valor-inventario').textContent = `$${valorTotal.toFixed(2)}`;
}

// Mostrar alertas recientes en el dashboard
function mostrarAlertasRecientes(alertas) {
    const container = document.getElementById('alertas-recientes');
    
    if (alertas.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay alertas recientes</p>';
        return;
    }
    
    let html = '<div class="list-group list-group-flush">';
    
    alertas.slice(0, 5).forEach(alerta => {
        const fecha = new Date(alerta.fecha_alerta).toLocaleDateString();
        const hora = new Date(alerta.fecha_alerta).toLocaleTimeString();
        const tipoIcono = alerta.tipo_alerta === 'stock_agotado' ? 'exclamation-triangle' : 'exclamation-circle';
        const tipoColor = alerta.tipo_alerta === 'stock_agotado' ? 'danger' : 'warning';
        
        html += `
            <div class="list-group-item d-flex justify-content-between align-items-start ${alerta.leida ? 'opacity-50' : ''}">
                <div class="ms-2 me-auto">
                    <div class="fw-bold">
                        <i class="fas fa-${tipoIcono} text-${tipoColor} me-2"></i>
                        ${alerta.producto_nombre}
                    </div>
                    <small class="text-muted">${alerta.mensaje}</small>
                    <br>
                    <small class="text-muted">${fecha} ${hora}</small>
                </div>
                ${!alerta.leida ? 
                    `<button class="btn btn-sm btn-outline-secondary" onclick="marcarAlertaLeida(${alerta.id})" title="Marcar como leída">
                        <i class="fas fa-check"></i>
                    </button>` : 
                    '<span class="badge bg-success">Leída</span>'
                }
            </div>
        `;
    });
    
    if (alertas.length > 5) {
        html += `
            <div class="list-group-item text-center">
                <small class="text-muted">Y ${alertas.length - 5} alertas más...</small>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Marcar alerta como leída
async function marcarAlertaLeida(alertaId) {
    try {
        const response = await fetch(`${API_BASE_URL}/alertas/${alertaId}/leer`, {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Recargar alertas
            const alertasResponse = await fetch(`${API_BASE_URL}/alertas`);
            const alertasData = await alertasResponse.json();
            
            if (alertasData.success) {
                mostrarAlertasRecientes(alertasData.alertas);
            }
        }
    } catch (error) {
        console.error('Error marcando alerta como leída:', error);
    }
}

// Cargar productos
async function cargarProductos() {
    try {
        const response = await fetch(`${API_BASE_URL}/productos`);
        const data = await response.json();
        
        if (data.success) {
            productos = data.productos;
            mostrarProductos(productos);
        } else {
            mostrarError('Error cargando productos');
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarError('Error de conexión');
    }
}

// Mostrar productos en tabla
function mostrarProductos(productos) {
    const container = document.getElementById('lista-productos');
    
    if (productos.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay productos registrados</p>';
        return;
    }
    
    let html = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Imagen</th>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    productos.forEach(producto => {
        const stockClass = producto.stock_actual <= producto.stock_minimo ? 'stock-bajo' : 'stock-normal';
        const stockText = producto.stock_actual === 0 ? 'Agotado' : producto.stock_actual;
        
        // Imagen del producto
        let imagenUrl = producto.imagen_url;
        
        // Si es una imagen local (empieza con /uploads), agregar la URL del servidor
        if (imagenUrl && imagenUrl.startsWith('/uploads/')) {
            imagenUrl = `http://localhost:5000${imagenUrl}`;
        }
        
        const imagenHtml = imagenUrl ? 
            `<img src="${imagenUrl}" alt="${producto.nombre}" class="producto-imagen" onclick="ampliarImagen('${imagenUrl}', '${producto.nombre}')">` :
            `<div class="producto-sin-imagen">
                <i class="fas fa-image"></i>
                <small>Sin imagen</small>
             </div>`;
        
        html += `
            <tr>
                <td class="text-center" style="width: 80px;">
                    ${imagenHtml}
                </td>
                <td><strong>${producto.codigo}</strong></td>
                <td>${producto.nombre}</td>
                <td><span class="badge bg-secondary">${producto.categoria_nombre || 'Sin categoría'}</span></td>
                <td>$${parseFloat(producto.precio).toFixed(2)}</td>
                <td class="${stockClass}">${stockText}</td>
                <td>
                    ${producto.stock_actual === 0 ? 
                        '<span class="stock-agotado">Agotado</span>' : 
                        (producto.stock_actual <= producto.stock_minimo ? 
                            '<span class="badge bg-warning">Stock Bajo</span>' : 
                            '<span class="badge bg-success">Normal</span>')
                    }
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="verProducto(${producto.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning me-1" onclick="editarProducto(${producto.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

// Cargar categorías
async function cargarCategorias() {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias`);
        const data = await response.json();
        
        if (data.success) {
            categorias = data.categorias;
            mostrarCategorias(categorias);
        } else {
            mostrarError('Error cargando categorías');
        }
    } catch (error) {
        console.error('Error cargando categorías:', error);
        mostrarError('Error de conexión');
    }
}

// Mostrar categorías
function mostrarCategorias(categorias) {
    const container = document.getElementById('lista-categorias');
    
    if (categorias.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay categorías registradas</p>';
        return;
    }
    
    let html = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Fecha Creación</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    categorias.forEach(categoria => {
        html += `
            <tr>
                <td><strong>${categoria.id}</strong></td>
                <td>${categoria.nombre}</td>
                <td>${categoria.descripcion || 'Sin descripción'}</td>
                <td>${new Date(categoria.created_at).toLocaleDateString()}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

// Cargar alertas
async function cargarAlertas() {
    try {
        const response = await fetch(`${API_BASE_URL}/alertas`);
        const data = await response.json();
        
        if (data.success) {
            mostrarTodasLasAlertas(data.alertas);
        } else {
            mostrarError('Error cargando alertas');
        }
    } catch (error) {
        console.error('Error cargando alertas:', error);
        mostrarError('Error de conexión');
    }
}

// Mostrar todas las alertas en la sección de alertas
function mostrarTodasLasAlertas(alertas) {
    const container = document.getElementById('lista-alertas');
    
    if (alertas.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-check-circle text-success fa-3x mb-3"></i>
                <h5 class="text-muted">¡Excelente!</h5>
                <p class="text-muted">No hay alertas pendientes. Tu inventario está en buen estado.</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="list-group">';
    
    alertas.forEach(alerta => {
        const fecha = new Date(alerta.fecha_alerta).toLocaleDateString();
        const hora = new Date(alerta.fecha_alerta).toLocaleTimeString();
        const tipoIcono = alerta.tipo_alerta === 'stock_agotado' ? 'exclamation-triangle' : 'exclamation-circle';
        const tipoColor = alerta.tipo_alerta === 'stock_agotado' ? 'danger' : 'warning';
        const tipoTexto = alerta.tipo_alerta === 'stock_agotado' ? 'Stock Agotado' : 'Stock Bajo';
        
        html += `
            <div class="list-group-item list-group-item-action ${alerta.leida ? 'opacity-75' : ''}">
                <div class="d-flex w-100 justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center mb-2">
                            <span class="badge bg-${tipoColor} me-2">${tipoTexto}</span>
                            <h6 class="mb-0">${alerta.producto_nombre}</h6>
                            <small class="text-muted ms-2">(${alerta.producto_codigo})</small>
                        </div>
                        <p class="mb-1">${alerta.mensaje}</p>
                        <small class="text-muted">
                            <i class="fas fa-clock me-1"></i>${fecha} ${hora}
                        </small>
                    </div>
                    <div class="ms-3">
                        ${!alerta.leida ? 
                            `<button class="btn btn-sm btn-outline-success" onclick="marcarAlertaLeida(${alerta.id})" title="Marcar como leída">
                                <i class="fas fa-check me-1"></i>Leída
                            </button>` : 
                            '<span class="badge bg-success"><i class="fas fa-check me-1"></i>Leída</span>'
                        }
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Funciones placeholder para futuras funcionalidades
function mostrarFormularioProducto() {
    // Limpiar formulario
    document.getElementById('productoForm').reset();
    document.getElementById('productoModalLabel').innerHTML = '<i class="fas fa-plus me-2"></i>Nuevo Producto';
    
    // Cargar categorías en el select
    cargarCategoriasEnSelect();
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('productoModal'));
    modal.show();
}

function cargarCategoriasEnSelect() {
    const select = document.getElementById('categoria');
    select.innerHTML = '<option value="">Seleccionar categoría</option>';
    
    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nombre;
        select.appendChild(option);
    });
}

async function guardarProducto() {
    try {
        const form = document.getElementById('productoForm');
        const formData = new FormData(form);
        
        // Verificar si hay archivo seleccionado
        const archivoInput = document.getElementById('imagen_archivo');
        const urlInput = document.getElementById('imagen_url');
        
        // Si hay archivo, usar FormData (subida de archivo)
        if (archivoInput.files.length > 0) {
            // Validar campos requeridos
            if (!formData.get('codigo') || !formData.get('nombre') || !formData.get('precio')) {
                alert('Por favor completa todos los campos requeridos');
                return;
            }
            
            // Enviar con FormData para archivos
            const response = await fetch(`${API_BASE_URL}/productos`, {
                method: 'POST',
                body: formData // No incluir Content-Type, se establece automáticamente
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('productoModal'));
                modal.hide();
                
                // Mostrar mensaje de éxito
                mostrarNotificacion('Producto creado exitosamente', 'success');
                
                // Recargar productos
                await cargarProductos();
                
                // Actualizar dashboard
                await cargarDashboard();
            } else {
                mostrarNotificacion(data.error || 'Error creando producto', 'error');
            }
        } else {
            // Si no hay archivo, usar JSON (solo URL)
            const productoData = {};
            for (let [key, value] of formData.entries()) {
                if (value !== '' && key !== 'imagen_archivo') {
                    productoData[key] = value;
                }
            }
            
            // Validar campos requeridos
            if (!productoData.codigo || !productoData.nombre || !productoData.precio) {
                alert('Por favor completa todos los campos requeridos');
                return;
            }
            
            // Enviar datos al servidor
            const response = await fetch(`${API_BASE_URL}/productos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productoData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('productoModal'));
                modal.hide();
                
                // Mostrar mensaje de éxito
                mostrarNotificacion('Producto creado exitosamente', 'success');
                
                // Recargar productos
                await cargarProductos();
                
                // Actualizar dashboard
                await cargarDashboard();
            } else {
                mostrarNotificacion(data.error || 'Error creando producto', 'error');
            }
        }
        
    } catch (error) {
        console.error('Error guardando producto:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}

function verProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        let imagenUrl = producto.imagen_url;
        
        // Si es una imagen local, agregar la URL del servidor
        if (imagenUrl && imagenUrl.startsWith('/uploads/')) {
            imagenUrl = `http://localhost:5000${imagenUrl}`;
        }
        
        const mensaje = `
Producto: ${producto.nombre}
Código: ${producto.codigo}
Precio: $${producto.precio}
Stock: ${producto.stock_actual}
Categoría: ${producto.categoria_nombre || 'Sin categoría'}
Descripción: ${producto.descripcion || 'Sin descripción'}
${imagenUrl ? `Imagen: ${imagenUrl}` : 'Imagen: No disponible'}
        `;
        alert(mensaje);
    }
}

function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        // Llenar formulario con datos del producto
        document.getElementById('codigo').value = producto.codigo;
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('descripcion').value = producto.descripcion || '';
        document.getElementById('precio').value = producto.precio;
        document.getElementById('stock_actual').value = producto.stock_actual;
        document.getElementById('stock_minimo').value = producto.stock_minimo;
        document.getElementById('imagen_url').value = producto.imagen_url || '';
        
        // Cargar categorías y seleccionar la correcta
        cargarCategoriasEnSelect();
        setTimeout(() => {
            document.getElementById('categoria').value = producto.categoria_id || '';
        }, 100);
        
        // Cambiar título del modal
        document.getElementById('productoModalLabel').innerHTML = '<i class="fas fa-edit me-2"></i>Editar Producto';
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('productoModal'));
        modal.show();
        
        // Cambiar función del botón guardar
        document.querySelector('#productoModal .btn-primary').onclick = () => actualizarProducto(producto.id);
    }
}

async function actualizarProducto(id) {
    try {
        const form = document.getElementById('productoForm');
        const formData = new FormData(form);
        
        // Verificar si hay archivo seleccionado
        const archivoInput = document.getElementById('imagen_archivo');
        
        // Si hay archivo, usar FormData (subida de archivo)
        if (archivoInput.files.length > 0) {
            // Enviar con FormData para archivos
            const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
                method: 'PUT',
                body: formData // No incluir Content-Type, se establece automáticamente
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('productoModal'));
                modal.hide();
                
                // Mostrar mensaje de éxito
                mostrarNotificacion('Producto actualizado exitosamente', 'success');
                
                // Recargar productos
                await cargarProductos();
                
                // Actualizar dashboard
                await cargarDashboard();
                
                // Restaurar función original del botón
                document.querySelector('#productoModal .btn-primary').onclick = guardarProducto;
            } else {
                mostrarNotificacion(data.error || 'Error actualizando producto', 'error');
            }
        } else {
            // Si no hay archivo, usar JSON (solo URL)
            const productoData = {};
            for (let [key, value] of formData.entries()) {
                if (value !== '' && key !== 'imagen_archivo') {
                    productoData[key] = value;
                }
            }
            
            // Enviar datos al servidor
            const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productoData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('productoModal'));
                modal.hide();
                
                // Mostrar mensaje de éxito
                mostrarNotificacion('Producto actualizado exitosamente', 'success');
                
                // Recargar productos
                await cargarProductos();
                
                // Actualizar dashboard
                await cargarDashboard();
                
                // Restaurar función original del botón
                document.querySelector('#productoModal .btn-primary').onclick = guardarProducto;
            } else {
                mostrarNotificacion(data.error || 'Error actualizando producto', 'error');
            }
        }
        
    } catch (error) {
        console.error('Error actualizando producto:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}

function mostrarNotificacion(mensaje, tipo) {
    // Crear notificación temporal
    const notificacion = document.createElement('div');
    notificacion.className = `alert alert-${tipo === 'success' ? 'success' : 'danger'} position-fixed`;
    notificacion.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notificacion.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
        ${mensaje}
    `;
    
    document.body.appendChild(notificacion);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.remove();
    }, 3000);
}

function mostrarError(mensaje) {
    console.error(mensaje);
    mostrarNotificacion(mensaje, 'error');
}

// Funciones para manejo de imágenes
function configurarEventosImagen() {
    // Vista previa de imagen desde URL
    document.getElementById('imagen_url').addEventListener('input', function() {
        const url = this.value;
        if (url) {
            mostrarVistaPrevia(url);
        } else {
            ocultarVistaPrevia();
        }
    });
    
    // Vista previa de imagen desde archivo
    document.getElementById('imagen_archivo').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB
                alert('El archivo es demasiado grande. Máximo 5MB.');
                this.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                mostrarVistaPrevia(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            ocultarVistaPrevia();
        }
    });
}

function mostrarVistaPrevia(src) {
    const container = document.getElementById('vista_previa_container');
    const imagen = document.getElementById('vista_previa');
    
    imagen.src = src;
    container.style.display = 'block';
}

function ocultarVistaPrevia() {
    const container = document.getElementById('vista_previa_container');
    container.style.display = 'none';
}

function ampliarImagen(src, nombre) {
    // Crear modal para ampliar imagen
    const modalHtml = `
        <div class="modal fade" id="imagenModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${nombre}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img src="${src}" alt="${nombre}" class="img-fluid" style="max-height: 500px;">
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior si existe
    const modalAnterior = document.getElementById('imagenModal');
    if (modalAnterior) {
        modalAnterior.remove();
    }
    
    // Agregar nuevo modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('imagenModal'));
    modal.show();
    
    // Remover modal del DOM cuando se cierre
    document.getElementById('imagenModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
} 