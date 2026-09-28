USE registro_perritos;

-- IDs estables compartidos con las opciones del formulario.
INSERT INTO razas (id_raza, nombre) VALUES
(1, 'Sin raza definida / criollo'),
(2, 'Labrador Retriever'),
(3, 'Pastor Alemán'),
(4, 'Golden Retriever'),
(5, 'Chihuahua'),
(6, 'Poodle'),
(7, 'Beagle'),
(8, 'Husky Siberiano'),
(9, 'Rottweiler'),
(10, 'Pug'),
(11, 'Bulldog'),
(12, 'Boxer'),
(13, 'Schnauzer'),
(14, 'Dálmata')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), activo = TRUE;

-- CATÁLOGO DE COLORES
INSERT INTO colores (id_color, nombre) VALUES
(1, 'Negro'),
(2, 'Blanco'),
(3, 'Café'),
(4, 'Marrón'),
(5, 'Gris'),
(6, 'Dorado'),
(7, 'Crema'),
(8, 'Beige'),
(9, 'Canela'),
(10, 'Atigrado'),
(11, 'Manchado'),
(12, 'Negro y blanco'),
(13, 'Rojizo')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), activo = TRUE;