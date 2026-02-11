const { Pool } = require('pg');

const dbClient = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_LXJPI0oZf5Qv@ep-solitary-river-ai21ihv6-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

//const dbClient = new Pool({
//  user: 'postgres',
//  host: 'localhost',
//  database: 'pokemon',
//  password: 'postgres',
//  port: 5432,
//});

const XP_POR_EVOLUCION = 50;

// ==================== HELPER: Obtener ID del jugador actual ====================
async function getJugadorId() {
  const result = await dbClient.query('SELECT id FROM jugadores ORDER BY id DESC LIMIT 1');
  return result.rows[0]?.id || null;
}

// ==================== VERIFICAR SI PUEDE EVOLUCIONAR ====================

async function puedeEvolucionar(jugador_pokemon_id) {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return { error: 'Jugador not found' };
  }

  // 1. Obtener Pokémon del jugador
  const pokemon = await dbClient.query(`
    SELECT 
      jp.id,
      jp.pokemon_id,
      jp.nivel,
      jp.etapa_evolucion,
      p.nombre as pokemon_nombre,
      p.imagen_url as pokemon_imagen
    FROM jugador_pokemons jp
    INNER JOIN pokemons p ON jp.pokemon_id = p.id
    WHERE jp.id = $1 AND jp.jugador_id = $2
  `, [jugador_pokemon_id, jugadorId]);

  if (pokemon.rowCount === 0) {
    return { error: 'Pokemon not found' };
  }

  const { pokemon_id, nivel, etapa_evolucion, pokemon_nombre, pokemon_imagen } = pokemon.rows[0];

  // 2. Verificar si tiene evolución disponible
  const evolucion = await dbClient.query(`
    SELECT 
      e.nivel_requerido,
      e.pokemon_id_siguiente,
      e.etapa_siguiente,
      p.nombre as evolucion_nombre,
      p.imagen_url as evolucion_imagen,
      p.pokedex_id as evolucion_pokedex_id
    FROM evoluciones e
    INNER JOIN pokemons p ON e.pokemon_id_siguiente = p.id
    WHERE e.pokemon_id = $1 AND e.etapa_actual = $2
  `, [pokemon_id, etapa_evolucion]);

  if (evolucion.rowCount === 0) {
    return {
      puede_evolucionar: false,
      mensaje: `${pokemon_nombre} no tiene más evoluciones`,
      pokemon_actual: pokemon_nombre,
      pokemon_imagen: pokemon_imagen
    };
  }

  const { nivel_requerido, pokemon_id_siguiente, etapa_siguiente, evolucion_nombre, evolucion_imagen, evolucion_pokedex_id } = evolucion.rows[0];

  // 3. Verificar si cumple el nivel requerido
  if (nivel < nivel_requerido) {
    return {
      puede_evolucionar: false,
      mensaje: `${pokemon_nombre} necesita nivel ${nivel_requerido} para evolucionar a ${evolucion_nombre}`,
      nivel_actual: nivel,
      nivel_requerido: nivel_requerido,
      pokemon_actual: pokemon_nombre,
      evolucion_nombre: evolucion_nombre,
      evolucion_imagen: evolucion_imagen,
      evolucion_pokedex_id: evolucion_pokedex_id
    };
  }

  return {
    puede_evolucionar: true,
    pokemon_actual: pokemon_nombre,
    nivel_actual: nivel,
    evolucion_nombre: evolucion_nombre,
    evolucion_imagen: evolucion_imagen,
    evolucion_pokedex_id: evolucion_pokedex_id,
    pokemon_id_siguiente: pokemon_id_siguiente,
    etapa_siguiente: etapa_siguiente,
    mensaje: `${pokemon_nombre} puede evolucionar a ${evolucion_nombre}!`
  };
}

// ==================== EVOLUCIONAR POKÉMON ====================

async function evolucionarPokemon(jugador_pokemon_id) {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return { error: 'Jugador not found' };
  }

  // 1. Verificar si puede evolucionar
  const verificacion = await puedeEvolucionar(jugador_pokemon_id);

  if (verificacion.error || !verificacion.puede_evolucionar) {
    return verificacion;
  }

  const { pokemon_id_siguiente, etapa_siguiente, pokemon_actual, evolucion_nombre } = verificacion;

  // 2. Evolucionar el Pokémon (mantener nivel y XP)
  await dbClient.query(`
    UPDATE jugador_pokemons
    SET 
      pokemon_id = $1,
      etapa_evolucion = $2
    WHERE id = $3
  `, [pokemon_id_siguiente, etapa_siguiente, jugador_pokemon_id]);

  // 3. Dar 50 XP al jugador
  await dbClient.query(`
    UPDATE jugadores
    SET xp = xp + $1
    WHERE id = $2
  `, [XP_POR_EVOLUCION, jugadorId]);

  // 4. Obtener info actualizada del Pokémon
  const pokemonEvolucionado = await dbClient.query(`
    SELECT 
      jp.id,
      jp.nivel,
      jp.xp,
      jp.etapa_evolucion,
      p.nombre,
      p.pokedex_id,
      p.imagen_url,
      ARRAY_AGG(t.nombre ORDER BY pt.orden) as tipos
    FROM jugador_pokemons jp
    INNER JOIN pokemons p ON jp.pokemon_id = p.id
    INNER JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
    INNER JOIN tipos t ON pt.tipo_id = t.id
    WHERE jp.id = $1
    GROUP BY jp.id, jp.nivel, jp.xp, jp.etapa_evolucion, p.nombre, p.pokedex_id, p.imagen_url
  `, [jugador_pokemon_id]);

  return {
    evolucionado: true,
    mensaje: `¡${pokemon_actual} evolucionó a ${evolucion_nombre}!`,
    pokemon_anterior: pokemon_actual,
    pokemon_nuevo: evolucion_nombre,
    etapa_nueva: etapa_siguiente,
    xp_jugador_ganada: XP_POR_EVOLUCION,
    jugador_pokemon_id: jugador_pokemon_id,
    pokemon: pokemonEvolucionado.rows[0]
  };
}

module.exports = {
  puedeEvolucionar,
  evolucionarPokemon
};