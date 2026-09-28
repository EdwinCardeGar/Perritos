import os
import uuid
import filetype
from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException, status
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection
from services import procesar_colores_funcional

app = FastAPI(title="API Perritos de la Calle")

# Habilitar CORS para permitir peticiones desde el frontend web
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RUTA_IMAGENES = os.getenv("RUTA_IMAGENES", r"C:\PerritosStorage\media")
os.makedirs(RUTA_IMAGENES, exist_ok=True)

@app.post("/api/perritos", status_code=status.HTTP_201_CREATED)
async def registrar_perrito(
    nombre: str = Form(...),
    id_raza: int = Form(None),
    color_principal: int = Form(...),
    colores_adicionales: str = Form(default=""),
    latitud: float = Form(...),
    longitud: float = Form(...),
    descripcion: str = Form(default=""),
    foto: UploadFile = File(...),
    idempotency_key: str = Header(..., alias="Idempotency-Key")
):
    # 1. Validar nombre no vacío
    if not nombre.strip():
        raise HTTPException(status_code=400, detail="El nombre no puede estar vacío.")

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # 2. Idempotencia: Verificar si la clave ya existe
            sql_check = "SELECT id_perrito, nombre, foto FROM perritos WHERE clave_idempotencia = %s"
            cursor.execute(sql_check, (idempotency_key,))
            existente = cursor.fetchone()
            
            if existente:
                return JSONResponse(status_code=200, content={
                    "mensaje": "Registro procesado previamente",
                    "id_perrito": existente["id_perrito"],
                    "nombre": existente["nombre"],
                    "foto": existente["foto"]
                })

            # 3. Validar archivo de imagen (magic bytes)
            contenido = await foto.read()
            kind = filetype.guess(contenido)
            if kind is None or kind.extension not in ["jpg", "jpeg", "png", "webp"]:
                raise HTTPException(status_code=400, detail="El archivo no es una imagen válida (JPG, PNG, WEBP).")

            # 4. Guardar imagen en la carpeta externa
            nombre_archivo = f"{uuid.uuid4()}.{kind.extension}"
            ruta_destino = os.path.join(RUTA_IMAGENES, nombre_archivo)
            with open(ruta_destino, "wb") as f:
                f.write(contenido)

            foto_relativa = f"/api/fotos/{nombre_archivo}"

            # 5. Transformación funcional de colores
            colores_totales = procesar_colores_funcional(color_principal, colores_adicionales)

            # 6. Inserción en la tabla perritos
            sql_insert = """
                INSERT INTO perritos (id_raza, nombre, descripcion, color_principal, latitud, longitud, foto, clave_idempotencia)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql_insert, (
                id_raza,
                nombre.strip(),
                descripcion.strip() or None,
                color_principal,
                latitud,
                longitud,
                foto_relativa,
                idempotency_key
            ))
            perrito_id = cursor.lastrowid

            # 7. Inserción de colores adicionales en perrito_colores
            colores_secundarios = [c for c in colores_totales if c != color_principal]
            for col_id in colores_secundarios:
                cursor.execute(
                    "INSERT IGNORE INTO perrito_colores (id_perrito, id_color) VALUES (%s, %s)",
                    (perrito_id, col_id)
                )

            conn.commit()

            return {
                "id_perrito": perrito_id,
                "nombre": nombre.strip(),
                "foto": foto_relativa
            }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/api/perritos")
def listar_perritos():
    """Consulta declarativa con JOIN exigida por la rúbrica."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Consulta tomada del archivo 04_consultas.sql del DBA
            sql = """
                SELECT 
                    p.id_perrito, p.nombre, p.descripcion,
                    COALESCE(r.nombre, 'Sin raza definida') AS raza,
                    cp.nombre AS color_principal,
                    p.latitud, p.longitud, p.foto, p.fecha_registro
                FROM perritos p
                LEFT JOIN razas r ON p.id_raza = r.id_raza
                JOIN colores cp ON p.color_principal = cp.id_color
                ORDER BY p.fecha_registro DESC
            """
            cursor.execute(sql)
            return cursor.fetchall()
    finally:
        conn.close()

@app.get("/api/fotos/{nombre_archivo}")
def servir_foto(nombre_archivo: str):
    ruta_archivo = os.path.join(RUTA_IMAGENES, nombre_archivo)
    if not os.path.isfile(ruta_archivo):
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    return FileResponse(ruta_archivo)