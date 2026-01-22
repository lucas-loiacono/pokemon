-- ========================================
-- INSERTS DE TIPOS DE POKÉMON
-- ========================================

INSERT INTO tipos (nombre) VALUES
  ('normal'), 
  ('fuego'), 
  ('agua'), 
  ('planta'), 
  ('electrico'), 
  ('hielo'),
  ('lucha'), 
  ('veneno'), 
  ('tierra'), 
  ('volador'), 
  ('psiquico'), 
  ('bicho'),
  ('roca'), 
  ('fantasma'), 
  ('dragon'), 
  ('siniestro'), 
  ('acero'), 
  ('hada');

-- ========================================
-- INSERTS DE EFECTIVIDAD DE TIPOS
-- ========================================

INSERT INTO tipo_efectividad (tipo_atacante, tipo_defensor, multiplicador) VALUES
  -- Fuego
  ('fuego', 'planta', 2.0),
  ('fuego', 'hielo', 2.0),
  ('fuego', 'bicho', 2.0),
  ('fuego', 'acero', 2.0),
  ('fuego', 'agua', 0.5),
  ('fuego', 'fuego', 0.5),
  ('fuego', 'roca', 0.5),
  ('fuego', 'dragon', 0.5),
  
  -- Agua
  ('agua', 'fuego', 2.0),
  ('agua', 'tierra', 2.0),
  ('agua', 'roca', 2.0),
  ('agua', 'planta', 0.5),
  ('agua', 'agua', 0.5),
  ('agua', 'dragon', 0.5),
  
  -- Planta
  ('planta', 'agua', 2.0),
  ('planta', 'tierra', 2.0),
  ('planta', 'roca', 2.0),
  ('planta', 'fuego', 0.5),
  ('planta', 'planta', 0.5),
  ('planta', 'veneno', 0.5),
  ('planta', 'volador', 0.5),
  ('planta', 'bicho', 0.5),
  ('planta', 'dragon', 0.5),
  ('planta', 'acero', 0.5),
  
  -- Eléctrico
  ('electrico', 'agua', 2.0),
  ('electrico', 'volador', 2.0),
  ('electrico', 'planta', 0.5),
  ('electrico', 'electrico', 0.5),
  ('electrico', 'dragon', 0.5),
  ('electrico', 'tierra', 0.0),
  
  -- Hielo
  ('hielo', 'planta', 2.0),
  ('hielo', 'tierra', 2.0),
  ('hielo', 'volador', 2.0),
  ('hielo', 'dragon', 2.0),
  ('hielo', 'fuego', 0.5),
  ('hielo', 'agua', 0.5),
  ('hielo', 'hielo', 0.5),
  ('hielo', 'acero', 0.5),
  
  -- Lucha
  ('lucha', 'normal', 2.0),
  ('lucha', 'hielo', 2.0),
  ('lucha', 'roca', 2.0),
  ('lucha', 'siniestro', 2.0),
  ('lucha', 'acero', 2.0),
  ('lucha', 'veneno', 0.5),
  ('lucha', 'volador', 0.5),
  ('lucha', 'psiquico', 0.5),
  ('lucha', 'bicho', 0.5),
  ('lucha', 'hada', 0.5),
  ('lucha', 'fantasma', 0.0),
  
  -- Veneno
  ('veneno', 'planta', 2.0),
  ('veneno', 'hada', 2.0),
  ('veneno', 'veneno', 0.5),
  ('veneno', 'tierra', 0.5),
  ('veneno', 'roca', 0.5),
  ('veneno', 'fantasma', 0.5),
  ('veneno', 'acero', 0.0),
  
  -- Tierra
  ('tierra', 'fuego', 2.0),
  ('tierra', 'electrico', 2.0),
  ('tierra', 'veneno', 2.0),
  ('tierra', 'roca', 2.0),
  ('tierra', 'acero', 2.0),
  ('tierra', 'planta', 0.5),
  ('tierra', 'bicho', 0.5),
  ('tierra', 'volador', 0.0),
  
  -- Volador
  ('volador', 'planta', 2.0),
  ('volador', 'lucha', 2.0),
  ('volador', 'bicho', 2.0),
  ('volador', 'electrico', 0.5),
  ('volador', 'roca', 0.5),
  ('volador', 'acero', 0.5),
  
  -- Psíquico
  ('psiquico', 'lucha', 2.0),
  ('psiquico', 'veneno', 2.0),
  ('psiquico', 'psiquico', 0.5),
  ('psiquico', 'acero', 0.5),
  ('psiquico', 'siniestro', 0.0),
  
  -- Bicho
  ('bicho', 'planta', 2.0),
  ('bicho', 'psiquico', 2.0),
  ('bicho', 'siniestro', 2.0),
  ('bicho', 'fuego', 0.5),
  ('bicho', 'lucha', 0.5),
  ('bicho', 'veneno', 0.5),
  ('bicho', 'volador', 0.5),
  ('bicho', 'fantasma', 0.5),
  ('bicho', 'acero', 0.5),
  ('bicho', 'hada', 0.5),
  
  -- Roca
  ('roca', 'fuego', 2.0),
  ('roca', 'hielo', 2.0),
  ('roca', 'volador', 2.0),
  ('roca', 'bicho', 2.0),
  ('roca', 'lucha', 0.5),
  ('roca', 'tierra', 0.5),
  ('roca', 'acero', 0.5),
  
  -- Fantasma
  ('fantasma', 'psiquico', 2.0),
  ('fantasma', 'fantasma', 2.0),
  ('fantasma', 'siniestro', 0.5),
  ('fantasma', 'normal', 0.0),
  
  -- Dragón
  ('dragon', 'dragon', 2.0),
  ('dragon', 'acero', 0.5),
  ('dragon', 'hada', 0.0),
  
  -- Siniestro
  ('siniestro', 'psiquico', 2.0),
  ('siniestro', 'fantasma', 2.0),
  ('siniestro', 'lucha', 0.5),
  ('siniestro', 'siniestro', 0.5),
  ('siniestro', 'hada', 0.5),
  
  -- Acero
  ('acero', 'hielo', 2.0),
  ('acero', 'roca', 2.0),
  ('acero', 'hada', 2.0),
  ('acero', 'fuego', 0.5),
  ('acero', 'agua', 0.5),
  ('acero', 'electrico', 0.5),
  ('acero', 'acero', 0.5),
  
  -- Hada
  ('hada', 'lucha', 2.0),
  ('hada', 'dragon', 2.0),
  ('hada', 'siniestro', 2.0),
  ('hada', 'fuego', 0.5),
  ('hada', 'veneno', 0.5),
  ('hada', 'acero', 0.5);

