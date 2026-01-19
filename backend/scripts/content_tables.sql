INSERT INTO frutas (nombre, xp_otorgada, tiempo_produccion, imagen) VALUES
(
  'Bayas verdes',
  20,
  20,
  'https://images.wikidexcdn.net/mwuploads/wikidex/e/e7/latest/20230102201736/Baya_Ziuela_EP.png'
),
(
  'Bayas azules',
  35,
  30,
  'https://images.wikidexcdn.net/mwuploads/wikidex/3/3d/latest/20230205160252/Baya_Aranja_EP.png'
),
(
  'Bayas moradas',
  50,
  40,
  'https://images.wikidexcdn.net/mwuploads/wikidex/1/12/latest/20230102201829/Baya_Wiki_EP.png'
);

INSERT INTO habitats (nombre, tipo, capacidad, descripcion, imagen, nivel_requerido) VALUES
-- Nivel 1 (Zonas nivel 1)
(
  'Agua',
  'Agua',
  5,
  'Hábitat para Pokémon exclusivamente de tipo Agua.',
  'https://static.wikia.nocookie.net/dragoncity/images/8/88/Gran_H%C3%A1bitat_Mar.png/revision/latest?cb=20130705185814&path-prefix=es',
  1
),
(
  'Planta',
  'Planta',
  5,
  'Hábitat natural para Pokémon de tipo Planta y Bicho.',
  'https://static.wikia.nocookie.net/dragoncity/images/2/26/H%C3%A1bitat_Natura.png/revision/latest/scale-to-width-down/50?cb=20130705185919&path-prefix=es',
  1
),
(
  'Fuego',
  'Fuego',
  5,
  'Hábitat volcánico para Pokémon de tipo Fuego.',
  'https://static.wikia.nocookie.net/dragoncity/images/3/38/Gran_H%C3%A1bitat_Fuego.png/revision/latest/scale-to-width-down/50?cb=20130705185632&path-prefix=es',
  1
),

-- Nivel 3 (Zonas nivel 3)
(
  'Roca',
  'Roca',
  5,
  'Zona montañosa para Pokémon de tipo Roca y Tierra.',
  'https://static.wikia.nocookie.net/dragoncity/images/3/38/Gran_H%C3%A1bitat_Fuego.png/revision/latest/scale-to-width-down/50?cb=20130705185632&path-prefix=es',
  3
),
(
  'Hielo',
  'Hielo',
  5,
  'Región helada para Pokémon de tipo Hielo.',
  'https://static.wikia.nocookie.net/dragoncity/images/5/5c/H%C3%A1bitat_Metal.png/revision/latest/scale-to-width-down/50?cb=20130705191108&path-prefix=es',
  3
),
(
  'Eléctrico',
  'Eléctrico',
  5,
  'Zona energizada para Pokémon de tipo Eléctrico.',
  'https://static.wikia.nocookie.net/dragoncity/images/4/42/H%C3%A1bitat_El%C3%A9ctrico.png/revision/latest/scale-to-width-down/50?cb=20140426185402&path-prefix=es',
  3
),
(
  'Volador',
  'Volador',
  5,
  'Hábitat aéreo para Pokémon de tipo Volador.',
  'https://static.wikia.nocookie.net/dragoncity/images/c/c1/H%C3%A1bitat_Alma_2.png/revision/latest/scale-to-width-down/1000?cb=20150430192827&path-prefix=es',
  3
),

-- Nivel 7 (Zonas nivel 7)
(
  'Acero',
  'Acero',
  5,
  'Hábitat resistente para Pokémon de tipo Acero.',
  'https://static.wikia.nocookie.net/dragoncity/images/5/5c/H%C3%A1bitat_Metal.png/revision/latest/scale-to-width-down/50?cb=20130705191108&path-prefix=es',
  7
),
(
  'Lucha',
  'Lucha',
  5,
  'Zona de entrenamiento para Pokémon de tipo Lucha.',
  'https://static.wikia.nocookie.net/dragoncity/images/8/84/H%C3%A1bitat_B%C3%A9lico.png/revision/latest/scale-to-width-down/50?cb=20130809220710&path-prefix=es',
  7
),

