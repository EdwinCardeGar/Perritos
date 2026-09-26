
USE registro_perritos;

SELECT
    p.id_perrito,
    p.nombre,
    COALESCE(r.nombre, 'Sin raza definida') AS raza,
    cp.nombre AS color_principal,
    GROUP_CONCAT(
        DISTINCT ca.nombre
        ORDER BY ca.nombre
        SEPARATOR ', '
    ) AS colores_adicionales,
    p.latitud,
    p.longitud,
    p.foto,
    p.fecha_registro
FROM perritos p

LEFT JOIN razas r
    ON p.id_raza = r.id_raza

JOIN colores cp
    ON p.id_color_principal = cp.id_color

LEFT JOIN perrito_colores pc
    ON p.id_perrito = pc.id_perrito

LEFT JOIN colores ca
    ON pc.id_color = ca.id_color

GROUP BY
    p.id_perrito,
    p.nombre,
    r.nombre,
    cp.nombre,
    p.latitud,
    p.longitud,
    p.foto,
    p.fecha_registro

ORDER BY p.fecha_registro DESC;



SELECT
    c.nombre AS color,
    COUNT(p.id_perrito) AS total_perritos
FROM colores c
LEFT JOIN perritos p
    ON c.id_color = p.id_color_principal
GROUP BY c.id_color, c.nombre
ORDER BY total_perritos DESC;



SELECT
    r.nombre AS raza,
    COUNT(p.id_perrito) AS total
FROM razas r
LEFT JOIN perritos p
    ON r.id_raza = p.id_raza
GROUP BY r.id_raza, r.nombre
ORDER BY total DESC;



SELECT
    id_perrito,
    nombre,
    descripcion,
    latitud,
    longitud,
    foto,
    fecha_registro
FROM perritos
WHERE nombre LIKE '%Max%'
ORDER BY fecha_registro DESC;


SELECT
    id_perrito,
    nombre,
    latitud,
    longitud
FROM perritos
WHERE latitud BETWEEN 25.40 AND 25.50
  AND longitud BETWEEN -101.05 AND -100.90
ORDER BY nombre;