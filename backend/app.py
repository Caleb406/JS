#!/usr/bin/env python3
"""
Aplicación principal del Sistema de Gestión de Inventario Inteligente
Backend API con Flask
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sys
import os
from werkzeug.utils import secure_filename
from PIL import Image
import uuid
from datetime import datetime

# Agregar el directorio padre al path para importar módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.config import db_config
import mysql.connector
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Permitir peticiones desde el frontend

# Configuración
app.config['SECRET_KEY'] = 'tu_clave_secreta_aqui'
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB máximo

# Asegurar que la carpeta de uploads existe
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Configuración de archivos permitidos
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_image(file):
    """Guardar imagen y retornar la URL"""
    if file and allowed_file(file.filename):
        # Generar nombre único para el archivo
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        
        # Guardar archivo
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # Optimizar imagen
        try:
            with Image.open(filepath) as img:
                # Redimensionar si es muy grande
                if img.width > 800 or img.height > 800:
                    img.thumbnail((800, 800), Image.Resampling.LANCZOS)
                    img.save(filepath, quality=85, optimize=True)
        except Exception as e:
            print(f"Error optimizando imagen: {e}")
        
        # Retornar URL relativa
        return f"/uploads/{unique_filename}"
    
    return None

# Ruta para servir archivos estáticos (imágenes)
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/')
def home():
    """Ruta principal - Información de la API"""
    return jsonify({
        'mensaje': 'Sistema de Gestión de Inventario Inteligente',
        'version': '1.0.0',
        'endpoints': {
            'productos': '/api/productos',
            'categorias': '/api/categorias',
            'movimientos': '/api/movimientos',
            'alertas': '/api/alertas'
        }
    })

@app.route('/api/health')
def health_check():
    """Verificar el estado de la API y base de datos"""
    try:
        # Probar conexión a la base de datos
        connection = db_config.get_connection()
        if connection:
            connection.close()
            db_status = "conectado"
        else:
            db_status = "error"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'database': db_status
    })

@app.route('/api/productos', methods=['GET'])
def obtener_productos():
    """Obtener todos los productos"""
    try:
        connection = db_config.get_connection()
        if not connection:
            return jsonify({'error': 'Error de conexión a la base de datos'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        query = """
        SELECT p.*, c.nombre as categoria_nombre 
        FROM productos p 
        LEFT JOIN categorias c ON p.categoria_id = c.id 
        WHERE p.activo = TRUE
        ORDER BY p.nombre
        """
        
        cursor.execute(query)
        productos = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'productos': productos,
            'total': len(productos)
        })
        
    except Exception as e:
        return jsonify({'error': f'Error obteniendo productos: {str(e)}'}), 500

@app.route('/api/productos/<int:producto_id>', methods=['GET'])
def obtener_producto(producto_id):
    """Obtener un producto específico por ID"""
    try:
        connection = db_config.get_connection()
        if not connection:
            return jsonify({'error': 'Error de conexión a la base de datos'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        query = """
        SELECT p.*, c.nombre as categoria_nombre 
        FROM productos p 
        LEFT JOIN categorias c ON p.categoria_id = c.id 
        WHERE p.id = %s AND p.activo = TRUE
        """
        
        cursor.execute(query, (producto_id,))
        producto = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        if not producto:
            return jsonify({'error': 'Producto no encontrado'}), 404
        
        return jsonify({
            'success': True,
            'producto': producto
        })
        
    except Exception as e:
        return jsonify({'error': f'Error obteniendo producto: {str(e)}'}), 500

@app.route('/api/categorias', methods=['GET'])
def obtener_categorias():
    """Obtener todas las categorías"""
    try:
        connection = db_config.get_connection()
        if not connection:
            return jsonify({'error': 'Error de conexión a la base de datos'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        query = "SELECT * FROM categorias ORDER BY nombre"
        cursor.execute(query)
        categorias = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'categorias': categorias,
            'total': len(categorias)
        })
        
    except Exception as e:
        return jsonify({'error': f'Error obteniendo categorías: {str(e)}'}), 500

@app.route('/api/productos', methods=['POST'])
def crear_producto():
    """Crear un nuevo producto"""
    try:
        # Manejar tanto JSON como form-data
        if request.is_json:
            data = request.get_json()
            imagen_url = data.get('imagen_url', '')
        else:
            data = request.form.to_dict()
            imagen_url = data.get('imagen_url', '')
            
            # Procesar archivo subido si existe
            if 'imagen_archivo' in request.files:
                file = request.files['imagen_archivo']
                if file and file.filename:
                    uploaded_url = save_image(file)
                    if uploaded_url:
                        imagen_url = uploaded_url
        
        # Validar datos requeridos
        required_fields = ['codigo', 'nombre', 'precio']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Campo requerido: {field}'}), 400
        
        connection = db_config.get_connection()
        if not connection:
            return jsonify({'error': 'Error de conexión a la base de datos'}), 500
        
        cursor = connection.cursor()
        
        # Verificar si el código ya existe
        cursor.execute("SELECT id FROM productos WHERE codigo = %s", (data['codigo'],))
        if cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({'error': 'El código del producto ya existe'}), 400
        
        # Insertar nuevo producto
        query = """
        INSERT INTO productos (codigo, nombre, descripcion, precio, stock_actual, stock_minimo, categoria_id, imagen_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        values = (
            data['codigo'],
            data['nombre'],
            data.get('descripcion', ''),
            float(data['precio']),
            int(data.get('stock_actual', 0)),
            int(data.get('stock_minimo', 5)),
            data.get('categoria_id') if data.get('categoria_id') else None,
            imagen_url
        )
        
        cursor.execute(query, values)
        producto_id = cursor.lastrowid
        
        # Obtener el producto creado
        cursor.execute("""
            SELECT p.*, c.nombre as categoria_nombre 
            FROM productos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id 
            WHERE p.id = %s
        """, (producto_id,))
        
        nuevo_producto = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'mensaje': 'Producto creado exitosamente',
            'producto': nuevo_producto
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Error creando producto: {str(e)}'}), 500

@app.route('/api/productos/<int:producto_id>', methods=['PUT'])
def actualizar_producto(producto_id):
    """Actualizar un producto existente"""
    try:
        # Manejar tanto JSON como form-data
        if request.is_json:
            data = request.get_json()
            imagen_url = data.get('imagen_url', '')
        else:
            data = request.form.to_dict()
            imagen_url = data.get('imagen_url', '')
            
            # Procesar archivo subido si existe
            if 'imagen_archivo' in request.files:
                file = request.files['imagen_archivo']
                if file and file.filename:
                    uploaded_url = save_image(file)
                    if uploaded_url:
                        imagen_url = uploaded_url
        
        connection = db_config.get_connection()
        if not connection:
            return jsonify({'error': 'Error de conexión a la base de datos'}), 500
        
        cursor = connection.cursor()
        
        # Verificar si el producto existe
        cursor.execute("SELECT id FROM productos WHERE id = %s", (producto_id,))
        if not cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({'error': 'Producto no encontrado'}), 404
        
        # Verificar si el código ya existe en otro producto
        if 'codigo' in data:
            cursor.execute("SELECT id FROM productos WHERE codigo = %s AND id != %s", (data['codigo'], producto_id))
            if cursor.fetchone():
                cursor.close()
                connection.close()
                return jsonify({'error': 'El código del producto ya existe'}), 400
        
        # Construir query de actualización
        update_fields = []
        values = []
        
        if 'nombre' in data:
            update_fields.append("nombre = %s")
            values.append(data['nombre'])
        
        if 'descripcion' in data:
            update_fields.append("descripcion = %s")
            values.append(data['descripcion'])
        
        if 'precio' in data:
            update_fields.append("precio = %s")
            values.append(float(data['precio']))
        
        if 'stock_actual' in data:
            update_fields.append("stock_actual = %s")
            values.append(int(data['stock_actual']))
        
        if 'stock_minimo' in data:
            update_fields.append("stock_minimo = %s")
            values.append(int(data['stock_minimo']))
        
        if 'categoria_id' in data:
            update_fields.append("categoria_id = %s")
            values.append(data['categoria_id'] if data['categoria_id'] else None)
        
        if 'imagen_url' in data or imagen_url:
            update_fields.append("imagen_url = %s")
            values.append(imagen_url)
        
        if 'codigo' in data:
            update_fields.append("codigo = %s")
            values.append(data['codigo'])
        
        if not update_fields:
            cursor.close()
            connection.close()
            return jsonify({'error': 'No se proporcionaron campos para actualizar'}), 400
        
        # Agregar ID del producto al final
        values.append(producto_id)
        
        query = f"UPDATE productos SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, values)
        
        # Obtener el producto actualizado
        cursor.execute("""
            SELECT p.*, c.nombre as categoria_nombre 
            FROM productos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id 
            WHERE p.id = %s
        """, (producto_id,))
        
        producto_actualizado = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'mensaje': 'Producto actualizado exitosamente',
            'producto': producto_actualizado
        })
        
    except Exception as e:
        return jsonify({'error': f'Error actualizando producto: {str(e)}'}), 500

