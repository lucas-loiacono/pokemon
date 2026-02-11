const { Pool } = require('pg');
const { verificarSubidaNivelPokemon } = require('./niveles');

const dbClient = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_LXJPI0oZf5Qv@ep-solitary-river-ai21ihv6-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

//  const dbClient = new Pool({
//    user: 'postgres',
//    host: 'localhost',
//    database: 'pokemon',
//    password: 'postgres',
//    port: 5432,
//  });

const FRUTA_ID = 1; // Siempre "Bayas verdes"
const XP_POR_FRUTA = 20;

// ==================== HELPER: Obtener ID del jugador actual ====================
async function getJugadorId() {
  const result = await dbClient.query('SELECT id FROM jugadores ORDER BY id DESC LIMIT 1');
  return result.rows[0]?.id || null;
}

// ==================== ALIMENTAR POKÉMON ====================

async function alimentarPokemon(jugador_pokemon_id) {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return { error: 'Jugador not found' };
  }

  // 1. Verificar que el Pokémon existe y pertenece al jugador
  const pokemonCheck = await dbClient.query(`
    SELECT 
      jp.id,
      jp.nivel,
      jp.xp,
      p.nombre as pokemon_nombre,
      jp.apodo
    FROM jugador_pokemons jp
    INNER JOIN pokemons p ON jp.pokemon_id = p.id
    WHERE jp.id = $1 AND jp.jugador_id = $2
  `, [jugador_pokemon_id, jugadorId]);

  if (pokemonCheck.rowCount === 0) {
    return { error: 'Pokemon not found' };
  }

  const { nivel, xp, pokemon_nombre, apodo } = pokemonCheck.rows[0];

  // 2. Verificar que el jugador tiene frutas
  const frutaCheck = await dbClient.query(`
    SELECT cantidad
    FROM jugador_frutas
    WHERE jugador_id = $1 AND fruta_id = $2
  `, [jugadorId, FRUTA_ID]);

  if (frutaCheck.rowCount === 0 || frutaCheck.rows[0].cantidad < 1) {
    return { 
      error: 'No frutas available',
      mensaje: 'No tienes frutas disponibles. Ve a recolectar en las granjas.'
    };
  }

  const cantidad_disponible = frutaCheck.rows[0].cantidad;

  // 3. Verificar que no está en nivel máximo (30)
  if (nivel >= 30) {
    return {
      error: 'Pokemon at max level',
      mensaje: `${apodo || pokemon_nombre} ya está en el nivel máximo (30)`
    };
  }

  // 4. Descontar 1 fruta del inventario
  await dbClient.query(`
    UPDATE jugador_frutas
    SET cantidad = cantidad - 1
    WHERE jugador_id = $1 AND fruta_id = $2
  `, [jugadorId, FRUTA_ID]);

  // 5. Dar 20 XP al Pokémon
  const result = await dbClient.query(`
    UPDATE jugador_pokemons
    SET xp = xp + $1
    WHERE id = $2
    RETURNING nivel, xp
  `, [XP_POR_FRUTA, jugador_pokemon_id]);

  const nuevaXp = result.rows[0].xp;

  // 6. Verificar subida de nivel automáticamente
  const resultadoNivel = await verificarSubidaNivelPokemon(jugador_pokemon_id);

  return {
    mensaje: `${apodo || pokemon_nombre} ganó ${XP_POR_FRUTA} XP`,
    pokemon_id: jugador_pokemon_id,
    pokemon_nombre: pokemon_nombre,
    apodo: apodo,
    xp_ganada: XP_POR_FRUTA,
    xp_anterior: xp,
    xp_nueva: nuevaXp,
    nivel_anterior: nivel,
    nivel_actual: resultadoNivel.nivel_nuevo || resultadoNivel.nivel || nivel,
    subio_nivel: resultadoNivel.subio_nivel || false,
    niveles_subidos: resultadoNivel.niveles_subidos || [],
    xp_para_siguiente: resultadoNivel.xp_para_siguiente,
    frutas_restantes: cantidad_disponible - 1
  };
}

module.exports = {
  alimentarPokemon
};