# Configuración de la Base de Datos
# Sistema de Gestión de Inventario Inteligente

import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class DatabaseConfig:
    def __init__(self):
        self.host = os.getenv('DB_HOST', 'localhost')
        self.database = os.getenv('DB_NAME', 'inventario_db')
        self.user = os.getenv('DB_USER', 'root')
        self.password = os.getenv('DB_PASSWORD', '')
        self.port = os.getenv('DB_PORT', 3306)

    def get_connection(self):
        """Obtener conexión a la base de datos"""
        try:
            connection = mysql.connector.connect(
                host=self.host,
                database=self.database,
                user=self.user,
                password=self.password,
                port=self.port,
                autocommit=True
            )
            if connection.is_connected():
                print(f"Conectado a MySQL: {self.database}")
                return connection
        except Error as e:
            print(f"Error conectando a MySQL: {e}")
            return None

    def test_connection(self):
        """Probar la conexión a la base de datos"""
        connection = self.get_connection()
        if connection:
            connection.close()
            return True
        return False

# Instancia global de configuración
db_config = DatabaseConfig() 