def generar_alertas_stock():
    """Generar alertas automáticas de stock bajo"""
    try:
        connection = db_config.get_connection()
        if not connection:
            return False
        
        cursor = connection.cursor(dictionary=True)
        
        # Buscar productos con stock bajo
        query = """
        SELECT p.*, c.nombre as categoria_nombre 
        FROM productos p 
        LEFT JOIN categorias c ON p.categoria_id = c.id 
        WHERE p.activo = TRUE AND p.stock_actual <= p.stock_minimo
        """
        
        cursor.execute(query)
        productos_stock_bajo = cursor.fetchall()
        
        alertas_generadas = 0
        
        for producto in productos_stock_bajo:
            # Verificar si ya existe una alerta reciente para este producto
            cursor.execute("""
                SELECT id FROM alertas 
                WHERE producto_id = %s AND tipo_alerta = 'stock_bajo' 
                AND fecha_alerta > DATE_SUB(NOW(), INTERVAL 1 DAY)
            """, (producto['id'],))
            
            if not cursor.fetchone():
                # Crear nueva alerta
                mensaje = f"Stock bajo: {producto['nombre']} (Código: {producto['codigo']}) - Stock actual: {producto['stock_actual']}, Mínimo: {producto['stock_minimo']}"
                
                cursor.execute("""
                    INSERT INTO alertas (producto_id, tipo_alerta, mensaje)
                    VALUES (%s, 'stock_bajo', %s)
                """, (producto['id'], mensaje))
                
                alertas_generadas += 1
        
        # Buscar productos agotados
        query_agotados = """
        SELECT p.*, c.nombre as categoria_nombre 
        FROM productos p 
        LEFT JOIN categorias c ON p.categoria_id = c.id 
        WHERE p.activo = TRUE AND p.stock_actual = 0
        """
        
        cursor.execute(query_agotados)
        productos_agotados = cursor.fetchall()
        
        for producto in productos_agotados:
            # Verificar si ya existe una alerta reciente
            cursor.execute("""
                SELECT id FROM alertas 
                WHERE producto_id = %s AND tipo_alerta = 'stock_agotado' 
                AND fecha_alerta > DATE_SUB(NOW(), INTERVAL 1 DAY)
            """, (producto['id'],))
            
            if not cursor.fetchone():
                # Crear nueva alerta
                mensaje = f"STOCK AGOTADO: {producto['nombre']} (Código: {producto['codigo']}) - Reabastecimiento urgente requerido"
                
                cursor.execute("""
                    INSERT INTO alertas (producto_id, tipo_alerta, mensaje)
                    VALUES (%s, 'stock_agotado', %s)
                """, (producto['id'], mensaje))
                
                alertas_generadas += 1
        
        cursor.close()
        connection.close()
        
        return alertas_generadas
        
    except Exception as e:
        print(f"Error generando alertas: {e}")
        return False

