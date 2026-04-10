import os
from dotenv import load_dotenv
import psycopg

# Cargar variables del .env
load_dotenv()

def probar_conexion():
    try:
        conn = psycopg.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD")
        )

        print("Conexion exitosa ✅")
        conn.close()

    except Exception as e:
        print("Error de conexion:", e)


if __name__ == "__main__":
    probar_conexion()