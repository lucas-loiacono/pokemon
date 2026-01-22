-- ========================================
-- INSERTS DE ENTRENADOR_POKEMONS
-- EJECUTAR DESPUÉS DE seedPokemons.js, ya que necesita que existan los pokémons
-- ========================================

INSERT INTO entrenador_pokemons (entrenador_id, pokemon_id, nivel) VALUES
-- Combates iniciales
((SELECT id FROM entrenadores WHERE nombre='Entrenador Inicial'), (SELECT id FROM pokemons WHERE pokedex_id=10), 1),

((SELECT id FROM entrenadores WHERE nombre='Entrenador Principiante'), (SELECT id FROM pokemons WHERE pokedex_id=13), 1),
((SELECT id FROM entrenadores WHERE nombre='Entrenador Principiante'), (SELECT id FROM pokemons WHERE pokedex_id=41), 1),

-- Entrenadores débiles
((SELECT id FROM entrenadores WHERE nombre='Joven Entrenador'), (SELECT id FROM pokemons WHERE pokedex_id=16), 2),
((SELECT id FROM entrenadores WHERE nombre='Joven Entrenador'), (SELECT id FROM pokemons WHERE pokedex_id=19), 3),

((SELECT id FROM entrenadores WHERE nombre='Entrenadora Novata'), (SELECT id FROM pokemons WHERE pokedex_id=133), 4),
((SELECT id FROM entrenadores WHERE nombre='Entrenadora Novata'), (SELECT id FROM pokemons WHERE pokedex_id=25), 5),

((SELECT id FROM entrenadores WHERE nombre='Criador Principiante'), (SELECT id FROM pokemons WHERE pokedex_id=52), 7),
((SELECT id FROM entrenadores WHERE nombre='Criador Principiante'), (SELECT id FROM pokemons WHERE pokedex_id=113), 8),

((SELECT id FROM entrenadores WHERE nombre='Pescador Amateur'), (SELECT id FROM pokemons WHERE pokedex_id=129), 9),
((SELECT id FROM entrenadores WHERE nombre='Pescador Amateur'), (SELECT id FROM pokemons WHERE pokedex_id=60), 10),

((SELECT id FROM entrenadores WHERE nombre='Excursionista Inexperto'), (SELECT id FROM pokemons WHERE pokedex_id=74), 12),
((SELECT id FROM entrenadores WHERE nombre='Excursionista Inexperto'), (SELECT id FROM pokemons WHERE pokedex_id=66), 13),

((SELECT id FROM entrenadores WHERE nombre='Entrenador Escolar'), (SELECT id FROM pokemons WHERE pokedex_id=92), 14),
((SELECT id FROM entrenadores WHERE nombre='Entrenador Escolar'), (SELECT id FROM pokemons WHERE pokedex_id=104), 15),

-- Entrenadores clásicos
((SELECT id FROM entrenadores WHERE nombre='Red'), (SELECT id FROM pokemons WHERE pokedex_id=25), 15),
((SELECT id FROM entrenadores WHERE nombre='Red'), (SELECT id FROM pokemons WHERE pokedex_id=6), 16),
((SELECT id FROM entrenadores WHERE nombre='Red'), (SELECT id FROM pokemons WHERE pokedex_id=3), 17),

((SELECT id FROM entrenadores WHERE nombre='Leaf'), (SELECT id FROM pokemons WHERE pokedex_id=3), 17),
((SELECT id FROM entrenadores WHERE nombre='Leaf'), (SELECT id FROM pokemons WHERE pokedex_id=131), 18),
((SELECT id FROM entrenadores WHERE nombre='Leaf'), (SELECT id FROM pokemons WHERE pokedex_id=65), 19),

((SELECT id FROM entrenadores WHERE nombre='Blue'), (SELECT id FROM pokemons WHERE pokedex_id=18), 18),
((SELECT id FROM entrenadores WHERE nombre='Blue'), (SELECT id FROM pokemons WHERE pokedex_id=59), 19),
((SELECT id FROM entrenadores WHERE nombre='Blue'), (SELECT id FROM pokemons WHERE pokedex_id=103), 20),

((SELECT id FROM entrenadores WHERE nombre='Ethan'), (SELECT id FROM pokemons WHERE pokedex_id=157), 19),
((SELECT id FROM entrenadores WHERE nombre='Ethan'), (SELECT id FROM pokemons WHERE pokedex_id=160), 20),
((SELECT id FROM entrenadores WHERE nombre='Ethan'), (SELECT id FROM pokemons WHERE pokedex_id=149), 21),

((SELECT id FROM entrenadores WHERE nombre='Lyra'), (SELECT id FROM pokemons WHERE pokedex_id=154), 20),
((SELECT id FROM entrenadores WHERE nombre='Lyra'), (SELECT id FROM pokemons WHERE pokedex_id=196), 21),
((SELECT id FROM entrenadores WHERE nombre='Lyra'), (SELECT id FROM pokemons WHERE pokedex_id=189), 22),

