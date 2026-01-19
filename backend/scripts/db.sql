🟢 JUGADORES
CREATE TABLE jugadores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL,

  nivel INT NOT NULL DEFAULT 1 CHECK (nivel >= 1),
  xp INT NOT NULL DEFAULT 0 CHECK (xp >= 0),

  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

🟢 INVENTARIO DE POKÉMON DEL JUGADOR
CREATE TABLE jugador_pokemons (
  id SERIAL PRIMARY KEY,
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,

  pokemon_api_id INT NOT NULL CHECK (pokemon_api_id >= 1),

  nivel INT NOT NULL DEFAULT 1 CHECK (nivel >= 1),
  xp INT NOT NULL DEFAULT 0 CHECK (xp >= 0),

  combates_ganados INT NOT NULL DEFAULT 0 CHECK (combates_ganados >= 0),
  etapa_evolucion INT NOT NULL DEFAULT 1 CHECK (etapa_evolucion BETWEEN 1 AND 3),

  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);


🟢 FRUTAS (TIPOS DE COMIDA)

CREATE TABLE frutas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL,

  xp_otorgada INT NOT NULL CHECK (xp_otorgada > 0),
  tiempo_produccion INT NOT NULL CHECK (tiempo_produccion > 0), -- minutos

  imagen VARCHAR(255)
);


🟢 INVENTARIO DE FRUTAS DEL JUGADOR

Permite tener muchos tipos de frutas a la vez.

CREATE TABLE jugador_frutas (
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  fruta_id INT NOT NULL REFERENCES frutas(id),
  cantidad INT NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  PRIMARY KEY (jugador_id, fruta_id)
);

🟢 HÁBITATS (CATÁLOGO)
CREATE TABLE habitats (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL,
  tipo VARCHAR(20),

  capacidad INT NOT NULL CHECK (capacidad >= 0),
  descripcion TEXT,
  imagen VARCHAR(255),

  nivel_requerido INT NOT NULL DEFAULT 1 CHECK (nivel_requerido >= 1)
);


🟢 HÁBITATS DEL JUGADOR (SLOTS)
CREATE TABLE jugador_habitats (
  id SERIAL PRIMARY KEY,
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  habitat_id INT NOT NULL REFERENCES habitats(id),
  nombre VARCHAR(30),
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

🟢 POKÉMON DENTRO DE CADA HÁBITAT DEL JUGADOR
CREATE TABLE jugador_habitat_pokemons (
  jugador_habitat_id INT NOT NULL REFERENCES jugador_habitats(id) ON DELETE CASCADE,
  jugador_pokemon_id INT NOT NULL REFERENCES jugador_pokemons(id) ON DELETE CASCADE,
  PRIMARY KEY (jugador_habitat_id, jugador_pokemon_id)
);

🟢 GRANJAS DEL JUGADOR (PLANTÁS FRUTAS)

Cada granja produce una fruta elegida por el jugador.

CREATE TABLE granjas (
  id SERIAL PRIMARY KEY,
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,

  nivel INT NOT NULL DEFAULT 1 CHECK (nivel >= 1),

  fruta_id INT REFERENCES frutas(id),     -- fruta plantada (NULL = vacía)
  inicio_produccion TIMESTAMP,             -- cuándo se plantó

  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

🟢 ZONAS DE CAPTURA
CREATE TABLE zonas_captura (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL,
  descripcion TEXT,
  imagen VARCHAR(255),

  nivel_requerido INT NOT NULL DEFAULT 1 CHECK (nivel_requerido >= 1)
);


🟢 ENTRENADORES (NPC)
CREATE TABLE entrenadores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL,
  descripcion TEXT,
  edad INT CHECK (edad >= 0),
  imagen VARCHAR(255)
);

🟢 EQUIPO DE ENTRENADORES
CREATE TABLE entrenador_pokemons (
  entrenador_id INT NOT NULL REFERENCES entrenadores(id) ON DELETE CASCADE,
  pokemon_api_id INT NOT NULL CHECK (pokemon_api_id >= 1),
  nivel INT NOT NULL DEFAULT 1 CHECK (nivel >= 1),
  PRIMARY KEY (entrenador_id, pokemon_api_id)
);

🟢 EVOLUCIONES (POR NIVEL)
CREATE TABLE evoluciones (
  id SERIAL PRIMARY KEY,
  pokemon_api_id INT NOT NULL CHECK (pokemon_api_id >= 1),
  etapa_actual INT NOT NULL CHECK (etapa_actual BETWEEN 1 AND 3),
  etapa_siguiente INT NOT NULL CHECK (etapa_siguiente BETWEEN 2 AND 3),
  nivel_requerido INT NOT NULL CHECK (nivel_requerido > 0),
  pokemon_api_id_siguiente INT NOT NULL CHECK (pokemon_api_id_siguiente >= 1),
  UNIQUE (pokemon_api_id, etapa_actual)
);


🟢 DESBLOQUEO DE SLOTS POR NIVEL DE JUGADOR
CREATE TABLE desbloqueos (
  nivel INT PRIMARY KEY,
  habitats_slots INT NOT NULL DEFAULT 1 CHECK (habitats_slots >= 0),
  granjas_slots INT NOT NULL DEFAULT 1 CHECK (granjas_slots >= 0)
);