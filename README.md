# Perritos
Proyecto: Programación Lógica y Funcional, 6:00pm  Ago-Dic2026
INSTRUCCIONES DE USO: 
# 🐶 Registro de Perritos de la Calle

Aplicación web desarrollada para registrar perros en situación de calle mediante fotografía, nombre, características físicas y geolocalización en un mapa interactivo con Leaflet. Cumple con los requerimientos técnicos de la Unidad 1 de la materia **Programación Lógica y Funcional**.

---

## 1. Integrantes del Equipo y Roles

| Integrante | Rol | Responsabilidades asignadas |
| :--- | :--- | :--- |
| **Edwin Uriel Cárdenas Garza** | **Frontend** | Interfaces de usuario (`base.html`, `style.css`), interacción con mapa Leaflet, captura con cámara/archivo, validaciones en cliente y diseño responsive para celular. |
| **René Emiliano Olivares saucedo** | **Backend** | API REST en Python (FastAPI), validación estricta de servidor, almacenamiento externo de fotos, endpoints del sistema y manejo de idempotencia. |
| **Xavier Israel Saucedo Castillo** | **DBA** | Esquema de base de datos relacional (MySQL), scripts de tablas, catálogos base (razas y colores), datos de prueba y respaldos. |

---

## 2. Requisitos Previos (Versiones Exactas)

El sistema se ejecuta **directamente en el sistema operativo anfitrión sin Docker**:

* **Sistema Operativo:** Windows 10/11 o Linux Ubuntu 22.04+
* **Python:** `3.14.7` (o superior compatible, verificable con `python --version`)
* **Gestor de paquetes:** `pip`
* **Manejador de Base de Datos:** `MySQL Community Server 8.0.x`
* **Navegador Web:** Google Chrome, Microsoft Edge o Mozilla Firefox con soporte de MediaDevices (cámara) y API de Geolocalización

---

## 3. Pasos de Instalación

Ejecutar los siguientes comandos en una terminal con permisos estándar:

### 3.1. Clonar el repositorio
```cmd
git clone [https://github.com/EdwinCardeGar/Perritos.git](https://github.com/EdwinCardeGar/Perritos.git)
cd Perritos

### 3.2. Crear el directorio externo para fotos
Las imágenes no se guardan dentro del código fuente por motivos de seguridad y aislamiento de datos subidos por usuarios:

* En Windows:
```cmd
mkdir C:\PerritosStorage\media

3.3. Configurar dependencias del BackendDOScd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn filetype pydantic mysql-connector-python requests

4. Creación de la Base de Datos y Carga de Datos de PruebaAcceder a MySQL y ejecutar los scripts SQL en el siguiente orden:   DOSmysql -u root -p
Dentro del cliente de MySQL:SQLCREATE DATABASE IF NOT EXISTS registro_perritos;
USE registro_perritos;

-- 1. Estructura de tablas y restricciones de integridad
SOURCE database/01_schema.sql;

-- 2. Catálogos base (mínimo 10 razas y 10 colores)
SOURCE database/02_catalogos.sql;

-- 3. Cargar los 15 perritos de prueba iniciales con foto
SOURCE database/03_datos_prueba.sql;

Comprobar que los datos iniciales se hayan registrado:   SQLSELECT COUNT(*) AS total_perritos FROM perritos;
(Debe devolver al menos 15 registros cargados con sus respectivas fotografías)   

5. Configuración de Variables de Entorno
Crear el archivo .env dentro de la carpeta backend/ con las credenciales locales y la ruta de imágenes:   
-

Ini, TOML
DB_HOST=localhost
DB_PORT=3306
DB_NAME=registro_perritos
DB_USER=root
DB_PASSWORD=tu_password_aqui
RUTA_IMAGENES=C:/PerritosStorage/media

6. Ejecución del Backend y Frontend
Iniciar ambos servicios de forma directa en dos consolas independientes:   
-

Terminal 1: Backend (FastAPI / Uvicorn)
DOS
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
API base: http://localhost:8000


Documentación OpenAPI interactiva: http://localhost:8000/docs

Terminal 2: Frontend
DOS
cd frontend
python -m http.server 5500 --bind 0.0.0.0
URL de acceso local: http://localhost:5500/base.html

   
7. Pruebas desde un Celular en la Misma Red
Obtener la IP local de la computadora en la terminal ejecutando ipconfig (ejemplo: 192.168.0.15).

Conectar el teléfono móvil a la misma red Wi-Fi de la computadora.   

Abrir el navegador en el teléfono móvil e ingresar a:

Plaintext
[http://192.168.0.15:5500/base.html](http://192.168.0.15:5500/base.html)
Para la cámara y ubicación satelital en navegadores móviles sin HTTPS, habilitar orígenes no seguros en Chrome móvil desde chrome://flags/#unsafely-treat-insecure-origin-as-secure agregando http://192.168.0.15:5500.   
-

========================================================================================================================
8. LISTA DE ENDPOINTS DE LA API
========================================================================================================================

METODO | ENDPOINT                 | DESCRIPCION                                      | ENCABEZADOS / PARAMETROS
-------+--------------------------+--------------------------------------------------+----------------------------------
POST   | /api/perritos            | Registra un nuevo perrito. Valida campos         | Header: Idempotency-Key (UUID)
       |                          | obligatorios, tipo MIME real e idempotencia.     | Body: multipart/form-data
-------+--------------------------+--------------------------------------------------+----------------------------------
GET    | /api/perritos            | Lista todos los perritos registrados para        | Ninguno
       |                          | renderizar los pines del mapa y la lista con     |
       |                          | miniaturas de fotos.                             |
-------+--------------------------+--------------------------------------------------+----------------------------------
GET    | /api/perritos/{id}       | Devuelve la ficha tecnica y el detalle completo  | Parametro en URL: id
       |                          | de un perrito especifico.                        |
-------+--------------------------+--------------------------------------------------+----------------------------------
GET    | /api/catalogos/razas     | Retorna el catalogo de razas disponibles         | Ninguno
       |                          | (incluye 'Sin raza definida / criollo').         |
-------+--------------------------+--------------------------------------------------+----------------------------------
GET    | /api/catalogos/colores   | Retorna el catalogo de colores de pelaje         | Ninguno
       |                          | disponibles.                                     |
-------+--------------------------+--------------------------------------------------+----------------------------------
GET    | /api/fotos/{archivo}     | Endpoint seguro para servir la imagen guardada   | Parametro en URL: nombre_archivo
       |                          | fuera del codigo fuente del proyecto.            |
-------+--------------------------+--------------------------------------------------+----------------------------------
GET    | /api/estadisticas/colores| Agregacion declarativa SQL: calcula cuantos      | Ninguno
       |                          | perritos hay registrados por color.              |
========================================================================================================================
9. Capturas de Pantalla
(Adjuntar capturas de pantalla de la vista móvil, el formulario con foto, el mapa general con pines interactivos y la lista con miniaturas)   


10. Problemas Comunes y Soluciones
Error de conexión con la base de datos: Verificar que el servicio MySQL esté corriendo en el puerto 3306 y que las credenciales en el archivo .env coincidan con el usuario local.

Error 404 al abrir el Frontend: Asegurarse de abrir http://localhost:5500/base.html y forzar recarga limpia con Ctrl + F5.

Permiso de cámara o ubicación bloqueado: Los navegadores exigen entornos seguros (HTTPS o localhost) para activar sensores de hardware. En red local, activar la excepción en el navegador móvil o usar el túnel público.   


11. Sección Paradigmas
Declarativo vs. Imperativo en Datos
Declarativo (SQL): El ordenamiento, filtrado y agregación se resuelven exclusivamente mediante el motor SQL en app/database.py.   

Se implementó una consulta con JOIN entre perritos y su tabla intermedia de colores para reconstruir los registros.   


Se implementó una consulta de agregación con GROUP BY y COUNT() para obtener perritos por color directamente en la base sin usar ciclos en Python.   


Declarativo (Frontend): HTML y CSS especifican la estructura visual y restricciones del formulario de forma descriptiva.   


Imperativo: Empleado en app/main.py para la secuencia estricta de validación de campos, comprobación de cabeceras, almacenamiento en disco y control del flujo de respuesta.   
-

Paradigma Funcional
Transformación de datos sin mutación: Implementada en app/services.py dentro de la función procesar_colores_funcional.   
-

Utiliza funciones de orden superior (map, filter, reduce) para descomponer la cadena de colores, omitir vacíos, evitar duplicados y limitar a un máximo de 3 colores en total sin usar bucles explícitos ni alterar colecciones mutables.   
-

Idempotencia del Registro
Mecanismo: El formulario cliente genera un UUID único (Idempotency-Key) al cargarse.   
-

Comportamiento: Si el usuario presiona dos veces el botón o la red reintenta la solicitud, el backend detecta la clave en la tabla perritos, no duplica la fila y devuelve la respuesta previa con el mismo identificador (id) y código 200 OK sin arrojar error.   
-

Demostración:

DOS
python test_idempotency.py
(El script ejecuta dos peticiones seguidas con la misma clave y valida que ambas devuelvan el mismo ID)   
-

12. Sección Despliegue (Punto Extra - Acceso desde Internet)
Arquitectura de Producción Explicada
Servidor de Aplicaciones: FastAPI corre administrado por systemd para reinicio automático ante fallos de proceso.   
-

Proxy Inverso y HTTPS: Nginx o Caddy gestionan los certificados SSL/TLS en el puerto 443 y redirigen las peticiones hacia el puerto 8000 interno.   
-

Base de Datos: MySQL escucha exclusivamente en 127.0.0.1:3306, protegida contra accesos externos directos.   
-

Almacenamiento: El directorio de fotos /var/perritos/media permanece fuera del código fuente con permisos de acceso restringidos.   
-

URL Pública en Vivo
Método utilizado: Túnel seguro mediante Cloudflare Tunnel (cloudflared).   
-

URL de acceso: https://tudominio-o-tunel.trycloudflare.com/base.html

[cite: 1]