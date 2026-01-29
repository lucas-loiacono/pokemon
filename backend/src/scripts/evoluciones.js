const { Pool } = require('pg');

const dbClient = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pokemon',
  password: 'postgres',
  port: 5432,
});

const JUGADOR_ID = 1;
const XP_POR_EVOLUCION = 50;

// ==================== VERIFICAR SI PUEDE EVOLUCIONAR ====================

async function puedeEvolucionar(jugador_pokemon_id) {
  // 1. Obtener Pokémon del jugador
  const pokemon = await dbClient.query(`
    SELECT 
      jp.id,
      jp.pokemon_id,
      jp.nivel,
      jp.etapa_evolucion,
      p.nombre as pokemon_nombre
    FROM jugador_pokemons jp
    INNER JOIN pokemons p ON jp.pokemon_id = p.id
    WHERE jp.id = $1 AND jp.jugador_id = $2
  `, [jugador_pokemon_id, JUGADOR_ID]);

  if (pokemon.rowCount === 0) {
    return { error: 'Pokemon not found' };
  }

  const { pokemon_id, nivel, etapa_evolucion, pokemon_nombre } = pokemon.rows[0];

  // 2. Verificar si tiene evolución disponible
  const evolucion = await dbClient.query(`
    SELECT 
      e.nivel_requerido,
      e.pokemon_id_siguiente,
      e.etapa_siguiente,
      p.nombre as evolucion_nombre,
      p.imagen_url as evolucion_imagen
    FROM evoluciones e
    INNER JOIN pokemons p ON e.pokemon_id_siguiente = p.id
    WHERE e.pokemon_id = $1 AND e.etapa_actual = $2
  `, [pokemon_id, etapa_evolucion]);

  if (evolucion.rowCount === 0) {
    return {
      puede_evolucionar: false,
      mensaje: 'Este Pokémon no tiene más evoluciones'
    };
  }

  const { nivel_requerido, pokemon_id_siguiente, etapa_siguiente, evolucion_nombre, evolucion_imagen } = evolucion.rows[0];

  // 3. Verificar si cumple el nivel requerido
  if (nivel < nivel_requerido) {
    return {
      puede_evolucionar: false,
      mensaje: `Necesita nivel ${nivel_requerido} para evolucionar`,
      nivel_actual: nivel,
      nivel_requerido: nivel_requerido,
      evolucion_nombre: evolucion_nombre,
      evolucion_imagen: evolucion_imagen
    };
  }

  return {
    puede_evolucionar: true,
    pokemon_actual: pokemon_nombre,
    evolucion_nombre: evolucion_nombre,
    evolucion_imagen: evolucion_imagen,
    pokemon_id_siguiente: pokemon_id_siguiente,
    etapa_siguiente: etapa_siguiente
  };
}

// ==================== EVOLUCIONAR POKÉMON ====================

async function evolucionarPokemon(jugador_pokemon_id) {
  // 1. Verificar si puede evolucionar
  const verificacion = await puedeEvolucionar(jugador_pokemon_id);

  if (verificacion.error || !verificacion.puede_evolucionar) {
    return verificacion;
  }

  const { pokemon_id_siguiente, etapa_siguiente, pokemon_actual, evolucion_nombre } = verificacion;

  // 2. Evolucionar el Pokémon
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
  `, [XP_POR_EVOLUCION, JUGADOR_ID]);

  return {
    evolucionado: true,
    pokemon_anterior: pokemon_actual,
    pokemon_nuevo: evolucion_nombre,
    etapa_nueva: etapa_siguiente,
    xp_jugador: XP_POR_EVOLUCION,
    jugador_pokemon_id: jugador_pokemon_id
  };
}

module.exports = {
  puedeEvolucionar,
  evolucionarPokemon
};