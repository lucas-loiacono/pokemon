-- ==================== 1. TIPOS ====================

INSERT INTO tipos (id, nombre) VALUES
(1, 'Normal'),
(2, 'Fuego'),
(3, 'Agua'),
(4, 'Eléctrico'),
(5, 'Planta'),
(6, 'Hielo'),
(7, 'Lucha'),
(8, 'Veneno'),
(9, 'Tierra'),
(10, 'Volador'),
(11, 'Psíquico'),
(12, 'Bicho'),
(13, 'Roca'),
(14, 'Fantasma'),
(15, 'Dragón'),
(16, 'Siniestro'),
(17, 'Acero'),
(18, 'Hada');

SELECT setval('tipos_id_seq', 18, true);

-- ==================== EFECTIVIDAD DE TIPOS ====================

-- Normal
INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
('Normal', 'Roca', 0.50), ('Normal', 'Acero', 0.50), ('Normal', 'Fantasma', 0.00);

-- Fuego
INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
('Fuego', 'Planta', 2.00), ('Fuego', 'Hielo', 2.00), ('Fuego', 'Bicho', 2.00), ('Fuego', 'Acero', 2.00),
('Fuego', 'Fuego', 0.50), ('Fuego', 'Agua', 0.50), ('Fuego', 'Roca', 0.50), ('Fuego', 'Dragón', 0.50);

-- Agua
INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
('Agua', 'Fuego', 2.00), ('Agua', 'Tierra', 2.00), ('Agua', 'Roca', 2.00),
('Agua', 'Agua', 0.50), ('Agua', 'Planta', 0.50), ('Agua', 'Dragón', 0.50);

-- Eléctrico
INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
('Eléctrico', 'Agua', 2.00), ('Eléctrico', 'Volador', 2.00),
('Eléctrico', 'Eléctrico', 0.50), ('Eléctrico', 'Planta', 0.50), ('Eléctrico', 'Dragón', 0.50), ('Eléctrico', 'Tierra', 0.00);

-- Planta
INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
('Planta', 'Agua', 2.00), ('Planta', 'Tierra', 2.00), ('Planta', 'Roca', 2.00),
('Planta', 'Fuego', 0.50), ('Planta', 'Planta', 0.50), ('Planta', 'Veneno', 0.50), ('Planta', 'Volador', 0.50), ('Planta', 'Bicho', 0.50), ('Planta', 'Dragón', 0.50), ('Planta', 'Acero', 0.50);

-- Hielo
INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
('Hielo', 'Planta', 2.00), ('Hielo', 'Tierra', 2.00), ('Hielo', 'Volador', 2.00), ('Hielo', 'Dragón', 2.00),
('Hielo', 'Fuego', 0.50), ('Hielo', 'Agua', 0.50), ('Hielo', 'Hielo', 0.50), ('Hielo', 'Acero', 0.50);

-- Lucha
INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
('Lucha', 'Normal', 2.00), ('Lucha', 'Hielo', 2.00), ('Lucha', 'Roca', 2.00), ('Lucha', 'Siniestro', 2.00), ('Lucha', 'Acero', 2.00),
('Lucha', 'Veneno', 0.50), ('Lucha', 'Volador', 0.50), ('Lucha', 'Psíquico', 0.50), ('Lucha', 'Bicho', 0.50), ('Lucha', 'Hada', 0.50), ('Lucha', 'Fantasma', 0.00);

-- Veneno
INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
('Veneno', 'Planta', 2.00), ('Veneno', 'Hada', 2.00),
('Veneno', 'Veneno', 0.50), ('Veneno', 'Tierra', 0.50), ('Veneno', 'Roca', 0.50), ('Veneno', 'Fantasma', 0.50), ('Veneno', 'Acero', 0.00);

-- Tierra
INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
('Tierra', 'Fuego', 2.00), ('Tierra', 'Eléctrico', 2.00), ('Tierra', 'Veneno', 2.00), ('Tierra', 'Roca', 2.00), ('Tierra', 'Acero', 2.00),
('Tierra', 'Planta', 0.50), ('Tierra', 'Bicho', 0.50), ('Tierra', 'Volador', 0.00);

-- Volador
INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
('Volador', 'Planta', 2.00), ('Volador', 'Lucha', 2.00), ('Volador', 'Bicho', 2.00),
('Volador', 'Eléctrico', 0.50), ('Volador', 'Roca', 0.50), ('Volador', 'Acero', 0.50);

