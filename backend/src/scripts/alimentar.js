const { Pool } = require('pg');

const dbClient = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pokemon',
  password: 'postgres',
  port: 5432,
});

const JUGADOR_ID = 1;
const FRUTA_ID = 1; // Siempre "Bayas verdes"
const XP_POR_FRUTA = 20;

// ==================== ALIMENTAR POKÉMON ====================

async function alimentarPokemon(jugador_pokemon_id) {
  // 1. Verificar que el Pokémon existe y pertenece al jugador
  const pokemonCheck = await dbClient.query(`
    SELECT 
      jp.id,
      jp.nivel,
      jp.xp,
      p.nombre as pokemon_nombre
    FROM jugador_pokemons jp
    INNER JOIN pokemons p ON jp.pokemon_id = p.id
    WHERE jp.id = $1 AND jp.jugador_id = $2
  `, [jugador_pokemon_id, JUGADOR_ID]);

  if (pokemonCheck.rowCount === 0) {
    return { error: 'Pokemon not found' };
  }

  const pokemon = pokemonCheck.rows[0];

  // 2. Verificar que el jugador tiene frutas
  const frutaCheck = await dbClient.query(`
    SELECT cantidad
    FROM jugador_frutas
    WHERE jugador_id = $1 AND fruta_id = $2
  `, [JUGADOR_ID, FRUTA_ID]);

  if (frutaCheck.rowCount === 0 || frutaCheck.rows[0].cantidad < 1) {
    return { error: 'No frutas available' };
  }

  const cantidad_disponible = frutaCheck.rows[0].cantidad;

  // 3. Descontar 1 fruta del inventario
  await dbClient.query(`
    UPDATE jugador_frutas
    SET cantidad = cantidad - 1
    WHERE jugador_id = $1 AND fruta_id = $2
  `, [JUGADOR_ID, FRUTA_ID]);

  // 4. Dar 20 XP al Pokémon
  const result = await dbClient.query(`
    UPDATE jugador_pokemons
    SET xp = xp + $1
    WHERE id = $2
    RETURNING *
  `, [XP_POR_FRUTA, jugador_pokemon_id]);

  return {
    pokemon_id: jugador_pokemon_id,
    pokemon_nombre: pokemon.pokemon_nombre,
    xp_ganada: XP_POR_FRUTA,
    xp_anterior: pokemon.xp,
    xp_nueva: result.rows[0].xp,
    nivel: result.rows[0].nivel,
    frutas_restantes: cantidad_disponible - 1
  };
}

module.exports = {
  alimentarPokemon
};