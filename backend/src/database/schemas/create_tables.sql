-- ==================== TABLAS DE POKÉMON ====================

-- Tabla de Pokémon
CREATE TABLE pokemons (
  id SERIAL PRIMARY KEY,
  pokedex_id INT UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  imagen_url TEXT
);

-- Tabla de Tipos
CREATE TABLE tipos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL
);

-- Tabla de relación Pokémon-Tipos (un Pokémon puede tener 1 o 2 tipos)
CREATE TABLE pokemon_tipos (
  id SERIAL PRIMARY KEY,
  pokemon_id INT NOT NULL REFERENCES pokemons(id) ON DELETE CASCADE,
  tipo_id INT NOT NULL REFERENCES tipos(id) ON DELETE CASCADE,
  orden INT NOT NULL CHECK (orden IN (1, 2)),
  UNIQUE (pokemon_id, tipo_id)
);

-- Tabla de efectividad entre tipos
CREATE TABLE tipo_efectividad (
  id SERIAL PRIMARY KEY,
  tipo_atacante VARCHAR(50) NOT NULL REFERENCES tipos(nombre) ON DELETE CASCADE,
  tipo_defensor VARCHAR(50) NOT NULL REFERENCES tipos(nombre) ON DELETE CASCADE,
  multiplicador DECIMAL(3, 2) NOT NULL,
  UNIQUE (tipo_atacante, tipo_defensor)
);

-- Tabla de evoluciones
CREATE TABLE evoluciones (
  id SERIAL PRIMARY KEY,
  pokemon_id INT NOT NULL REFERENCES pokemons(id) ON DELETE CASCADE,
  etapa_actual INT NOT NULL CHECK (etapa_actual IN (1, 2)),
  etapa_siguiente INT NOT NULL CHECK (etapa_siguiente IN (2, 3)),
  nivel_requerido INT NOT NULL,
  pokemon_id_siguiente INT NOT NULL REFERENCES pokemons(id) ON DELETE CASCADE,
  UNIQUE (pokemon_id, etapa_actual)
);

-- ==================== TABLAS DE MUNDO ====================

-- Tabla de Hábitats
CREATE TABLE habitats (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) UNIQUE NOT NULL,
  capacidad INT NOT NULL DEFAULT 6,
  imagen_url TEXT
);

-- Tipos aceptados por cada hábitat
CREATE TABLE habitat_tipos_aceptados (
  id SERIAL PRIMARY KEY,
  habitat_id INT NOT NULL REFERENCES habitats(id) ON DELETE CASCADE,
  tipo_nombre VARCHAR(50) NOT NULL REFERENCES tipos(nombre),
  UNIQUE (habitat_id, tipo_nombre)
);

-- Tabla de Zonas de captura
CREATE TABLE zonas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  imagen_url TEXT
);

-- Pokémon disponibles por zona (SIEMPRE NIVEL 1)
CREATE TABLE zona_pokemons (
  id SERIAL PRIMARY KEY,
  zona_id INT NOT NULL REFERENCES zonas(id) ON DELETE CASCADE,
  pokemon_id INT NOT NULL REFERENCES pokemons(id) ON DELETE CASCADE,
  UNIQUE (zona_id, pokemon_id)
);

CREATE TABLE zona_tipos (
  id SERIAL PRIMARY KEY,
  zona_id INT NOT NULL REFERENCES zonas(id) ON DELETE CASCADE,
  tipo_id INT NOT NULL REFERENCES tipos(id) ON DELETE CASCADE,
  UNIQUE(zona_id, tipo_id)
);

-- Tabla de Frutas (SIEMPRE 10 BAYAS, 10 MINUTOS, 20 XP)
CREATE TABLE frutas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  tiempo_produccion_minutos INT NOT NULL DEFAULT 10,
  cantidad_produccion INT NOT NULL DEFAULT 10,
  xp_otorgada INT NOT NULL DEFAULT 20,
  imagen_url TEXT
);

-- ==================== TABLAS DE JUGADORES ====================

-- Tabla de Jugadores (UN SOLO JUGADOR)
CREATE TABLE jugadores (
  id SERIAL PRIMARY KEY,
  nivel INT NOT NULL DEFAULT 1 CHECK (nivel >= 1 AND nivel <= 30),
  xp INT NOT NULL DEFAULT 0
);

-- Configuración de slots de inventario por nivel
CREATE TABLE inventario_slots_config (
  nivel_jugador INT PRIMARY KEY CHECK (nivel_jugador >= 1 AND nivel_jugador <= 30),
  slots_disponibles INT NOT NULL
);

-- Configuración de slots de granjas por nivel
CREATE TABLE granjas_slots_config (
  nivel_jugador INT PRIMARY KEY CHECK (nivel_jugador >= 1 AND nivel_jugador <= 30),
  slots_disponibles INT NOT NULL
);

