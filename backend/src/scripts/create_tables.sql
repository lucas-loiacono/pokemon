-- ========================================
-- JUGADORES
-- ========================================

CREATE TABLE jugadores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL,

  nivel INT NOT NULL DEFAULT 1 CHECK (nivel >= 1),
  xp INT NOT NULL DEFAULT 0 CHECK (xp >= 0),

  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- POKÉMON Y TIPOS
-- ========================================

-- Tabla de Pokémon (catálogo de todos los Pokémon del juego)
CREATE TABLE pokemons (
  id SERIAL PRIMARY KEY,
  pokedex_id INT NOT NULL UNIQUE,         -- ID de la PokéAPI (1-1025)
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,                       -- Descripción del Pokémon
  imagen_url TEXT
);

-- Tabla de tipos disponibles
CREATE TABLE tipos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE      -- fuego, agua, planta, etc.
);

-- Tabla de relación:  Pokémon puede tener 1 o 2 tipos
CREATE TABLE pokemon_tipos (
  pokemon_id INT NOT NULL REFERENCES pokemons(id) ON DELETE CASCADE,
  tipo_id INT NOT NULL REFERENCES tipos(id) ON DELETE CASCADE,
  orden INT NOT NULL CHECK (orden IN (1, 2)), -- 1 = primario, 2 = secundario
  PRIMARY KEY (pokemon_id, tipo_id),
  UNIQUE (pokemon_id, orden)               -- Un Pokémon no puede tener dos tipos en el mismo orden
);

-- Índices para búsquedas de tipos
CREATE INDEX idx_pokemon_tipos_pokemon ON pokemon_tipos(pokemon_id);
CREATE INDEX idx_pokemon_tipos_tipo ON pokemon_tipos(tipo_id);

-- Tabla de efectividad entre tipos (ventajas/desventajas)
CREATE TABLE tipo_efectividad (
  id SERIAL PRIMARY KEY,
  tipo_atacante VARCHAR(50) NOT NULL,
  tipo_defensor VARCHAR(50) NOT NULL,
  multiplicador DECIMAL(3,2) NOT NULL,    -- 0.5 = débil, 1.0 = normal, 2.0 = super efectivo
  UNIQUE(tipo_atacante, tipo_defensor)
);

-- ========================================
-- INVENTARIO DE POKÉMON DEL JUGADOR
-- ========================================

CREATE TABLE jugador_pokemons (
  id SERIAL PRIMARY KEY,
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,

  pokemon_id INT NOT NULL REFERENCES pokemons(id) ON DELETE RESTRICT,

  nivel INT NOT NULL DEFAULT 1 CHECK (nivel >= 1),
  xp INT NOT NULL DEFAULT 0 CHECK (xp >= 0),

  combates_ganados INT NOT NULL DEFAULT 0 CHECK (combates_ganados >= 0),
  etapa_evolucion INT NOT NULL DEFAULT 1 CHECK (etapa_evolucion BETWEEN 1 AND 3),

  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para mejorar rendimiento
CREATE INDEX idx_jugador_pokemons_jugador_id ON jugador_pokemons(jugador_id);

-- ========================================
-- FRUTAS
-- ========================================

CREATE TABLE frutas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL,

  xp_otorgada INT NOT NULL CHECK (xp_otorgada > 0),
  tiempo_produccion INT NOT NULL CHECK (tiempo_produccion > 0), -- minutos

  imagen VARCHAR(255)
);

-- ========================================
-- INVENTARIO DE FRUTAS DEL JUGADOR
-- ========================================

CREATE TABLE jugador_frutas (
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  fruta_id INT NOT NULL REFERENCES frutas(id),
  cantidad INT NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  PRIMARY KEY (jugador_id, fruta_id)
);

-- ========================================
-- HÁBITATS
-- ========================================

