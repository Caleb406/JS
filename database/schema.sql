-- Sistema de Gestión de Inventario Inteligente
-- Base de datos: inventario_db

CREATE DATABASE IF NOT EXISTS inventario_db;
USE inventario_db;

-- Tabla de Categorías de Productos
CREATE TABLE categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Productos
CREATE TABLE productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    categoria_id INT,
    imagen_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Tabla de Movimientos de Inventario
CREATE TABLE movimientos_inventario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    tipo_movimiento ENUM('entrada', 'salida', 'ajuste') NOT NULL,
    cantidad INT NOT NULL,
    motivo VARCHAR(200),
    usuario_id INT,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Tabla de Alertas
CREATE TABLE alertas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    tipo_alerta ENUM('stock_bajo', 'stock_agotado', 'prediccion_demanda') NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_alerta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Tabla de Predicciones de Demanda
CREATE TABLE predicciones_demanda (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    cantidad_predicha INT NOT NULL,
    fecha_prediccion DATE NOT NULL,
    confianza DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Insertar categorías básicas
INSERT INTO categorias (nombre, descripcion) VALUES
('Electrónicos', 'Productos electrónicos y tecnología'),
('Ropa', 'Vestimenta y accesorios'),
('Hogar', 'Artículos para el hogar'),
('Alimentos', 'Productos alimenticios'),
('Otros', 'Otras categorías');

-- Insertar algunos productos de ejemplo
INSERT INTO productos (codigo, nombre, descripcion, precio, stock_actual, stock_minimo, categoria_id) VALUES
('PROD001', 'Laptop HP Pavilion', 'Laptop de 15 pulgadas, 8GB RAM, 256GB SSD', 899.99, 10, 3, 1),
('PROD002', 'Mouse Inalámbrico', 'Mouse óptico inalámbrico con batería recargable', 25.50, 50, 10, 1),
('PROD003', 'Camiseta Básica', 'Camiseta de algodón 100%, talla M', 15.00, 100, 20, 2),
('PROD004', 'Café Colombiano', 'Café premium de origen colombiano, 500g', 12.99, 30, 5, 4); 