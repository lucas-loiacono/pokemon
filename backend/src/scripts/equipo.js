const { Pool } = require('pg');

const dbClient = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pokemon',
  password: 'postgres',
  port: 5432,
});

const JUGADOR_ID = 1;

// ==================== VER EQUIPO ====================

async function getEquipo() {
  const result = await dbClient.query(`
    SELECT 
      ec.posicion,
      ec.jugador_pokemon_id,
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
    FROM equipo_combate ec
    INNER JOIN jugador_pokemons jp ON ec.jugador_pokemon_id = jp.id
    INNER JOIN pokemons p ON jp.pokemon_id = p.id
    INNER JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
    INNER JOIN tipos t ON pt.tipo_id = t.id
    WHERE ec.jugador_id = $1
    GROUP BY ec.posicion, ec.jugador_pokemon_id, p.id, p.pokedex_id, p.nombre, p.imagen_url, jp.nivel, jp.xp, jp.combates_ganados, jp.etapa_evolucion, jp.apodo
    ORDER BY ec.posicion
  `, [JUGADOR_ID]);

  return result.rows;
}


// ==================== AGREGAR AL EQUIPO ====================

async function agregarAlEquipo(jugador_pokemon_id, posicion) {
  // 1. Verificar que el Pokémon existe y pertenece al jugador
  const pokemonCheck = await dbClient.query(`
    SELECT id FROM jugador_pokemons
    WHERE id = $1 AND jugador_id = $2
  `, [jugador_pokemon_id, JUGADOR_ID]);

  if (pokemonCheck.rowCount === 0) {
    return { error: 'Pokemon not found' };
  }

  // 2. Verificar que no está ya en el equipo
  const enEquipo = await dbClient.query(`
    SELECT posicion FROM equipo_combate
    WHERE jugador_pokemon_id = $1
  `, [jugador_pokemon_id]);

  if (enEquipo.rowCount > 0) {
    return { error: 'Pokemon already in team' };
  }

  // 3. Si no se especifica posición, buscar la primera disponible
  if (!posicion) {
    const posicionDisponible = await dbClient.query(`
      SELECT n as posicion
      FROM generate_series(1, 5) n
      WHERE n NOT IN (
        SELECT posicion FROM equipo_combate WHERE jugador_id = $1
      )
      ORDER BY n
      LIMIT 1
    `, [JUGADOR_ID]);

    if (posicionDisponible.rowCount === 0) {
      return { error: 'Team is full' };
    }

    posicion = posicionDisponible.rows[0].posicion;
  }

  // 4. Verificar que la posición está libre
  const posicionOcupada = await dbClient.query(`
    SELECT jugador_pokemon_id FROM equipo_combate
    WHERE jugador_id = $1 AND posicion = $2
  `, [JUGADOR_ID, posicion]);

  if (posicionOcupada.rowCount > 0) {
    return { error: 'Position already occupied' };
  }

  // 5. Agregar al equipo
  const result = await dbClient.query(`
    INSERT INTO equipo_combate (jugador_id, jugador_pokemon_id, posicion)
    VALUES ($1, $2, $3)
    RETURNING *
  `, [JUGADOR_ID, jugador_pokemon_id, posicion]);

  return result.rows[0];
}

// ==================== QUITAR DEL EQUIPO ====================

async function quitarDelEquipo(posicion) {
  const result = await dbClient.query(`
    DELETE FROM equipo_combate
    WHERE jugador_id = $1 AND posicion = $2
    RETURNING *
  `, [JUGADOR_ID, posicion]);

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
}

// ==================== REORDENAR EQUIPO ====================

async function reordenarEquipo(nuevoOrden) {
  // nuevoOrden es un array: [{ jugador_pokemon_id: 1, posicion: 1 }, ...]

  // 1. Validar que hay exactamente los Pokémon del equipo
  const equipoActual = await dbClient.query(`
    SELECT jugador_pokemon_id FROM equipo_combate
    WHERE jugador_id = $1
  `, [JUGADOR_ID]);

  const idsActuales = equipoActual.rows.map(r => r.jugador_pokemon_id).sort();
  const idsNuevos = nuevoOrden.map(p => p.jugador_pokemon_id).sort();

  if (JSON.stringify(idsActuales) !== JSON.stringify(idsNuevos)) {
    return { error: 'Invalid team configuration' };
  }

  // 2. Eliminar todas las posiciones actuales
  await dbClient.query(`
    DELETE FROM equipo_combate WHERE jugador_id = $1
  `, [JUGADOR_ID]);

  // 3. Insertar el nuevo orden
  for (const pokemon of nuevoOrden) {
    await dbClient.query(`
      INSERT INTO equipo_combate (jugador_id, jugador_pokemon_id, posicion)
      VALUES ($1, $2, $3)
    `, [JUGADOR_ID, pokemon.jugador_pokemon_id, pokemon.posicion]);
  }

  return { message: 'Team reordered successfully' };
}

module.exports = {
  getEquipo,
  agregarAlEquipo,
  quitarDelEquipo,
  reordenarEquipo
};