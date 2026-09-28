import pymysql

def get_db_connection():
    return pymysql.connect(
        host="localhost",
        user="root",          # Ajusta si tu usuario es diferente
        password="",          # Pon la contraseña de tu MySQL root
        database="registro_perritos",
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False
    )