@app.route('/api/alertas', methods=['GET'])
def obtener_alertas():
    """Obtener alertas recientes"""
    try:
        # Generar alertas automáticas primero
        generar_alertas_stock()
        
        connection = db_config.get_connection()
        if not connection:
            return jsonify({'error': 'Error de conexión a la base de datos'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Obtener alertas de los últimos 7 días
        query = """
        SELECT a.*, p.nombre as producto_nombre, p.codigo as producto_codigo
        FROM alertas a
        JOIN productos p ON a.producto_id = p.id
        WHERE a.fecha_alerta > DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY a.fecha_alerta DESC
        LIMIT 20
        """
        
        cursor.execute(query)
        alertas = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'alertas': alertas,
            'total': len(alertas)
        })
        
    except Exception as e:
        return jsonify({'error': f'Error obteniendo alertas: {str(e)}'}), 500

@app.route('/api/alertas/<int:alerta_id>/leer', methods=['PUT'])
def marcar_alerta_leida(alerta_id):
    """Marcar una alerta como leída"""
    try:
        connection = db_config.get_connection()
        if not connection:
            return jsonify({'error': 'Error de conexión a la base de datos'}), 500
        
        cursor = connection.cursor()
        
        cursor.execute("UPDATE alertas SET leida = TRUE WHERE id = %s", (alerta_id,))
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'mensaje': 'Alerta marcada como leída'
        })
        
    except Exception as e:
        return jsonify({'error': f'Error marcando alerta: {str(e)}'}), 500

if __name__ == '__main__':
    print("🚀 Iniciando Sistema de Inventario...")
    print("📡 API disponible en: http://localhost:5000")
    print("🔗 Documentación: http://localhost:5000/")
    app.run(debug=True, host='0.0.0.0', port=5000) 