"""Conexión a SQLite (incluido en Python, no requiere instalar nada)."""
import os
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SQL_DIR = BASE_DIR / "database"
DB_PATH = Path(os.getenv("DB_PATH", SQL_DIR / "perritos.db"))
# Fotos fuera del código fuente (carpeta 'media' del proyecto, ignorada por git)
STORAGE_DIR = Path(os.getenv("RUTA_IMAGENES", BASE_DIR / "media"))


def get_db_connection():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")  # SQLite no valida FK por defecto
    return conn


def _ejecutar_script(conn, nombre):
    conn.executescript((SQL_DIR / nombre).read_text(encoding="utf-8"))


def init_db():
    """Crea tablas, catálogos y (solo si la BD está vacía) los 15 perritos de prueba."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = get_db_connection()
    try:
        _ejecutar_script(conn, "01_schema.sql")
        _ejecutar_script(conn, "02_catalogos.sql")
        if conn.execute("SELECT COUNT(*) FROM perritos").fetchone()[0] == 0:
            _ejecutar_script(conn, "03_datos_prueba.sql")
        conn.commit()
    finally:
        conn.close()