-- Nivel 12 (Zonas nivel 12)
(
  'Oscuridad',
  'Siniestro',
  5,
  'Hábitat oscuro para Pokémon Veneno, Siniestro y Fantasma.',
  'https://static.wikia.nocookie.net/dragoncity/images/c/ca/H%C3%A1bitat_Oscuro.png/revision/latest/scale-to-width-down/50?cb=20130705191219&path-prefix=es',
  12
),
(
  'Hada',
  'Hada',
  5,
  'Hábitat mágico para Pokémon de tipo Hada y Psíquico.',
  'https://static.wikia.nocookie.net/dragoncity/images/b/b5/H%C3%A1bitat_Luz.png/revision/latest/scale-to-width-down/50?cb=20130809220627&path-prefix=es',
  12
),

-- Nivel 15 (solo hábitat; la zona sigue pudiendo spawnear en cualquier lado)
(
  'Dragón / Legendario',
  'Dragón',
  5,
  'Hábitat ancestral reservado para Pokémon de tipo Dragón y Pokémon Legendarios.',
  'https://static.wikia.nocookie.net/dragoncity/images/8/8f/H%C3%A1bitat_Puro.png/revision/latest/scale-to-width-down/50?cb=20140225194729&path-prefix=es',
  15
);


INSERT INTO zonas_captura (nombre, descripcion, imagen, nivel_requerido) VALUES

-- 🔰 NIVEL 1
(
  'Agua',
  'Zona acuática donde aparecen Pokémon de tipo Agua.',
  'https://raw.githubusercontent.com/lucas-loiacono/imagenes/main/assets/habitats/habitatagua.png',
  1
),
(
  'Planta',
  'Zona natural donde aparecen Pokémon de tipo Planta y Bicho.',
  'https://raw.githubusercontent.com/lucas-loiacono/imagenes/main/assets/habitats/habitatplanta.png',
  1
),
(
  'Fuego',
  'Zona volcánica donde aparecen Pokémon de tipo Fuego.',
  'https://raw.githubusercontent.com/lucas-loiacono/imagenes/main/assets/habitats/habitatfuego.png',
  1
),

-- 🟢 NIVEL 3
(
  'Roca',
  'Zona montañosa donde aparecen Pokémon de tipo Roca y Tierra.',
  'https://raw.githubusercontent.com/lucas-loiacono/imagenes/main/assets/habitats/habitattierra.png',
  3
),
(
  'Hielo',
  'Zona helada donde aparecen Pokémon de tipo Hielo.',
  'https://raw.githubusercontent.com/lucas-loiacono/imagenes/main/assets/habitats/habitathielo.png',
  3
),
(
  'Eléctrico',
  'Zona energizada donde aparecen Pokémon de tipo Eléctrico.',
  'https://raw.githubusercontent.com/lucas-loiacono/imagenes/main/assets/habitats/habitatelectrico.png',
  3
),
(
  'Volador',
  'Zona aérea donde aparecen Pokémon de tipo Volador.',
  'https://raw.githubusercontent.com/lucas-loiacono/imagenes/main/assets/habitats/habitatvolador.png',
  3
),

-- 🟡 NIVEL 7
(
  'Acero',
  'Zona rica en minerales donde aparecen Pokémon de tipo Acero.',
  'https://raw.githubusercontent.com/lucas-loiacono/imagenes/main/assets/habitats/habitatacero.png',
  7
),
(
  'Lucha',
  'Zona de entrenamiento donde aparecen Pokémon de tipo Lucha.',
  'https://raw.githubusercontent.com/lucas-loiacono/imagenes/main/assets/habitats/habitatlucha.png',
  7
),

-- 🔴 NIVEL 12
(
  'Oscuridad',
  'Zona oscura donde aparecen Pokémon de tipo Veneno, Siniestro y Fantasma.',
  'https://raw.githubusercontent.com/lucas-loiacono/imagenes/main/assets/habitats/habitatoscuro.png',
  12
),
(
  'Hada',
  'Zona mágica donde aparecen Pokémon de tipo Hada y Psíquico.',
  'https://raw.githubusercontent.com/lucas-loiacono/imagenes/main/assets/habitats/habitathada.png',
  12
);