CREATE TABLE habitats (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL,
  tipo VARCHAR(20),

  capacidad INT NOT NULL CHECK (capacidad >= 0),
  descripcion TEXT,
  imagen VARCHAR(255),

  nivel_requerido INT NOT NULL DEFAULT 1 CHECK (nivel_requerido >= 1)
);

-- ========================================
-- HÁBITATS DEL JUGADOR (SLOTS)
-- ========================================

CREATE TABLE jugador_habitats (
  id SERIAL PRIMARY KEY,
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  habitat_id INT NOT NULL REFERENCES habitats(id),
  nombre VARCHAR(30),
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para mejorar rendimiento
CREATE INDEX idx_jugador_habitats_jugador_id ON jugador_habitats(jugador_id);

-- ========================================
-- POKÉMON DENTRO DE CADA HÁBITAT DEL JUGADOR
-- ========================================

CREATE TABLE jugador_habitat_pokemons (
  jugador_habitat_id INT NOT NULL REFERENCES jugador_habitats(id) ON DELETE CASCADE,
  jugador_pokemon_id INT NOT NULL REFERENCES jugador_pokemons(id) ON DELETE CASCADE,
  PRIMARY KEY (jugador_habitat_id, jugador_pokemon_id),
  UNIQUE (jugador_pokemon_id)  -- Un Pokémon solo puede estar en un hábitat a la vez
);

-- ========================================
-- GRANJAS DEL JUGADOR
-- ========================================

CREATE TABLE granjas (
  id SERIAL PRIMARY KEY,
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,

  nivel INT NOT NULL DEFAULT 1 CHECK (nivel >= 1),

  fruta_id INT REFERENCES frutas(id) ON DELETE SET NULL,     -- fruta plantada (NULL = vacía)
  inicio_produccion TIMESTAMP,             -- cuándo se plantó

  CHECK (
    (fruta_id IS NULL AND inicio_produccion IS NULL) OR
    (fruta_id IS NOT NULL AND inicio_produccion IS NOT NULL)
  ),

  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para mejorar rendimiento
CREATE INDEX idx_granjas_jugador_id ON granjas(jugador_id);

-- ========================================
-- ZONAS DE CAPTURA
-- ========================================

CREATE TABLE zonas_captura (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL,
  descripcion TEXT,
  imagen VARCHAR(255),

  nivel_requerido INT NOT NULL DEFAULT 1 CHECK (nivel_requerido >= 1)
);

-- ========================================
-- ENTRENADORES (NPC)
-- ========================================

CREATE TABLE entrenadores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL,
  descripcion TEXT,
  nivel INT NOT NULL DEFAULT 1 CHECK (nivel >= 1),
  edad INT CHECK (edad >= 0),
  imagen VARCHAR(255)
);

-- ========================================
-- EQUIPO DE ENTRENADORES
-- ========================================

CREATE TABLE entrenador_pokemons (
  entrenador_id INT NOT NULL REFERENCES entrenadores(id) ON DELETE CASCADE,
  pokemon_id INT NOT NULL REFERENCES pokemons(id) ON DELETE RESTRICT,
  nivel INT NOT NULL DEFAULT 1 CHECK (nivel >= 1),
  PRIMARY KEY (entrenador_id, pokemon_id)
);

-- ========================================
-- EVOLUCIONES (POR NIVEL)
-- ========================================

CREATE TABLE evoluciones (
  id SERIAL PRIMARY KEY,
  pokemon_id INT NOT NULL REFERENCES pokemons(id) ON DELETE CASCADE,
  etapa_actual INT NOT NULL CHECK (etapa_actual BETWEEN 1 AND 3),
  etapa_siguiente INT NOT NULL CHECK (etapa_siguiente BETWEEN 2 AND 3),
  nivel_requerido INT NOT NULL CHECK (nivel_requerido > 0),
  pokemon_id_siguiente INT NOT NULL REFERENCES pokemons(id) ON DELETE CASCADE,
  UNIQUE (pokemon_id, etapa_actual)
);