((SELECT id FROM entrenadores WHERE nombre='Brendan'), (SELECT id FROM pokemons WHERE pokedex_id=254), 21),
((SELECT id FROM entrenadores WHERE nombre='Brendan'), (SELECT id FROM pokemons WHERE pokedex_id=257), 22),
((SELECT id FROM entrenadores WHERE nombre='Brendan'), (SELECT id FROM pokemons WHERE pokedex_id=260), 23),

((SELECT id FROM entrenadores WHERE nombre='May'), (SELECT id FROM pokemons WHERE pokedex_id=256), 22),
((SELECT id FROM entrenadores WHERE nombre='May'), (SELECT id FROM pokemons WHERE pokedex_id=258), 23),
((SELECT id FROM entrenadores WHERE nombre='May'), (SELECT id FROM pokemons WHERE pokedex_id=280), 24),

((SELECT id FROM entrenadores WHERE nombre='Lucas'), (SELECT id FROM pokemons WHERE pokedex_id=392), 23),
((SELECT id FROM entrenadores WHERE nombre='Lucas'), (SELECT id FROM pokemons WHERE pokedex_id=395), 24),
((SELECT id FROM entrenadores WHERE nombre='Lucas'), (SELECT id FROM pokemons WHERE pokedex_id=445), 25),

-- Líderes de gimnasio
((SELECT id FROM entrenadores WHERE nombre='Brock'), (SELECT id FROM pokemons WHERE pokedex_id=74), 30),
((SELECT id FROM entrenadores WHERE nombre='Brock'), (SELECT id FROM pokemons WHERE pokedex_id=95), 30),
((SELECT id FROM entrenadores WHERE nombre='Brock'), (SELECT id FROM pokemons WHERE pokedex_id=111), 30),
((SELECT id FROM entrenadores WHERE nombre='Brock'), (SELECT id FROM pokemons WHERE pokedex_id=141), 30),
((SELECT id FROM entrenadores WHERE nombre='Brock'), (SELECT id FROM pokemons WHERE pokedex_id=112), 30),

((SELECT id FROM entrenadores WHERE nombre='Misty'), (SELECT id FROM pokemons WHERE pokedex_id=120), 30),
((SELECT id FROM entrenadores WHERE nombre='Misty'), (SELECT id FROM pokemons WHERE pokedex_id=121), 30),
((SELECT id FROM entrenadores WHERE nombre='Misty'), (SELECT id FROM pokemons WHERE pokedex_id=134), 30),
((SELECT id FROM entrenadores WHERE nombre='Misty'), (SELECT id FROM pokemons WHERE pokedex_id=130), 30),
((SELECT id FROM entrenadores WHERE nombre='Misty'), (SELECT id FROM pokemons WHERE pokedex_id=131), 30),

((SELECT id FROM entrenadores WHERE nombre='Lt. Surge'), (SELECT id FROM pokemons WHERE pokedex_id=100), 30),
((SELECT id FROM entrenadores WHERE nombre='Lt. Surge'), (SELECT id FROM pokemons WHERE pokedex_id=26), 30),
((SELECT id FROM entrenadores WHERE nombre='Lt. Surge'), (SELECT id FROM pokemons WHERE pokedex_id=82), 30),
((SELECT id FROM entrenadores WHERE nombre='Lt. Surge'), (SELECT id FROM pokemons WHERE pokedex_id=125), 30),
((SELECT id FROM entrenadores WHERE nombre='Lt. Surge'), (SELECT id FROM pokemons WHERE pokedex_id=135), 30),

((SELECT id FROM entrenadores WHERE nombre='Erika'), (SELECT id FROM pokemons WHERE pokedex_id=114), 30),
((SELECT id FROM entrenadores WHERE nombre='Erika'), (SELECT id FROM pokemons WHERE pokedex_id=71), 30),
((SELECT id FROM entrenadores WHERE nombre='Erika'), (SELECT id FROM pokemons WHERE pokedex_id=45), 30),
((SELECT id FROM entrenadores WHERE nombre='Erika'), (SELECT id FROM pokemons WHERE pokedex_id=182), 30),
((SELECT id FROM entrenadores WHERE nombre='Erika'), (SELECT id FROM pokemons WHERE pokedex_id=70), 30),

((SELECT id FROM entrenadores WHERE nombre='Sabrina'), (SELECT id FROM pokemons WHERE pokedex_id=64), 30),
((SELECT id FROM entrenadores WHERE nombre='Sabrina'), (SELECT id FROM pokemons WHERE pokedex_id=122), 30),
((SELECT id FROM entrenadores WHERE nombre='Sabrina'), (SELECT id FROM pokemons WHERE pokedex_id=65), 30),
((SELECT id FROM entrenadores WHERE nombre='Sabrina'), (SELECT id FROM pokemons WHERE pokedex_id=97), 30),
((SELECT id FROM entrenadores WHERE nombre='Sabrina'), (SELECT id FROM pokemons WHERE pokedex_id=202), 30);