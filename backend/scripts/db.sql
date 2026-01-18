// CATÁLOGO DE POKÉMON
CREATE TABLE pokemons (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL,
  descripcion TEXT,
  foto VARCHAR(255),
  imagen VARCHAR(255)
);

// TIPOS
CREATE TABLE tipos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE pokemon_tipos (
  pokemon_id INT NOT NULL REFERENCES pokemons(id) ON DELETE CASCADE,
  tipo_id INT NOT NULL REFERENCES tipos(id),
  PRIMARY KEY (pokemon_id, tipo_id)
);

// HÁBITATS (CATÁLOGO)
CREATE TABLE habitats (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL,
  tipo VARCHAR(20),
  nivel INT DEFAULT 1 CHECK (nivel >= 1),
  descripcion TEXT,
  capacidad INT NOT NULL CHECK (capacidad >= 0),
  imagen VARCHAR(255)
);

CREATE TABLE habitat_pokemons (
  habitat_id INT NOT NULL REFERENCES habitats(id) ON DELETE CASCADE,
  pokemon_id INT NOT NULL REFERENCES pokemons(id) ON DELETE CASCADE,
  PRIMARY KEY (habitat_id, pokemon_id)
);

// ENTRENADORES (NPC)
CREATE TABLE entrenadores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL,
  descripcion TEXT,
  edad INT CHECK (edad >= 0),
  imagen VARCHAR(255)
);

CREATE TABLE entrenador_pokemons (
  entrenador_id INT NOT NULL REFERENCES entrenadores(id) ON DELETE CASCADE,
  pokemon_id INT NOT NULL REFERENCES pokemons(id),
  nivel INT NOT NULL DEFAULT 1 CHECK (nivel >= 1),
  PRIMARY KEY (entrenador_id, pokemon_id)
);

// JUGADORES (CON NIVEL Y XP)
CREATE TABLE jugadores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL,

  nivel INT NOT NULL DEFAULT 1 CHECK (nivel >= 1),
  xp INT NOT NULL DEFAULT 0 CHECK (xp >= 0),

  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

// INVENTARIO DE POKÉMON DEL JUGADOR
CREATE TABLE jugador_pokemons (
  id SERIAL PRIMARY KEY,
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  pokemon_id INT NOT NULL REFERENCES pokemons(id),

  nivel INT NOT NULL DEFAULT 1 CHECK (nivel >= 1),
  xp INT NOT NULL DEFAULT 0 CHECK (xp >= 0),
  vida INT NOT NULL DEFAULT 100 CHECK (vida >= 0),

  combates_ganados INT NOT NULL DEFAULT 0 CHECK (combates_ganados >= 0),
  etapa_evolucion INT NOT NULL DEFAULT 1 CHECK (etapa_evolucion BETWEEN 1 AND 3),

  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);


// FRUTAS (DISTINTOS TIPOS DE COMIDA)
CREATE TABLE frutas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL,
  xp_otorgada INT NOT NULL CHECK (xp_otorgada > 0),
  curacion INT NOT NULL DEFAULT 0 CHECK (curacion >= 0),
  imagen VARCHAR(255)
);

// INVENTARIO DE FRUTAS DEL JUGADOR

CREATE TABLE jugador_frutas (
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  fruta_id INT NOT NULL REFERENCES frutas(id),
  cantidad INT NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  PRIMARY KEY (jugador_id, fruta_id)
);



// HÁBITATS DEL JUGADOR (SLOTS)
CREATE TABLE jugador_habitats (
  id SERIAL PRIMARY KEY,
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  habitat_id INT NOT NULL REFERENCES habitats(id),
  nombre VARCHAR(30),
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

// POKÉMON DENTRO DE CADA HÁBITAT DEL JUGADOR
CREATE TABLE jugador_habitat_pokemons (
  jugador_habitat_id INT NOT NULL REFERENCES jugador_habitats(id) ON DELETE CASCADE,
  jugador_pokemon_id INT NOT NULL REFERENCES jugador_pokemons(id) ON DELETE CASCADE,
  PRIMARY KEY (jugador_habitat_id, jugador_pokemon_id)
);

// ZONAS DE CAPTURA
CREATE TABLE zonas_captura (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL,
  descripcion TEXT,
  imagen VARCHAR(255)
);

// POKÉMON RANDOM POR ZONA
CREATE TABLE zona_pokemons (
  zona_id INT NOT NULL REFERENCES zonas_captura(id) ON DELETE CASCADE,
  pokemon_id INT NOT NULL REFERENCES pokemons(id) ON DELETE CASCADE,
  peso INT NOT NULL DEFAULT 1 CHECK (peso > 0),
  PRIMARY KEY (zona_id, pokemon_id)
);

// GRANJAS DEL JUGADOR (RECOLECTAR FRUTAS)
CREATE TABLE granjas (
  id SERIAL PRIMARY KEY,
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  nivel INT NOT NULL DEFAULT 1 CHECK (nivel >= 1),
  ultimo_cobro TIMESTAMP NOT NULL DEFAULT NOW()
);

// EVOLUCIONES (POR NIVEL)
CREATE TABLE evoluciones (
  id SERIAL PRIMARY KEY,
  pokemon_id INT NOT NULL REFERENCES pokemons(id) ON DELETE CASCADE,
  etapa_actual INT NOT NULL CHECK (etapa_actual BETWEEN 1 AND 3),
  etapa_siguiente INT NOT NULL CHECK (etapa_siguiente BETWEEN 2 AND 3),
  nivel_requerido INT NOT NULL CHECK (nivel_requerido > 0),
  UNIQUE (pokemon_id, etapa_actual)
);

// DESBLOQUEO DE SLOTS POR NIVEL DEL JUGADOR
CREATE TABLE desbloqueos (
  nivel INT PRIMARY KEY,
  habitats_slots INT NOT NULL DEFAULT 1 CHECK (habitats_slots >= 0),
  granjas_slots INT NOT NULL DEFAULT 1 CHECK (granjas_slots >= 0)
);