-- Psíquico
INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
('Psíquico', 'Lucha', 2.00), ('Psíquico', 'Veneno', 2.00),
('Psíquico', 'Psíquico', 0.50), ('Psíquico', 'Acero', 0.50), ('Psíquico', 'Siniestro', 0.00);

-- Bicho
INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
('Bicho', 'Planta', 2.00), ('Bicho', 'Psíquico', 2.00), ('Bicho', 'Siniestro', 2.00),
('Bicho', 'Fuego', 0.50), ('Bicho', 'Lucha', 0.50), ('Bicho', 'Veneno', 0.50), ('Bicho', 'Volador', 0.50), ('Bicho', 'Fantasma', 0.50), ('Bicho', 'Acero', 0.50), ('Bicho', 'Hada', 0.50);

-- Roca
INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
('Roca', 'Fuego', 2.00), ('Roca', 'Hielo', 2.00), ('Roca', 'Volador', 2.00), ('Roca', 'Bicho', 2.00),
('Roca', 'Lucha', 0.50), ('Roca', 'Tierra', 0.50), ('Roca', 'Acero', 0.50);

-- Fantasma
INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
('Fantasma', 'Psíquico', 2.00), ('Fantasma', 'Fantasma', 2.00),
('Fantasma', 'Siniestro', 0.50), ('Fantasma', 'Normal', 0.00);

-- Dragón
INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
('Dragón', 'Dragón', 2.00),
('Dragón', 'Acero', 0.50), ('Dragón', 'Hada', 0.00);

-- Siniestro
INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
('Siniestro', 'Psíquico', 2.00), ('Siniestro', 'Fantasma', 2.00),
('Siniestro', 'Lucha', 0.50), ('Siniestro', 'Siniestro', 0.50), ('Siniestro', 'Hada', 0.50);

-- Acero
INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
('Acero', 'Hielo', 2.00), ('Acero', 'Roca', 2.00), ('Acero', 'Hada', 2.00),
('Acero', 'Fuego', 0.50), ('Acero', 'Agua', 0.50), ('Acero', 'Eléctrico', 0.50), ('Acero', 'Acero', 0.50);

-- Hada
INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
('Hada', 'Lucha', 2.00), ('Hada', 'Dragón', 2.00), ('Hada', 'Siniestro', 2.00),
('Hada', 'Fuego', 0.50), ('Hada', 'Veneno', 0.50), ('Hada', 'Acero', 0.50);

-- ==================== 2. HÁBITATS ====================

