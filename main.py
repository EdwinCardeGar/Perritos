import os
import uuid
import filetype
from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException, status
from fastapi.responses import FileResponse, JSONResponse
from app.database import get_db_connection
from app.services import procesar_colores_funcional

app = FastAPI(title="API Registro de Perritos")
RUTA_IMAGENES = os.getenv("RUTA_IMAGENES", "/tmp/perritos_storage")
os.makedirs(RUTA_IMAGENES, exist_ok=True)

@app.post("/api/perritos", status_code=status.HTTP_201_CREATED)
async def registrar_perrito(
    nombre: str = Form(...),
    raza_id: int = Form(None),
    color_principal_id: int = Form(...),
    colores_adicionales: str = Form(default=""), # Lista separada por comas ej: "2,5"
    latitud: float = Form(...),
    longitud: float = Form(...),
    foto: UploadFile = File(...),
    idempotency_key: str = Header(..., alias="Idempotency-Key")
):
    # 1. Validar nombre no vacío ni solo espacios
    if not nombre.strip():
        raise HTTPException(status_code=400, detail="El nombre no puede estar vacío.")

    conn = get_db_connection()
    cursor = conn.cursor()

    # 2. Idempotencia: Verificar si ya existe el registro con esa clave
    cursor.execute("SELECT id, nombre, foto_url FROM perritos WHERE idempotency_key = %s", (idempotency_key,))
    existente = cursor.fetchone()
    if existente:
        conn.close()
        # Retorna el mismo estado y datos sin marcar error de duplicado
        return JSONResponse(status_code=200, content={
            "mensaje": "Registro procesado previamente",
            "id": existente[0],
            "nombre": existente[1],
            "foto_url": existente[2]
        })

    # 3. Validar tipo real de imagen (magic bytes)
    contenido = await foto.read()
    kind = filetype.guess(contenido)
    if kind is None or kind.extension not in ["jpg", "jpeg", "png", "webp"]:
        raise HTTPException(status_code=400, detail="El archivo no es una imagen válida (JPG, PNG, WEBP).")

    # 4. Guardar archivo fuera del proyecto con nombre seguro
    nombre_archivo = f"{uuid.uuid4()}.{kind.extension}"
    ruta_destino = os.path.join(RUTA_IMAGENES, nombre_archivo)
    with open(ruta_destino, "wb") as f:
        f.write(contenido)

    # 5. Transformación funcional de colores (sin mutar y sin bucles explícitos)
    lista_colores = procesar_colores_funcional(color_principal_id, colores_adicionales)

    # 6. Inserción en Base de Datos
    cursor.execute("""
        INSERT INTO perritos (idempotency_key, nombre, raza_id, latitud, longitud, foto_url)
        VALUES (%s, %s, %s, %s, %s, %s) RETURNING id;
    """, (idempotency_key, nombre.strip(), raza_id, latitud, longitud, f"/api/fotos/{nombre_archivo}"))
    
    perrito_id = cursor.fetchone()[0]

    # Inserción relacional de colores
    for orden, color_id in enumerate(lista_colores, start=1):
        cursor.execute("""
            INSERT INTO perrito_colores (perrito_id, color_id, orden)
            VALUES (%s, %s, %s);
        """, (perrito_id, color_id, orden))

    conn.commit()
    conn.close()

    return {"id": perrito_id, "nombre": nombre.strip(), "foto_url": f"/api/fotos/{nombre_archivo}"}

@app.get("/api/fotos/{nombre_archivo}")
async def servir_foto(nombre_archivo: str):
    # Endpoint seguro para servir imágenes sin exponer la carpeta estática
    ruta_archivo = os.path.join(RUTA_IMAGENES, nombre_archivo)
    if not os.path.isfile(ruta_archivo):
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    return FileResponse(ruta_archivo)