# Documentación de la API

## Información General

La API del Sistema de Gestión de Inventario Inteligente está construida con Flask y proporciona endpoints RESTful para todas las operaciones del sistema.

**URL Base**: `http://localhost:5000`

## Autenticación

Actualmente la API no requiere autenticación, pero se recomienda implementar JWT para producción.

## Endpoints

### 1. Información del Sistema

#### GET /
Obtiene información general de la API.

**Respuesta:**
```json
{
  "mensaje": "Sistema de Gestión de Inventario Inteligente",
  "version": "1.0.0",
  "endpoints": {
    "productos": "/api/productos",
    "categorias": "/api/categorias",
    "movimientos": "/api/movimientos",
    "alertas": "/api/alertas"
  }
}
```

#### GET /api/health
Verifica el estado de la API y la base de datos.

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00",
  "database": "conectado"
}
```

### 2. Productos

#### GET /api/productos
Obtiene todos los productos activos.

**Parámetros de consulta:**
- `categoria_id` (opcional): Filtrar por categoría
- `stock_bajo` (opcional): Solo productos con stock bajo

**Respuesta:**
```json
{
  "success": true,
  "productos": [
    {
      "id": 1,
      "codigo": "PROD001",
      "nombre": "Laptop HP Pavilion",
      "descripcion": "Laptop de 15 pulgadas",
      "precio": 899.99,
      "stock_actual": 10,
      "stock_minimo": 3,
      "categoria_id": 1,
      "categoria_nombre": "Electrónicos",
      "imagen_url": "/uploads/abc123_laptop.jpg",
      "activo": true,
      "created_at": "2024-01-01T10:00:00",
      "updated_at": "2024-01-01T10:00:00"
    }
  ],
  "total": 1
}
```

#### GET /api/productos/{id}
Obtiene un producto específico por ID.

**Respuesta:**
```json
{
  "success": true,
  "producto": {
    "id": 1,
    "codigo": "PROD001",
    "nombre": "Laptop HP Pavilion",
    "descripcion": "Laptop de 15 pulgadas",
    "precio": 899.99,
    "stock_actual": 10,
    "stock_minimo": 3,
    "categoria_id": 1,
    "categoria_nombre": "Electrónicos",
    "imagen_url": "/uploads/abc123_laptop.jpg",
    "activo": true,
    "created_at": "2024-01-01T10:00:00",
    "updated_at": "2024-01-01T10:00:00"
  }
}
```

#### POST /api/productos
Crea un nuevo producto.

**Cuerpo de la petición (multipart/form-data):**
```json
{
  "codigo": "PROD002",
  "nombre": "Mouse Inalámbrico",
  "descripcion": "Mouse óptico inalámbrico",
  "precio": 25.50,
  "stock_actual": 50,
  "stock_minimo": 10,
  "categoria_id": 1,
  "imagen": "[archivo de imagen]"
}
```

**Respuesta:**
```json
{
  "success": true,
  "mensaje": "Producto creado exitosamente",
  "producto_id": 2
}
```

#### PUT /api/productos/{id}
Actualiza un producto existente.

**Cuerpo de la petición (multipart/form-data):**
```json
{
  "nombre": "Mouse Inalámbrico Pro",
  "precio": 29.99,
  "stock_actual": 45,
  "imagen": "[archivo de imagen opcional]"
}
```

#### DELETE /api/productos/{id}
Elimina (desactiva) un producto.

**Respuesta:**
```json
{
  "success": true,
  "mensaje": "Producto eliminado exitosamente"
}
```

### 3. Categorías

#### GET /api/categorias
Obtiene todas las categorías.

**Respuesta:**
```json
{
  "success": true,
  "categorias": [
    {
      "id": 1,
      "nombre": "Electrónicos",
      "descripcion": "Productos electrónicos y tecnología",
      "created_at": "2024-01-01T10:00:00",
      "updated_at": "2024-01-01T10:00:00"
    }
  ],
  "total": 1
}
```

### 4. Alertas

#### GET /api/alertas
Obtiene todas las alertas del sistema.

**Parámetros de consulta:**
- `leida` (opcional): Filtrar por estado (true/false)

**Respuesta:**
```json
{
  "success": true,
  "alertas": [
    {
      "id": 1,
      "producto_id": 1,
      "tipo_alerta": "stock_bajo",
      "mensaje": "El producto Laptop HP Pavilion tiene stock bajo (3 unidades)",
      "leida": false,
      "fecha_alerta": "2024-01-01T10:00:00"
    }
  ],
  "total": 1
}
```

#### PUT /api/alertas/{id}/leer
Marca una alerta como leída.

**Respuesta:**
```json
{
  "success": true,
  "mensaje": "Alerta marcada como leída"
}
```

## Códigos de Estado HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Datos de entrada inválidos
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error interno del servidor

## Manejo de Errores

Todos los errores devuelven un JSON con la siguiente estructura:

```json
{
  "error": "Descripción del error",
  "success": false
}
```

## Límites

- **Tamaño máximo de archivo**: 5MB
- **Formatos de imagen permitidos**: PNG, JPG, JPEG, GIF, WEBP
- **Rate limiting**: No implementado (recomendado para producción)

## Ejemplos de Uso

### Crear un producto con imagen
```bash
curl -X POST http://localhost:5000/api/productos \
  -F "codigo=PROD003" \
  -F "nombre=Teclado Mecánico" \
  -F "descripcion=Teclado mecánico RGB" \
  -F "precio=89.99" \
  -F "stock_actual=20" \
  -F "stock_minimo=5" \
  -F "categoria_id=1" \
  -F "imagen=@teclado.jpg"
```

### Obtener productos con stock bajo
```bash
curl "http://localhost:5000/api/productos?stock_bajo=true"
``` 