INSERT INTO habitats (id, tipo, capacidad, imagen_url) VALUES
(1, 'Pradera', 6, 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/habitats/habitatllanura.jpg'),
(2, 'Bosque', 6, 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/habitats/habitatbosque.png'),
(3, 'Agua', 6, 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/habitats/habitatagua.png'),
(4, 'Acero', 6, 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/habitats/habitatacero.png'),
(5, 'Desierto', 6, 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/habitats/habitatdesierto.jpeg'),
(6, 'Hielo', 6, 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/habitats/habitathielo.png');

SELECT setval('habitats_id_seq', 6, true);

-- Tipos aceptados por hábitat
INSERT INTO habitat_tipos_aceptados (habitat_id, tipo_nombre) VALUES
(1, 'Normal'), (1, 'Eléctrico'), (1, 'Psíquico'),
(2, 'Planta'), (2, 'Bicho'), (2, 'Veneno'), (2, 'Hada'),
(3, 'Agua'), (3, 'Volador'),
(4, 'Roca'), (4, 'Lucha'), (4, 'Acero'), (4, 'Siniestro'),
(5, 'Tierra'), (5, 'Fuego'), (5, 'Fantasma'),
(6, 'Hielo'), (6, 'Dragón');


-- ==================== 3. ZONAS DE CAPTURA ====================

INSERT INTO zonas (id, nombre, descripcion, imagen_url) VALUES
(1, 'Pradera', 'Campos abiertos donde habitan Pokémon normales, eléctricos y psíquicos', 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/nuevas_zonas_captura/zonacapturallanura.png'),
(2, 'Bosque', 'Bosque frondoso habitado por Pokémon de planta, bicho, veneno y hada', 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/nuevas_zonas_captura/zonacapturabosque.png'),
(3, 'Playa', 'Costa marina donde encuentras Pokémon de agua y voladores', 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/nuevas_zonas_captura/zonacapturaplaya.png'),
(4, 'Cueva', 'Cueva oscura con Pokémon de roca, lucha, acero y siniestro', 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/nuevas_zonas_captura/zonacapturacueva.png'),
(5, 'Desierto', 'Desierto árido habitado por Pokémon de tierra, fuego y fantasma', 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/nuevas_zonas_captura/zonacapturadesierto.png'),
(6, 'Nieve', 'Montañas nevadas donde viven Pokémon de hielo y dragón', 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/nuevas_zonas_captura/zonacapturahielo.png');

SELECT setval('zonas_id_seq', 6, true);

-- ==================== 4. CONFIGURACIÓN ====================

INSERT INTO inventario_slots_config (nivel_jugador, slots_disponibles) VALUES
(1, 10), (2, 10), (3, 10), (4, 10),
(5, 15), (6, 15), (7, 15), (8, 15), (9, 15),
(10, 20), (11, 20), (12, 20), (13, 20), (14, 20),
(15, 25), (16, 25), (17, 25), (18, 25), (19, 25),
(20, 30), (21, 30), (22, 30), (23, 30), (24, 30),
(25, 40), (26, 40), (27, 40), (28, 40), (29, 40), (30, 40);

INSERT INTO granjas_slots_config (nivel_jugador, slots_disponibles) VALUES
(1, 1), (2, 1),
(3, 2), (4, 2), (5, 2),
(6, 3), (7, 3), (8, 3), (9, 3), (10, 3), (11, 3),
(12, 4), (13, 4), (14, 4), (15, 4), (16, 4), (17, 4),
(18, 5), (19, 5), (20, 5), (21, 5), (22, 5), (23, 5), (24, 5),
(25, 6), (26, 6), (27, 6), (28, 6), (29, 6), (30, 6);

INSERT INTO frutas (id, nombre, tiempo_produccion_minutos, cantidad_produccion, xp_otorgada, imagen_url) VALUES
(1, 'Bayas verdes', 10, 10, 20, 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/imagen%20granja/granjasinfondo.png')
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  tiempo_produccion_minutos = EXCLUDED.tiempo_produccion_minutos,
  cantidad_produccion = EXCLUDED.cantidad_produccion,
  xp_otorgada = EXCLUDED.xp_otorgada,
  imagen_url = EXCLUDED.imagen_url;

SELECT setval('frutas_id_seq', 1, true);

-- ==================== ZONA_TIPOS ====================

-- Zona 1: Pradera (Normal, Eléctrico, Psíquico)
INSERT INTO zona_tipos (zona_id, tipo_id) VALUES
(1, (SELECT id FROM tipos WHERE nombre = 'Normal')),
(1, (SELECT id FROM tipos WHERE nombre = 'Eléctrico')),
(1, (SELECT id FROM tipos WHERE nombre = 'Psíquico'));

-- Zona 2: Bosque (Planta, Bicho, Veneno, Hada)
INSERT INTO zona_tipos (zona_id, tipo_id) VALUES
(2, (SELECT id FROM tipos WHERE nombre = 'Planta')),
(2, (SELECT id FROM tipos WHERE nombre = 'Bicho')),
(2, (SELECT id FROM tipos WHERE nombre = 'Veneno')),
(2, (SELECT id FROM tipos WHERE nombre = 'Hada'));

-- Zona 3: Playa (Agua, Volador)
INSERT INTO zona_tipos (zona_id, tipo_id) VALUES
(3, (SELECT id FROM tipos WHERE nombre = 'Agua')),
(3, (SELECT id FROM tipos WHERE nombre = 'Volador'));

-- Zona 4: Cueva (Roca, Lucha, Acero, Siniestro)
INSERT INTO zona_tipos (zona_id, tipo_id) VALUES
(4, (SELECT id FROM tipos WHERE nombre = 'Roca')),
(4, (SELECT id FROM tipos WHERE nombre = 'Lucha')),
(4, (SELECT id FROM tipos WHERE nombre = 'Acero')),
(4, (SELECT id FROM tipos WHERE nombre = 'Siniestro'));

-- Zona 5: Desierto (Tierra, Fuego, Fantasma)
INSERT INTO zona_tipos (zona_id, tipo_id) VALUES
(5, (SELECT id FROM tipos WHERE nombre = 'Tierra')),
(5, (SELECT id FROM tipos WHERE nombre = 'Fuego')),
(5, (SELECT id FROM tipos WHERE nombre = 'Fantasma'));

-- Zona 6: Nieve (Hielo, Dragón)
INSERT INTO zona_tipos (zona_id, tipo_id) VALUES
(6, (SELECT id FROM tipos WHERE nombre = 'Hielo')),
(6, (SELECT id FROM tipos WHERE nombre = 'Dragón'));

-- Actualizar secuencia
SELECT setval('zona_tipos_id_seq', (SELECT MAX(id) FROM zona_tipos));