INSERT INTO entrenadores (nombre, descripcion, edad, imagen) VALUES

-- 🔰 COMBATES INICIALES
('Entrenador Inicial',
 'Primer combate del juego. Apenas sabe lanzar una Poké Ball.',
 10,
 'https://images.wikidexcdn.net/mwuploads/wikidex/8/8b/latest/20131124130440/VS_Ni%C3%B1a_so%C3%B1adora.png'),

('Entrenador Principiante',
 'Segundo combate del juego. Comienza a entender cómo entrenar Pokémon.',
 11,
 'https://images.wikidexcdn.net/mwuploads/wikidex/9/95/latest/20150914213602/VS_Preescolar_%28ni%C3%B1a%29.png'),

-- 🟢 ENTRENADORES DÉBILES
('Joven Entrenador',
 'Entrenador principiante con poca experiencia en combate.',
 10,
 'https://static.wikia.nocookie.net/espokemon/images/c/cc/VS_Joven.png/revision/latest?cb=20131101232251'),

('Entrenadora Novata',
 'Está dando sus primeros pasos como entrenadora Pokémon.',
 11,
 'https://static.wikia.nocookie.net/espokemon/images/6/66/VS_Chica.png/revision/latest?cb=20150914125916'),

('Criador Principiante',
 'Criador joven que recién comienza a entrenar Pokémon.',
 22,
 'https://static.wikia.nocookie.net/espokemon/images/4/40/VS_Entrenador_promesa.png/revision/latest?cb=20131106174920'),

('Pescador Amateur',
 'Entrenador casual que utiliza Pokémon de tipo agua de bajo nivel.',
 30,
 'https://static.wikia.nocookie.net/espokemon/images/a/a9/VS_Pescador.png/revision/latest?cb=20131103023500'),

('Excursionista Inexperto',
 'Explorador principiante de zonas montañosas.',
 27,
 'https://static.wikia.nocookie.net/espokemon/images/9/9c/VS_Monta%C3%B1ero.png/revision/latest?cb=20141016124617'),

('Entrenador Escolar',
 'Estudiante que entrena Pokémon como actividad recreativa.',
 13,
 'https://static.wikia.nocookie.net/espokemon/images/4/46/VS_Pok%C3%A9fan_%28hombre%29.png/revision/latest?cb=20150914212621'),

-- 🟡 ENTRENADORES CLÁSICOS
('Red','Entrenador legendario de Kanto.',11,
 'https://images.wikidexcdn.net/mwuploads/wikidex/a/a0/latest/20210914072530/VS_Rojo_Masters.png'),

('Leaf','Entrenadora clásica de Kanto.',11,
 'https://images.wikidexcdn.net/mwuploads/wikidex/9/9f/latest/20200825060748/VS_Hoja_%28Traje_S%29_Masters.png'),

('Blue','Rival competitivo y estratega.',11,
 'https://images.wikidexcdn.net/mwuploads/wikidex/b/ba/latest/20200825060918/VS_Azul_%28Traje_S%29_Masters.png'),

('Ethan','Entrenador de Johto.',12,
 'https://images.wikidexcdn.net/mwuploads/wikidex/c/ce/latest/20220526112344/VS_Eco_%28Traje_S%29_Masters_EX.png'),

('Lyra','Entrenadora de Johto.',12,
 'https://images.wikidexcdn.net/mwuploads/wikidex/9/9b/latest/20220526171314/VS_Lira_Masters_EX.png'),

('Brendan','Entrenador de Hoenn.',12,
 'https://images.wikidexcdn.net/mwuploads/wikidex/6/60/latest/20201126084344/VS_Bruno_Masters_EX.png'),

('May','Entrenadora de Hoenn.',12,
 'https://images.wikidexcdn.net/mwuploads/wikidex/4/4f/latest/20120305164046/Aura.png'),