-- ========================================
-- INSERTS DE FRUTAS
-- ========================================

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

-- ========================================
-- INSERTS DE HÁBITATS
-- ========================================

INSERT INTO habitats (nombre, tipo, capacidad, descripcion, imagen, nivel_requerido) VALUES
  -- Nivel 1
  (
    'Agua',
    'agua',
    5,
    'Hábitat para Pokémon exclusivamente de tipo Agua.',
    'https://static.wikia.nocookie.net/dragoncity/images/8/88/Gran_H%C3%A1bitat_Mar.png/revision/latest?cb=20130705185814&path-prefix=es',
    1
  ),
  (
    'Planta',
    'planta',
    5,
    'Hábitat natural para Pokémon de tipo Planta y Bicho.',
    'https://static.wikia.nocookie.net/dragoncity/images/2/26/H%C3%A1bitat_Natura.png/revision/latest/scale-to-width-down/50?cb=20130705185919&path-prefix=es',
    1
  ),
  (
    'Fuego',
    'fuego',
    5,
    'Hábitat volcánico para Pokémon de tipo Fuego.',
    'https://static.wikia.nocookie.net/dragoncity/images/3/38/Gran_H%C3%A1bitat_Fuego.png/revision/latest/scale-to-width-down/50?cb=20130705185632&path-prefix=es',
    1
  ),

  -- Nivel 3
  (
    'Roca',
    'roca',
    5,
    'Zona montañosa para Pokémon de tipo Roca y Tierra.',
    'https://static.wikia.nocookie.net/dragoncity/images/2/26/H%C3%A1bitat_Tierra_Grande.png/revision/latest/scale-to-width-down/50?cb=20130705185432&path-prefix=es',
    3
  ),
  (
    'Hielo',
    'hielo',
    5,
    'Región helada para Pokémon de tipo Hielo.',
    'https://static.wikia.nocookie.net/dragoncity/images/8/8b/Gran_H%C3%A1bitat_Hielo.png/revision/latest/scale-to-width-down/50?cb=20130705191008&path-prefix=es',
    3
  ),
  (
    'Eléctrico',
    'electrico',
    5,
    'Zona energizada para Pokémon de tipo Eléctrico.',
    'https://static.wikia.nocookie.net/dragoncity/images/4/42/H%C3%A1bitat_El%C3%A9ctrico.png/revision/latest/scale-to-width-down/50?cb=20140426185402&path-prefix=es',
    3
  ),
  (
    'Volador',
    'volador',
    5,
    'Hábitat aéreo para Pokémon de tipo Volador.',
    'https://static.wikia.nocookie.net/dragoncity/images/c/c1/H%C3%A1bitat_Alma_2.png/revision/latest/scale-to-width-down/1000?cb=20150430192827&path-prefix=es',
    3
  ),

  -- Nivel 7
  (
    'Acero',
    'acero',
    5,
    'Hábitat resistente para Pokémon de tipo Acero.',
    'https://static.wikia.nocookie.net/dragoncity/images/6/6a/Gran_H%C3%A1bitat_Metal.png/revision/latest/scale-to-width-down/50?cb=20130705191125&path-prefix=es',
    7
  ),
  (
    'Lucha',
    'lucha',
    5,
    'Zona de entrenamiento para Pokémon de tipo Lucha.',
    'https://static.wikia.nocookie.net/dragoncity/images/8/84/H%C3%A1bitat_B%C3%A9lico.png/revision/latest/scale-to-width-down/50?cb=20130809220710&path-prefix=es',
    7
  ),

  -- Nivel 12
  (
    'Oscuridad',
    'siniestro',
    5,
    'Hábitat oscuro para Pokémon Veneno, Siniestro y Fantasma.',
    'https://static.wikia.nocookie.net/dragoncity/images/c/ca/H%C3%A1bitat_Oscuro.png/revision/latest/scale-to-width-down/50?cb=20130705191219&path-prefix=es',
    12
  ),
  (
    'Hada',
    'hada',
    5,
    'Hábitat mágico para Pokémon de tipo Hada y Psíquico.',
    'https://static.wikia.nocookie.net/dragoncity/images/b/b5/H%C3%A1bitat_Luz.png/revision/latest/scale-to-width-down/50?cb=20130809220627&path-prefix=es',
    12
  ),

  -- Nivel 15
  (
    'Dragón / Legendario',
    'dragon',
    5,
    'Hábitat ancestral reservado para Pokémon de tipo Dragón y Pokémon Legendarios.',
    'https://static.wikia.nocookie.net/dragoncity/images/8/8f/H%C3%A1bitat_Puro.png/revision/latest/scale-to-width-down/50?cb=20140225194729&path-prefix=es',
    15
  );

