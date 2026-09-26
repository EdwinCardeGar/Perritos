# Respaldo y restauración de la base de datos

## Respaldo

La base de datos utilizada por el proyecto es `registro_perritos` en MySQL 8.0.

Para generar un respaldo completo se utiliza `mysqldump`:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u root -p --single-transaction registro_perritos > database\respaldo_perritos.sql
```

El archivo generado es:

```text
database/respaldo_perritos.sql
```

El respaldo incluye la estructura y los datos de la base de datos.

## Restauración

Para restaurar el respaldo se utiliza:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p registro_perritos < database\respaldo_perritos.sql
```

Si la base de datos no existe, primero se puede crear:

```sql
CREATE DATABASE registro_perritos
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;
```

Después se ejecuta el comando de restauración.

## Verificación

Después de restaurar se puede comprobar que las tablas existan con:

```sql
USE registro_perritos;
SHOW TABLES;
```

Y verificar la cantidad de registros:

```sql
SELECT COUNT(*) AS total_perritos
FROM perritos;
```

La base utilizada para las pruebas contiene actualmente 15 registros de perritos.
