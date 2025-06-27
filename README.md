# Sistema de Gestión de Inventario Inteligente

## Descripción
Sistema web completo para gestión de inventario con capacidades de inteligencia artificial para predicción de demanda y alertas automáticas. Desarrollado con Flask en el backend y JavaScript vanilla en el frontend.

## Tecnologías Utilizadas
- **Backend**: Python (Flask)
- **Frontend**: JavaScript (Vanilla JS), Bootstrap 5, Font Awesome
- **Base de Datos**: MySQL
- **IA/ML**: Python (scikit-learn, pandas, numpy)
- **Imágenes**: Pillow (PIL)

## Estructura del Proyecto
```
invento/
├── backend/          # API Flask
│   ├── app.py       # Aplicación principal
│   └── uploads/     # Imágenes de productos
├── frontend/         # Interfaz web
│   ├── index.html   # Página principal
│   ├── app.js       # Lógica JavaScript
│   └── styles.css   # Estilos CSS
├── database/         # Scripts de base de datos
│   ├── config.py    # Configuración DB
│   ├── init_db.py   # Inicialización DB
│   └── schema.sql   # Esquema de base de datos
├── ml_models/        # Modelos de IA
├── docs/            # Documentación
├── config.env       # Variables de entorno
├── requirements.txt # Dependencias Python
└── README.md        # Este archivo
```

## Funcionalidades Implementadas
1. ✅ **Gestión de Productos**: CRUD completo con imágenes
2. ✅ **Control de Stock**: Seguimiento de inventario en tiempo real
3. ✅ **Categorías**: Organización de productos por categorías
4. ✅ **Alertas Automáticas**: Notificaciones de stock bajo
5. ✅ **Dashboard Interactivo**: Estadísticas y métricas
6. ✅ **API RESTful**: Endpoints para integración
7. ✅ **Subida de Imágenes**: Optimización automática de imágenes
8. 🔄 **Predicción de Demanda**: Modelos de IA (en desarrollo)
9. 🔄 **Códigos QR/Barras**: Generación automática (pendiente)

## Instalación

### Prerrequisitos
- Python 3.8 o superior
- MySQL 8.0 o superior
- pip (gestor de paquetes de Python)

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd Invento
```

### 2. Configurar Variables de Entorno
Crear el archivo `config.env` en la raíz del proyecto:
```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=inventario_db
DB_PORT=3306

# Configuración de la Aplicación
SECRET_KEY=tu_clave_secreta_aqui
FLASK_ENV=development
```

### 3. Instalar Dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar Base de Datos
```bash
# Crear la base de datos
mysql -u root -p < database/schema.sql

# O ejecutar el script de inicialización
python database/init_db.py
```

### 5. Ejecutar la Aplicación
```bash
# Desde la raíz del proyecto
python backend/app.py
```

La aplicación estará disponible en: `http://localhost:5000`

## Uso

### Acceso al Sistema
1. Abrir el navegador en `http://localhost:5000`
2. El sistema mostrará el dashboard principal
3. Navegar entre las secciones: Dashboard, Productos, Categorías, Alertas

### Gestión de Productos
- **Ver Productos**: Lista completa con filtros
- **Agregar Producto**: Formulario con subida de imagen
- **Editar Producto**: Modificar información y stock
- **Eliminar Producto**: Desactivar productos (soft delete)

### Alertas del Sistema
- **Stock Bajo**: Notificaciones automáticas
- **Stock Agotado**: Alertas críticas
- **Marcar como Leída**: Gestión de alertas

## API Endpoints

### Productos
- `GET /api/productos` - Listar todos los productos
- `GET /api/productos/{id}` - Obtener producto específico
- `POST /api/productos` - Crear nuevo producto
- `PUT /api/productos/{id}` - Actualizar producto
- `DELETE /api/productos/{id}` - Eliminar producto

### Categorías
- `GET /api/categorias` - Listar categorías

### Alertas
- `GET /api/alertas` - Obtener alertas del sistema
- `PUT /api/alertas/{id}/leer` - Marcar alerta como leída

### Sistema
- `GET /` - Información de la API
- `GET /api/health` - Estado del sistema y base de datos

## Configuración de Desarrollo

### Estructura de Base de Datos
El sistema incluye las siguientes tablas:
- `categorias`: Categorías de productos
- `productos`: Información de productos
- `movimientos_inventario`: Historial de movimientos
- `alertas`: Sistema de notificaciones
- `predicciones_demanda`: Predicciones de IA

### Variables de Entorno
- `DB_HOST`: Host de la base de datos
- `DB_USER`: Usuario de MySQL
- `DB_PASSWORD`: Contraseña de MySQL
- `DB_NAME`: Nombre de la base de datos
- `SECRET_KEY`: Clave secreta para Flask

## Características Técnicas

### Backend (Flask)
- API RESTful con CORS habilitado
- Manejo de archivos con optimización de imágenes
- Conexión segura a MySQL
- Validación de datos
- Manejo de errores

### Frontend (JavaScript)
- Interfaz responsive con Bootstrap 5
- Actualización en tiempo real
- Validación de formularios
- Gestión de estado local

### Base de Datos
- MySQL con relaciones optimizadas
- Índices para mejor rendimiento
- Triggers para auditoría
- Soft delete para productos

## Contribución
1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto
- Proyecto: [Invento - Sistema de Inventario](https://github.com/tu-usuario/Invento)
- Email: tu-email@ejemplo.com

## Changelog
### v1.0.0 (Actual)
- ✅ Sistema básico de gestión de productos
- ✅ Dashboard con estadísticas
- ✅ Sistema de alertas
- ✅ API RESTful completa
- ✅ Interfaz web responsive
- ✅ Gestión de imágenes
- 🔄 Predicción de demanda (en desarrollo) 