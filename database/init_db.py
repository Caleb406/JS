#!/usr/bin/env python3
"""
Script para inicializar la base de datos del Sistema de Inventario
"""

import sys
import os

# Agregar el directorio padre al path para importar config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.config import db_config
import mysql.connector

def crear_base_datos():
    """Crear la base de datos si no existe"""
    try:
        # Conectar sin especificar base de datos
        connection = mysql.connector.connect(
            host=db_config.host,
            user=db_config.user,
            password=db_config.password,
            port=db_config.port
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Crear base de datos
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_config.database}")
            print(f"✅ Base de datos '{db_config.database}' creada/verificada")
            
            cursor.close()
            connection.close()
            return True
            
    except mysql.connector.Error as e:
        print(f"❌ Error creando base de datos: {e}")
        return False

def ejecutar_schema():
    """Ejecutar el archivo schema.sql"""
    try:
        connection = db_config.get_connection()
        if not connection:
            return False
            
        cursor = connection.cursor()
        
        # Leer y ejecutar el archivo schema.sql
        schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
        
        with open(schema_path, 'r', encoding='utf-8') as file:
            sql_commands = file.read()
            
        # Dividir por comandos SQL (separados por ;)
        commands = [cmd.strip() for cmd in sql_commands.split(';') if cmd.strip()]
        
        for command in commands:
            if command:
                cursor.execute(command)
                print(f"✅ Comando ejecutado: {command[:50]}...")
        
        cursor.close()
        connection.close()
        print("✅ Esquema de base de datos creado exitosamente")
        return True
        
    except Exception as e:
        print(f"❌ Error ejecutando schema: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Inicializando Sistema de Inventario...")
    print("=" * 50)
    
    # Probar conexión
    print("📡 Probando conexión a MySQL...")
    if not db_config.test_connection():
        print("❌ No se pudo conectar a MySQL")
        print("💡 Asegúrate de que:")
        print("   - MySQL esté ejecutándose")
        print("   - Las credenciales en config.env sean correctas")
        print("   - phpMyAdmin esté disponible")
        return
    
    print("✅ Conexión a MySQL exitosa")
    
    # Crear base de datos
    print("\n🗄️ Creando base de datos...")
    if not crear_base_datos():
        return
    
    # Ejecutar schema
    print("\n📋 Creando tablas...")
    if not ejecutar_schema():
        return
    
    print("\n🎉 ¡Base de datos inicializada exitosamente!")
    print("📊 Puedes acceder a phpMyAdmin para ver las tablas creadas")
    print("🔗 URL típica: http://localhost/phpmyadmin")

if __name__ == "__main__":
    main() 