-- Tabla de Pokémon del jugador (INVENTARIO)
CREATE TABLE jugador_pokemons (
  id SERIAL PRIMARY KEY,
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  pokemon_id INT NOT NULL REFERENCES pokemons(id) ON DELETE CASCADE,
  nivel INT NOT NULL DEFAULT 1 CHECK (nivel >= 1 AND nivel <= 30),
  xp INT NOT NULL DEFAULT 0,
  combates_ganados INT NOT NULL DEFAULT 0,
  etapa_evolucion INT NOT NULL DEFAULT 1 CHECK (etapa_evolucion IN (1, 2, 3)),
  apodo VARCHAR(50)
);

CREATE INDEX idx_jugador_pokemons_jugador ON jugador_pokemons(jugador_id);

-- Tabla de Equipo de Combate (5 POKÉMON)
CREATE TABLE equipo_combate (
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  jugador_pokemon_id INT NOT NULL REFERENCES jugador_pokemons(id) ON DELETE CASCADE,
  posicion INT NOT NULL CHECK (posicion BETWEEN 1 AND 5),
  PRIMARY KEY (jugador_id, posicion),
  UNIQUE (jugador_pokemon_id)
);

CREATE INDEX idx_equipo_combate_jugador ON equipo_combate(jugador_id);

-- Tabla de Hábitats del jugador (6 DESBLOQUEADOS DESDE INICIO)
CREATE TABLE jugador_habitats (
  id SERIAL PRIMARY KEY,
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  habitat_id INT NOT NULL REFERENCES habitats(id) ON DELETE CASCADE,
  UNIQUE (jugador_id, habitat_id)
);

CREATE INDEX idx_jugador_habitats_jugador ON jugador_habitats(jugador_id);

-- Pokémon asignados a hábitats del jugador (CAPACIDAD 6 POR HÁBITAT)
CREATE TABLE jugador_habitat_pokemons (
  id SERIAL PRIMARY KEY,
  jugador_habitat_id INT NOT NULL REFERENCES jugador_habitats(id) ON DELETE CASCADE,
  jugador_pokemon_id INT NOT NULL REFERENCES jugador_pokemons(id) ON DELETE CASCADE,
  UNIQUE (jugador_pokemon_id)
);

CREATE INDEX idx_jugador_habitat_pokemons_habitat ON jugador_habitat_pokemons(jugador_habitat_id);

-- Tabla de Granjas
CREATE TABLE granjas (
  id SERIAL PRIMARY KEY,
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  fruta_id INT REFERENCES frutas(id) ON DELETE SET NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'vacia' CHECK (estado IN ('vacia', 'plantada', 'lista')),
  plantada_en TIMESTAMP,
  lista_en TIMESTAMP
);

CREATE INDEX idx_granjas_jugador ON granjas(jugador_id);
CREATE INDEX idx_granjas_estado ON granjas(estado);

-- Inventario de frutas del jugador
CREATE TABLE jugador_frutas (
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  fruta_id INT NOT NULL REFERENCES frutas(id) ON DELETE CASCADE,
  cantidad INT NOT NULL DEFAULT 0,
  PRIMARY KEY (jugador_id, fruta_id)
);

-- ==================== ENTRENADORES Y COMBATE ====================


CREATE TABLE entrenadores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  nivel INT NOT NULL CHECK (nivel >= 1 AND nivel <= 100),
  descripcion TEXT,
  imagen_url TEXT
);


CREATE TABLE entrenador_pokemons (
  id SERIAL PRIMARY KEY,
  entrenador_id INT NOT NULL REFERENCES entrenadores(id) ON DELETE CASCADE,
  pokemon_id INT NOT NULL REFERENCES pokemons(id) ON DELETE CASCADE,
  nivel INT NOT NULL CHECK (nivel >= 1 AND nivel <= 30),
  posicion INT NOT NULL CHECK (posicion BETWEEN 1 AND 5),
  UNIQUE (entrenador_id, posicion)
);

CREATE INDEX idx_entrenador_pokemons_entrenador ON entrenador_pokemons(entrenador_id);

-
CREATE TABLE batallas (
  id SERIAL PRIMARY KEY,
  jugador_id INT NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  entrenador_id INT NOT NULL REFERENCES entrenadores(id) ON DELETE CASCADE,
  resultado VARCHAR(20) NOT NULL CHECK (resultado IN ('victoria', 'derrota')),
  combate_1_ganador VARCHAR(10) CHECK (combate_1_ganador IN ('jugador', 'enemigo')),
  combate_2_ganador VARCHAR(10) CHECK (combate_2_ganador IN ('jugador', 'enemigo')),
  combate_3_ganador VARCHAR(10) CHECK (combate_3_ganador IN ('jugador', 'enemigo')),
  combate_4_ganador VARCHAR(10) CHECK (combate_4_ganador IN ('jugador', 'enemigo')),
  combate_5_ganador VARCHAR(10) CHECK (combate_5_ganador IN ('jugador', 'enemigo')),
  victorias_jugador INT NOT NULL CHECK (victorias_jugador BETWEEN 0 AND 5),
  victorias_enemigo INT NOT NULL CHECK (victorias_enemigo BETWEEN 0 AND 5),
  xp_ganada INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_batallas_jugador ON batallas(jugador_id);
CREATE INDEX idx_batallas_resultado ON batallas(resultado);