-- ========================================
-- INSERTS DE ZONAS DE CAPTURA
-- ========================================

INSERT INTO zonas_captura (nombre, descripcion, imagen, nivel_requerido) VALUES
  -- Nivel 1
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

  -- Nivel 3
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

  -- Nivel 7
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

  -- Nivel 12
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

-- ========================================
-- INSERTS DE ENTRENADORES
-- ========================================

INSERT INTO entrenadores (nombre, descripcion, nivel, edad, imagen) VALUES
  -- Combates iniciales
  (
    'Entrenador Inicial',
    'Primer combate del juego.  Apenas sabe lanzar una Poké Ball.',
    1,
    10,
    'https://images.wikidexcdn.net/mwuploads/wikidex/8/8b/latest/20131124130440/VS_Ni%C3%B1a_so%C3%B1adora.png'
  ),
  (
    'Entrenador Principiante',
    'Segundo combate del juego. Comienza a entender cómo entrenar Pokémon.',
    2,
    11,
    'https://images.wikidexcdn.net/mwuploads/wikidex/9/95/latest/20150914213602/VS_Preescolar_%28ni%C3%B1a%29.png'
  ),

  -- Entrenadores débiles
  (
    'Joven Entrenador',
    'Entrenador principiante con poca experiencia en combate.',
    3,
    10,
    'https://static.wikia.nocookie.net/espokemon/images/c/cc/VS_Joven. png/revision/latest? cb=20131101232251'
  ),
  (
    'Entrenadora Novata',
    'Está dando sus primeros pasos como entrenadora Pokémon.',
    5,
    11,
    'https://static.wikia.nocookie.net/espokemon/images/6/66/VS_Chica.png/revision/latest? cb=20150914125916'
  ),
  (
    'Criador Principiante',
    'Criador joven que recién comienza a entrenar Pokémon.',
    8,
    22,
    'https://static.wikia.nocookie.net/espokemon/images/4/40/VS_Entrenador_promesa.png/revision/latest?cb=20131106174920'
  ),
  (
    'Pescador Amateur',
    'Entrenador casual que utiliza Pokémon de tipo agua de bajo nivel.',
    10,
    30,
    'https://static.wikia.nocookie.net/espokemon/images/a/a9/VS_Pescador.png/revision/latest? cb=20131103023500'
  ),
  (
    'Excursionista Inexperto',
    'Explorador principiante de zonas montañosas.',
    13,
    27,
    'https://static.wikia.nocookie.net/espokemon/images/9/9c/VS_Monta%C3%B1ero.png/revision/latest?cb=20141016124617'
  ),
  (
    'Entrenador Escolar',
    'Estudiante que entrena Pokémon como actividad recreativa.',
    15,
    13,
    'https://static.wikia.nocookie.net/espokemon/images/4/46/VS_Pok%C3%A9fan_%28hombre%29.png/revision/latest?cb=20150914212621'
  ),

  -- Entrenadores clásicos
  (
    'Red',
    'Entrenador legendario de Kanto.',
    16,
    11,
    'https://images.wikidexcdn.net/mwuploads/wikidex/a/a0/latest/20210914072530/VS_Rojo_Masters.png'
  ),
  (
    'Leaf',
    'Entrenadora clásica de Kanto.',
    18,
    11,
    'https://images.wikidexcdn.net/mwuploads/wikidex/9/9f/latest/20200825060748/VS_Hoja_%28Traje_S%29_Masters.png'
  ),
  (
    'Blue',
    'Rival competitivo y estratega.',
    19,
    11,
    'https://images.wikidexcdn.net/mwuploads/wikidex/b/ba/latest/20200825060918/VS_Azul_%28Traje_S%29_Masters.png'
  ),
  (
    'Ethan',
    'Entrenador de Johto.',
    20,
    12,
    'https://images.wikidexcdn.net/mwuploads/wikidex/c/ce/latest/20220526112344/VS_Eco_%28Traje_S%29_Masters_EX.png'
  ),
  (
    'Lyra',
    'Entrenadora de Johto.',
    21,
    12,
    'https://images.wikidexcdn.net/mwuploads/wikidex/9/9b/latest/20220526171314/VS_Lira_Masters_EX.png'
  ),
  (
    'Brendan',
    'Entrenador de Hoenn.',
    22,
    12,
    'https://images.wikidexcdn.net/mwuploads/wikidex/6/60/latest/20201126084344/VS_Bruno_Masters_EX.png'
  ),
  (
    'May',
    'Entrenadora de Hoenn.',
    23,
    12,
    'https://images.wikidexcdn.net/mwuploads/wikidex/4/4f/latest/20120305164046/Aura.png'
  ),
  (
    'Lucas',
    'Entrenador de Sinnoh.',
    24,
    12,
    'https://images.wikidexcdn.net/mwuploads/wikidex/3/39/latest/20211221092337/VS_Le%C3%B3n_Masters.png'
  ),

  -- Líderes de gimnasio
  (
    'Brock',
    'Líder de gimnasio tipo roca.',
    30,
    15,
    'https://images.wikidexcdn.net/mwuploads/wikidex/9/99/latest/20230902182628/Cara_de_Brock_LGPE.png'
  ),
  (
    'Misty',
    'Líder de gimnasio tipo agua.',
    30,
    16,
    'https://images.wikidexcdn.net/mwuploads/wikidex/3/32/latest/20210826070528/VS_Misty_%28Kanto%29_Masters.png'
  ),
  (
    'Lt. Surge',
    'Líder de gimnasio tipo eléctrico.',
    30,
    34,
    'https://images.wikidexcdn.net/mwuploads/wikidex/d/db/latest/20190812173135/VS_Teniente_Surge_Masters.png'
  ),
  (
    'Erika',
    'Líder de gimnasio tipo planta.',
    30,
    18,
    'https://images.wikidexcdn.net/mwuploads/wikidex/d/dd/latest/20201126083954/VS_Erika_%28Temporada_20%29_Masters.png'
  ),
  (
    'Sabrina',
    'Líder de gimnasio tipo psíquico.',
    30,
    21,
    'https://images.wikidexcdn.net/mwuploads/wikidex/6/65/latest/20210728081625/VS_Sabrina_Masters_EX.png'
  );