('Lucas','Entrenador de Sinnoh.',12,
 'https://images.wikidexcdn.net/mwuploads/wikidex/3/39/latest/20211221092337/VS_Le%C3%B3n_Masters.png'),

-- 🔴 LÍDERES DE GIMNASIO
('Brock','Líder de gimnasio tipo roca.',15,
 'https://images.wikidexcdn.net/mwuploads/wikidex/9/99/latest/20230902182628/Cara_de_Brock_LGPE.png'),

('Misty','Líder de gimnasio tipo agua.',16,
 'https://images.wikidexcdn.net/mwuploads/wikidex/3/32/latest/20210826070528/VS_Misty_%28Kanto%29_Masters.png'),

('Lt. Surge','Líder de gimnasio tipo eléctrico.',34,
 'https://images.wikidexcdn.net/mwuploads/wikidex/d/db/latest/20190812173135/VS_Teniente_Surge_Masters.png'),

('Erika','Líder de gimnasio tipo planta.',18,
 'https://images.wikidexcdn.net/mwuploads/wikidex/d/dd/latest/20201126083954/VS_Erika_%28Temporada_20%29_Masters.png'),

('Sabrina','Líder de gimnasio tipo psíquico.',21,
 'https://images.wikidexcdn.net/mwuploads/wikidex/6/65/latest/20210728081625/VS_Sabrina_Masters_EX.png');



INSERT INTO entrenador_pokemons (entrenador_id, pokemon_api_id, nivel) VALUES

-- 🔰 COMBATES INICIALES (sin repetir con débiles)
((SELECT id FROM entrenadores WHERE nombre='Entrenador Inicial'), 10, 1), -- Caterpie

((SELECT id FROM entrenadores WHERE nombre='Entrenador Principiante'), 13, 1), -- Weedle
((SELECT id FROM entrenadores WHERE nombre='Entrenador Principiante'), 41, 1), -- Zubat


-- 🟢 ENTRENADORES DÉBILES (1–15)
((SELECT id FROM entrenadores WHERE nombre='Joven Entrenador'), 16, 2), -- Pidgey
((SELECT id FROM entrenadores WHERE nombre='Joven Entrenador'), 19, 3), -- Rattata

((SELECT id FROM entrenadores WHERE nombre='Entrenadora Novata'), 133, 4), -- Eevee
((SELECT id FROM entrenadores WHERE nombre='Entrenadora Novata'), 25, 5),  -- Pikachu

((SELECT id FROM entrenadores WHERE nombre='Criador Principiante'), 52, 7),  -- Meowth
((SELECT id FROM entrenadores WHERE nombre='Criador Principiante'), 113, 8), -- Chansey

((SELECT id FROM entrenadores WHERE nombre='Pescador Amateur'), 129, 9), -- Magikarp
((SELECT id FROM entrenadores WHERE nombre='Pescador Amateur'), 60, 10), -- Poliwag

((SELECT id FROM entrenadores WHERE nombre='Excursionista Inexperto'), 74, 12), -- Geodude
((SELECT id FROM entrenadores WHERE nombre='Excursionista Inexperto'), 66, 13), -- Machop

((SELECT id FROM entrenadores WHERE nombre='Entrenador Escolar'), 92, 14),  -- Gastly
((SELECT id FROM entrenadores WHERE nombre='Entrenador Escolar'), 104, 15), -- Cubone


-- 🟡 ENTRENADORES CLÁSICOS (15–25)
((SELECT id FROM entrenadores WHERE nombre='Red'), 25, 15),
((SELECT id FROM entrenadores WHERE nombre='Red'), 6, 16),
((SELECT id FROM entrenadores WHERE nombre='Red'), 3, 17),

((SELECT id FROM entrenadores WHERE nombre='Leaf'), 3, 17),
((SELECT id FROM entrenadores WHERE nombre='Leaf'), 131, 18),
((SELECT id FROM entrenadores WHERE nombre='Leaf'), 65, 19),

((SELECT id FROM entrenadores WHERE nombre='Blue'), 18, 18),
((SELECT id FROM entrenadores WHERE nombre='Blue'), 59, 19),
((SELECT id FROM entrenadores WHERE nombre='Blue'), 103, 20),

