
USE registro_perritos;

-- 15 PERRITOS DE PRUEBA
-- Las claves son UUID fijos de demostracion.

INSERT INTO perritos (
    id_raza,
    nombre,
    descripcion,
    color_principal,
    latitud,
    longitud,
    foto,
    clave_idempotencia
)
VALUES
(
    (SELECT id_raza FROM razas WHERE nombre='Labrador Retriever'),
    'Max',
    'Perrito amigable de tamaño mediano',
    (SELECT id_color FROM colores WHERE nombre='Dorado'),
    25.4380, -100.9730,
    'pruebas/max.jpg',
    '10000000-0000-4000-8000-000000000001'
),
(
    (SELECT id_raza FROM razas WHERE nombre='Chihuahua'),
    'Luna',
    'Perrita pequeña de color claro',
    (SELECT id_color FROM colores WHERE nombre='Crema'),
    25.4400, -100.9750,
    'pruebas/luna.jpg',
    '10000000-0000-4000-8000-000000000002'
),
(
    (SELECT id_raza FROM razas WHERE nombre='Pastor Alemán'),
    'Rocky',
    'Perrito de tamaño grande',
    (SELECT id_color FROM colores WHERE nombre='Negro'),
    25.4420, -100.9770,
    'pruebas/rocky.jpg',
    '10000000-0000-4000-8000-000000000003'
),
(
    (SELECT id_raza FROM razas WHERE nombre='Sin raza definida / criollo'),
    'Milo',
    'Perrito criollo de color café',
    (SELECT id_color FROM colores WHERE nombre='Café'),
    25.4440, -100.9790,
    'pruebas/milo.jpg',
    '10000000-0000-4000-8000-000000000004'
),
(
    (SELECT id_raza FROM razas WHERE nombre='Beagle'),
    'Toby',
    'Perrito de color blanco y café',
    (SELECT id_color FROM colores WHERE nombre='Blanco'),
    25.4460, -100.9810,
    'pruebas/toby.jpg',
    '10000000-0000-4000-8000-000000000005'
),
(
    (SELECT id_raza FROM razas WHERE nombre='Husky Siberiano'),
    'Nala',
    'Perrita de pelaje gris',
    (SELECT id_color FROM colores WHERE nombre='Gris'),
    25.4480, -100.9830,
    'pruebas/nala.jpg',
    '10000000-0000-4000-8000-000000000006'
),
(
    (SELECT id_raza FROM razas WHERE nombre='Golden Retriever'),
    'Bobby',
    'Perrito de pelaje dorado',
    (SELECT id_color FROM colores WHERE nombre='Dorado'),
    25.4500, -100.9850,
    'pruebas/bobby.jpg',
    '10000000-0000-4000-8000-000000000007'
),
(
    (SELECT id_raza FROM razas WHERE nombre='Poodle'),
    'Coco',
    'Perrito de color blanco',
    (SELECT id_color FROM colores WHERE nombre='Blanco'),
    25.4520, -100.9870,
    'pruebas/coco.jpg',
    '10000000-0000-4000-8000-000000000008'
),
(
    (SELECT id_raza FROM razas WHERE nombre='Boxer'),
    'Bruno',
    'Perrito de color atigrado',
    (SELECT id_color FROM colores WHERE nombre='Atigrado'),
    25.4540, -100.9890,
    'pruebas/bruno.jpg',
    '10000000-0000-4000-8000-000000000009'
),
(
    (SELECT id_raza FROM razas WHERE nombre='Dálmata'),
    'Pecas',
    'Perrito blanco con manchas',
    (SELECT id_color FROM colores WHERE nombre='Manchado'),
    25.4560, -100.9910,
    'pruebas/pecas.jpg',
    '10000000-0000-4000-8000-000000000010'
),
(
    (SELECT id_raza FROM razas WHERE nombre='Rottweiler'),
    'Thor',
    'Perrito de pelaje oscuro',
    (SELECT id_color FROM colores WHERE nombre='Negro'),
    25.4580, -100.9930,
    'pruebas/thor.jpg',
    '10000000-0000-4000-8000-000000000011'
),
(
    (SELECT id_raza FROM razas WHERE nombre='Schnauzer'),
    'Lola',
    'Perrita de color gris',
    (SELECT id_color FROM colores WHERE nombre='Gris'),
    25.4600, -100.9950,
    'pruebas/lola.jpg',
    '10000000-0000-4000-8000-000000000012'
),
(
    (SELECT id_raza FROM razas WHERE nombre='Sin raza definida / criollo'),
    'Simba',
    'Perrito de color canela',
    (SELECT id_color FROM colores WHERE nombre='Canela'),
    25.4620, -100.9970,
    'pruebas/simba.jpg',
    '10000000-0000-4000-8000-000000000013'
),
(
    (SELECT id_raza FROM razas WHERE nombre='Chihuahua'),
    'Chispa',
    'Perrita de color rojizo',
    (SELECT id_color FROM colores WHERE nombre='Rojizo'),
    25.4640, -100.9990,
    'pruebas/chispa.jpg',
    '10000000-0000-4000-8000-000000000014'
),
(
    (SELECT id_raza FROM razas WHERE nombre='Labrador Retriever'),
    'Oso',
    'Perrito de color marrón',
    (SELECT id_color FROM colores WHERE nombre='Marrón'),
    25.4660, -101.0010,
    'pruebas/oso.jpg',
    '10000000-0000-4000-8000-000000000015'
)
ON DUPLICATE KEY UPDATE
    id_perrito = LAST_INSERT_ID(id_perrito);



-- =========================================
-- COLORES ADICIONALES DE PRUEBA
-- =========================================

INSERT IGNORE INTO perrito_colores (id_perrito, id_color)
SELECT p.id_perrito, c.id_color
FROM perritos p
JOIN colores c ON c.nombre = 'Blanco'
WHERE p.clave_idempotencia IN (
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000004'
);

INSERT IGNORE INTO perrito_colores (id_perrito, id_color)
SELECT p.id_perrito, c.id_color
FROM perritos p
JOIN colores c ON c.nombre = 'Café'
WHERE p.clave_idempotencia IN (
    '10000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000010'
);

INSERT IGNORE INTO perrito_colores (id_perrito, id_color)
SELECT p.id_perrito, c.id_color
FROM perritos p
JOIN colores c ON c.nombre = 'Negro'
WHERE p.clave_idempotencia IN (
    '10000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000008',
    '10000000-0000-4000-8000-000000000015'
);