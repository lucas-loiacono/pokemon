-- ==================== ENTRENADORES (REQUIERE POKÉMON CARGADOS) ====================

INSERT INTO entrenadores (id, nombre, nivel, descripcion, imagen_url) VALUES
(1, 'Plata', 1, 'Entrenador novato con Pokémon iniciales de Johto', 'https://images.wikidexcdn.net/mwuploads/wikidex/8/8c/latest/20141118021036/Plata_en_HGSS.png'),
(2, 'Matís', 2, 'Entrenador de nivel intermedio con evoluciones intermedias', 'https://images.wikidexcdn.net/mwuploads/wikidex/3/32/latest/20220526053319/Mat%C3%ADs.png'),
(3, 'Blasco (Wally)', 3, 'Entrenador experimentado con evoluciones finales de Hoenn', 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/b/b1/latest/20220326181141/Blasco_ROZA.png/250px-Blasco_ROZA.png'),
(4, 'Zarala', 4, 'Especialista en tipos Fantasma y Siniestro', 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/3/3f/latest/20181003024510/Zarala.png/250px-Zarala.png'),
(5, 'Ghetsis', 5, 'Líder de Team Plasma con Pokémon siniestros', 'https://images.wikidexcdn.net/mwuploads/wikidex/4/43/latest/20120714034132/Ilustraci%C3%B3n_de_Ghechis_N2B2.png'),
(6, 'Profesor Kukui', 6, 'Profesor de Alola con equipo balanceado', 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/5/51/latest/20160602131830/Profesor_Kukui.png/230px-Profesor_Kukui.png'),
(7, 'Azul', 7, 'Campeón de Kanto con equipo poderoso', 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/2/24/latest/20151230152256/Azul_en_HGSS.png/180px-Azul_en_HGSS.png'),
(8, 'Lionel', 8, 'Campeón de Galar con Pokémon legendarios', 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/b/be/latest/20220314191026/Lionel.png/250px-Lionel.png'),
(9, 'Rojo', 9, 'Campeón legendario con equipo icónico', 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/7/72/latest/20230912031012/Rojo_RFVH_%28Ilustraci%C3%B3n%29.png/151px-Rojo_RFVH_%28Ilustraci%C3%B3n%29.png'),
(10, 'Cintia', 10, 'Campeona de Sinnoh, la más poderosa', 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/f/f2/latest/20220426191412/Cintia.png/152px-Cintia.png')
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nivel = EXCLUDED.nivel,
  descripcion = EXCLUDED.descripcion,
  imagen_url = EXCLUDED.imagen_url;

SELECT setval('entrenadores_id_seq', 10, true);

-- ==================== EQUIPOS DE ENTRENADORES ====================

-- Entrenador 1: Plata (Silver) - TODOS NIVEL 1
INSERT INTO entrenador_pokemons (entrenador_id, pokemon_id, nivel, posicion) VALUES
(1, (SELECT id FROM pokemons WHERE pokedex_id = 152), 1, 1),  -- Chikorita
(1, (SELECT id FROM pokemons WHERE pokedex_id = 155), 1, 2),  -- Totodile
(1, (SELECT id FROM pokemons WHERE pokedex_id = 158), 1, 3),  -- Cyndaquil
(1, (SELECT id FROM pokemons WHERE pokedex_id = 179), 1, 4),  -- Mareep
(1, (SELECT id FROM pokemons WHERE pokedex_id = 123), 1, 5)   -- Scyther
ON CONFLICT (entrenador_id, posicion) DO UPDATE SET
  pokemon_id = EXCLUDED.pokemon_id,
  nivel = EXCLUDED.nivel;

-- Entrenador 2: Matís (Hugh) - Nivel 2-3
INSERT INTO entrenador_pokemons (entrenador_id, pokemon_id, nivel, posicion) VALUES
(2, (SELECT id FROM pokemons WHERE pokedex_id = 499), 2, 1),  -- Pignite
(2, (SELECT id FROM pokemons WHERE pokedex_id = 496), 2, 2),  -- Servine
(2, (SELECT id FROM pokemons WHERE pokedex_id = 502), 3, 3),  -- Dewott
(2, (SELECT id FROM pokemons WHERE pokedex_id = 329), 2, 4),  -- Vibrava
(2, (SELECT id FROM pokemons WHERE pokedex_id = 603), 3, 5)   -- Eelektrik
ON CONFLICT (entrenador_id, posicion) DO UPDATE SET
  pokemon_id = EXCLUDED.pokemon_id,
  nivel = EXCLUDED.nivel;

-- Entrenador 3: Blasco (Wally) - Nivel 5-7
INSERT INTO entrenador_pokemons (entrenador_id, pokemon_id, nivel, posicion) VALUES
(3, (SELECT id FROM pokemons WHERE pokedex_id = 254), 5, 1),  -- Sceptile
(3, (SELECT id FROM pokemons WHERE pokedex_id = 260), 6, 2),  -- Swampert
(3, (SELECT id FROM pokemons WHERE pokedex_id = 257), 7, 3),  -- Blaziken
(3, (SELECT id FROM pokemons WHERE pokedex_id = 462), 5, 4),  -- Magnezone
(3, (SELECT id FROM pokemons WHERE pokedex_id = 475), 6, 5)   -- Gallade
ON CONFLICT (entrenador_id, posicion) DO UPDATE SET
  pokemon_id = EXCLUDED.pokemon_id,
  nivel = EXCLUDED.nivel;

-- Entrenador 4: Zarala (Acerola) - Nivel 9-11
INSERT INTO entrenador_pokemons (entrenador_id, pokemon_id, nivel, posicion) VALUES
(4, (SELECT id FROM pokemons WHERE pokedex_id = 302), 9, 1),    -- Sableye
(4, (SELECT id FROM pokemons WHERE pokedex_id = 1000), 11, 2),  -- Gholdengo
(4, (SELECT id FROM pokemons WHERE pokedex_id = 770), 10, 3),   -- Palossand
(4, (SELECT id FROM pokemons WHERE pokedex_id = 781), 9, 4),    -- Dhelmise
(4, (SELECT id FROM pokemons WHERE pokedex_id = 778), 10, 5)    -- Mimikyu
ON CONFLICT (entrenador_id, posicion) DO UPDATE SET
  pokemon_id = EXCLUDED.pokemon_id,
  nivel = EXCLUDED.nivel;

-- Entrenador 5: Ghetsis - Nivel 13-15
INSERT INTO entrenador_pokemons (entrenador_id, pokemon_id, nivel, posicion) VALUES
(5, (SELECT id FROM pokemons WHERE pokedex_id = 563), 13, 1),  -- Cofagrigus
(5, (SELECT id FROM pokemons WHERE pokedex_id = 454), 14, 2),  -- Toxicroak
(5, (SELECT id FROM pokemons WHERE pokedex_id = 452), 13, 3),  -- Drapion
(5, (SELECT id FROM pokemons WHERE pokedex_id = 537), 15, 4),  -- Seismitoad
(5, (SELECT id FROM pokemons WHERE pokedex_id = 635), 15, 5)   -- Hydreigon
ON CONFLICT (entrenador_id, posicion) DO UPDATE SET
  pokemon_id = EXCLUDED.pokemon_id,
  nivel = EXCLUDED.nivel;

-- Entrenador 6: Profesor Kukui - Nivel 17-19
INSERT INTO entrenador_pokemons (entrenador_id, pokemon_id, nivel, posicion) VALUES
(6, (SELECT id FROM pokemons WHERE pokedex_id = 628), 17, 1),  -- Braviary
(6, (SELECT id FROM pokemons WHERE pokedex_id = 395), 18, 2),  -- Empoleon
(6, (SELECT id FROM pokemons WHERE pokedex_id = 727), 19, 3),  -- Incineroar
(6, (SELECT id FROM pokemons WHERE pokedex_id = 3), 17, 4),    -- Venusaur
(6, (SELECT id FROM pokemons WHERE pokedex_id = 448), 18, 5)   -- Lucario
ON CONFLICT (entrenador_id, posicion) DO UPDATE SET
  pokemon_id = EXCLUDED.pokemon_id,
  nivel = EXCLUDED.nivel;

-- Entrenador 7: Azul (Blue) - Nivel 21-23
INSERT INTO entrenador_pokemons (entrenador_id, pokemon_id, nivel, posicion) VALUES
(7, (SELECT id FROM pokemons WHERE pokedex_id = 59), 21, 1),   -- Arcanine
(7, (SELECT id FROM pokemons WHERE pokedex_id = 103), 22, 2),  -- Exeggutor
(7, (SELECT id FROM pokemons WHERE pokedex_id = 130), 23, 3),  -- Gyarados
(7, (SELECT id FROM pokemons WHERE pokedex_id = 214), 21, 4),  -- Heracross
(7, (SELECT id FROM pokemons WHERE pokedex_id = 248), 22, 5)   -- Tyranitar
ON CONFLICT (entrenador_id, posicion) DO UPDATE SET
  pokemon_id = EXCLUDED.pokemon_id,
  nivel = EXCLUDED.nivel;

-- Entrenador 8: Lionel (Leon) - Nivel 25-27
INSERT INTO entrenador_pokemons (entrenador_id, pokemon_id, nivel, posicion) VALUES
(8, (SELECT id FROM pokemons WHERE pokedex_id = 681), 25, 1),  -- Aegislash
(8, (SELECT id FROM pokemons WHERE pokedex_id = 464), 26, 2),  -- Rhyperior
(8, (SELECT id FROM pokemons WHERE pokedex_id = 887), 27, 3),  -- Dragapult
(8, (SELECT id FROM pokemons WHERE pokedex_id = 6), 25, 4),    -- Charizard
(8, (SELECT id FROM pokemons WHERE pokedex_id = 890), 26, 5)   -- Eternatus
ON CONFLICT (entrenador_id, posicion) DO UPDATE SET
  pokemon_id = EXCLUDED.pokemon_id,
  nivel = EXCLUDED.nivel;

-- Entrenador 9: Rojo (Red) - Nivel 28-29
INSERT INTO entrenador_pokemons (entrenador_id, pokemon_id, nivel, posicion) VALUES
(9, (SELECT id FROM pokemons WHERE pokedex_id = 25), 28, 1),   -- Pikachu
(9, (SELECT id FROM pokemons WHERE pokedex_id = 131), 28, 2),  -- Lapras
(9, (SELECT id FROM pokemons WHERE pokedex_id = 94), 29, 3),   -- Gengar
(9, (SELECT id FROM pokemons WHERE pokedex_id = 250), 28, 4),  -- Ho-oh
(9, (SELECT id FROM pokemons WHERE pokedex_id = 150), 29, 5)   -- Mewtwo
ON CONFLICT (entrenador_id, posicion) DO UPDATE SET
  pokemon_id = EXCLUDED.pokemon_id,
  nivel = EXCLUDED.nivel;

-- Entrenador 10: Cintia (Cynthia) - TODOS NIVEL 30
INSERT INTO entrenador_pokemons (entrenador_id, pokemon_id, nivel, posicion) VALUES
(10, (SELECT id FROM pokemons WHERE pokedex_id = 445), 30, 1),  -- Garchomp
(10, (SELECT id FROM pokemons WHERE pokedex_id = 485), 30, 2),  -- Heatran
(10, (SELECT id FROM pokemons WHERE pokedex_id = 491), 30, 3),  -- Darkrai
(10, (SELECT id FROM pokemons WHERE pokedex_id = 487), 30, 4),  -- Giratina
(10, (SELECT id FROM pokemons WHERE pokedex_id = 493), 30, 5)   -- Arceus
ON CONFLICT (entrenador_id, posicion) DO UPDATE SET
  pokemon_id = EXCLUDED.pokemon_id,
  nivel = EXCLUDED.nivel;