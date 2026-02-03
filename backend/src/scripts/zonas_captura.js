const { Pool } = require('pg');

const dbClient = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pokemon',
  password: 'postgres',
  port: 5432,
});

// ==================== HELPER: Obtener ID del jugador actual ====================
async function getJugadorId() {
  const result = await dbClient.query('SELECT id FROM jugadores ORDER BY id DESC LIMIT 1');
  return result.rows[0]?.id || null;
}

// ==================== ZONAS ====================

async function getAllZonas() {
  const result = await dbClient.query(`
    SELECT 
      z.id,
      z.nombre,
      z.descripcion,
      z.imagen_url,
      ARRAY_AGG(DISTINCT t.nombre ORDER BY t.nombre) as tipos,
      (
        SELECT COUNT(DISTINCT p.id)
        FROM pokemons p
        INNER JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
        WHERE pt.tipo_id IN (
          SELECT tipo_id FROM zona_tipos WHERE zona_id = z.id
        )
      ) as total_pokemons
    FROM zonas z
    INNER JOIN zona_tipos zt ON z.id = zt.zona_id
    INNER JOIN tipos t ON zt.tipo_id = t.id
    GROUP BY z.id
    ORDER BY z.id
  `);
  return result.rows;
}

async function getOneZona(id) {
  const result = await dbClient.query(`
    SELECT 
      z.id,
      z.nombre,
      z.descripcion,
      z.imagen_url,
      ARRAY_AGG(DISTINCT t.nombre ORDER BY t.nombre) as tipos
    FROM zonas z
    INNER JOIN zona_tipos zt ON z.id = zt.zona_id
    INNER JOIN tipos t ON zt.tipo_id = t.id
    WHERE z.id = $1
    GROUP BY z.id
  `, [id]);
  return result.rows[0];
}

async function getZonaPokemons(zona_id) {
  const result = await dbClient.query(`
    SELECT DISTINCT
      p.id,
      p.pokedex_id,
      p.nombre,
      p.imagen_url,
      ARRAY_AGG(DISTINCT t.nombre ORDER BY t.nombre) as tipos
    FROM pokemons p
    INNER JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
    INNER JOIN tipos t ON pt.tipo_id = t.id
    WHERE pt.tipo_id IN (
      SELECT tipo_id FROM zona_tipos WHERE zona_id = $1
    )
    GROUP BY p.id, p.pokedex_id, p.nombre, p.imagen_url
    ORDER BY p.pokedex_id
  `, [zona_id]);
  
  return result.rows;
}

// ==================== CAPTURAS ====================

async function capturarPokemon(zona_id) {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return { error: 'Jugador not found' };
  }
  
  // 1. Verificar que la zona existe
  const zona = await getOneZona(zona_id);
  if (!zona) {
    return { error: 'Zona not found' };
  }

  // 2. Verificar espacio en el inventario
  const inventarioCheck = await dbClient.query(`
    SELECT 
      (SELECT COUNT(*) FROM jugador_pokemons WHERE jugador_id = $1) as pokemons_actuales,
      isc.slots_disponibles
    FROM jugadores j
    INNER JOIN inventario_slots_config isc ON j.nivel = isc.nivel_jugador
    WHERE j.id = $1
  `, [jugadorId]);

  if (inventarioCheck.rowCount === 0) {
    return { error: 'Jugador configuration not found' };
  }

  const { pokemons_actuales, slots_disponibles } = inventarioCheck.rows[0];

  if (parseInt(pokemons_actuales) >= slots_disponibles) {
    return { 
      error: 'Inventory is full',
      mensaje: `Inventario lleno (${pokemons_actuales}/${slots_disponibles}). Libera espacio antes de capturar.`
    };
  }

  // 3. Obtener Pokémon aleatorio de los TIPOS de la zona
  const pokemonsDisponibles = await dbClient.query(`
    SELECT DISTINCT p.id as pokemon_id
    FROM pokemons p
    INNER JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
    WHERE pt.tipo_id IN (
      SELECT tipo_id FROM zona_tipos WHERE zona_id = $1
    )
  `, [zona_id]);

  if (pokemonsDisponibles.rowCount === 0) {
    return { error: 'No pokemons available in this zone' };
  }

  const randomIndex = Math.floor(Math.random() * pokemonsDisponibles.rowCount);
  const pokemon_id = pokemonsDisponibles.rows[randomIndex].pokemon_id;

  // 4. Capturar Pokémon (SIEMPRE nivel 1, etapa 1)
  const result = await dbClient.query(`
    INSERT INTO jugador_pokemons (jugador_id, pokemon_id, nivel, xp, combates_ganados, etapa_evolucion)
    VALUES ($1, $2, 1, 0, 0, 1)
    RETURNING *
  `, [jugadorId, pokemon_id]);

  // 5. Obtener datos completos del Pokémon capturado
  const pokemonCapturado = await dbClient.query(`
    SELECT 
      jp.id as jugador_pokemon_id,
      p.id as pokemon_id,
      p.pokedex_id,
      p.nombre,
      p.imagen_url,
      jp.nivel,
      jp.xp,
      jp.combates_ganados,
      jp.etapa_evolucion,
      jp.apodo,
      ARRAY_AGG(t.nombre ORDER BY pt.orden) as tipos
    FROM jugador_pokemons jp
    INNER JOIN pokemons p ON jp.pokemon_id = p.id
    INNER JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
    INNER JOIN tipos t ON pt.tipo_id = t.id
    WHERE jp.id = $1
    GROUP BY jp.id, p.id, p.pokedex_id, p.nombre, p.imagen_url, jp.nivel, jp.xp, jp.combates_ganados, jp.etapa_evolucion, jp.apodo
  `, [result.rows[0].id]);

  return pokemonCapturado.rows[0];
}

module.exports = {
  getAllZonas,
  getOneZona,
  getZonaPokemons,
  capturarPokemon
};