((SELECT id FROM entrenadores WHERE nombre='Ethan'), 157, 19),
((SELECT id FROM entrenadores WHERE nombre='Ethan'), 160, 20),
((SELECT id FROM entrenadores WHERE nombre='Ethan'), 149, 21),

((SELECT id FROM entrenadores WHERE nombre='Lyra'), 154, 20),
((SELECT id FROM entrenadores WHERE nombre='Lyra'), 196, 21),
((SELECT id FROM entrenadores WHERE nombre='Lyra'), 189, 22),

((SELECT id FROM entrenadores WHERE nombre='Brendan'), 254, 21),
((SELECT id FROM entrenadores WHERE nombre='Brendan'), 257, 22),
((SELECT id FROM entrenadores WHERE nombre='Brendan'), 260, 23),

((SELECT id FROM entrenadores WHERE nombre='May'), 256, 22),
((SELECT id FROM entrenadores WHERE nombre='May'), 258, 23),
((SELECT id FROM entrenadores WHERE nombre='May'), 280, 24),

((SELECT id FROM entrenadores WHERE nombre='Lucas'), 392, 23),
((SELECT id FROM entrenadores WHERE nombre='Lucas'), 395, 24),
((SELECT id FROM entrenadores WHERE nombre='Lucas'), 445, 25),


-- 🔴 LÍDERES DE GIMNASIO (todos nivel 30)
((SELECT id FROM entrenadores WHERE nombre='Brock'), 74, 30),
((SELECT id FROM entrenadores WHERE nombre='Brock'), 95, 30),
((SELECT id FROM entrenadores WHERE nombre='Brock'), 111, 30),
((SELECT id FROM entrenadores WHERE nombre='Brock'), 141, 30),
((SELECT id FROM entrenadores WHERE nombre='Brock'), 112, 30),

((SELECT id FROM entrenadores WHERE nombre='Misty'), 120, 30),
((SELECT id FROM entrenadores WHERE nombre='Misty'), 121, 30),
((SELECT id FROM entrenadores WHERE nombre='Misty'), 134, 30),
((SELECT id FROM entrenadores WHERE nombre='Misty'), 130, 30),
((SELECT id FROM entrenadores WHERE nombre='Misty'), 131, 30),

((SELECT id FROM entrenadores WHERE nombre='Lt. Surge'), 100, 30),
((SELECT id FROM entrenadores WHERE nombre='Lt. Surge'), 26, 30),
((SELECT id FROM entrenadores WHERE nombre='Lt. Surge'), 82, 30),
((SELECT id FROM entrenadores WHERE nombre='Lt. Surge'), 125, 30),
((SELECT id FROM entrenadores WHERE nombre='Lt. Surge'), 135, 30),

((SELECT id FROM entrenadores WHERE nombre='Erika'), 114, 30),
((SELECT id FROM entrenadores WHERE nombre='Erika'), 71, 30),
((SELECT id FROM entrenadores WHERE nombre='Erika'), 45, 30),
((SELECT id FROM entrenadores WHERE nombre='Erika'), 182, 30),
((SELECT id FROM entrenadores WHERE nombre='Erika'), 70, 30),

((SELECT id FROM entrenadores WHERE nombre='Sabrina'), 64, 30),
((SELECT id FROM entrenadores WHERE nombre='Sabrina'), 122, 30),
((SELECT id FROM entrenadores WHERE nombre='Sabrina'), 65, 30),
((SELECT id FROM entrenadores WHERE nombre='Sabrina'), 97, 30),
((SELECT id FROM entrenadores WHERE nombre='Sabrina'), 202, 30);



INSERT INTO desbloqueos (nivel, habitats_slots, granjas_slots) VALUES
(1, 1, 1),
(3, 2, 1),
(5, 3, 2),
(7, 4, 2),
(10, 5, 3),
(13, 6, 3),
(16, 7, 4),
(20, 8, 4),
(24, 9, 5),
(28, 10, 5),
(30, 11, 6);
