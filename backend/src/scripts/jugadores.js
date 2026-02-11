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

// ==================== JUGADOR ====================

async function getJugador() {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return null;
  }
  
  const result = await dbClient.query(`
    SELECT 
      j.id,
      j.nivel,
      j.xp,
      COUNT(jp.pokemon_id) as total_pokemons
    FROM jugadores j
    LEFT JOIN jugador_pokemons jp ON j.id = jp.jugador_id
    WHERE j.id = $1
    GROUP BY j.id
  `, [jugadorId]);
  
  return result.rows[0];
}

async function getJugadorPokemons() {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return [];
  }
  
  const result = await dbClient.query(`
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
    WHERE jp.jugador_id = $1
    GROUP BY jp.id, p.id, p.pokedex_id, p.nombre, p.imagen_url, jp.nivel, jp.xp, jp.combates_ganados, jp.etapa_evolucion, jp.apodo
    ORDER BY jp.id
  `, [jugadorId]);
  
  return result.rows;
}

async function getJugadorInventario() {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return [];
  }
  
  const result = await dbClient.query(`
    SELECT 
      f.id,
      f.nombre,
      f.xp_otorgada,
      f.imagen_url,
      jf.cantidad
    FROM jugador_frutas jf
    INNER JOIN frutas f ON jf.fruta_id = f.id
    WHERE jf.jugador_id = $1
    ORDER BY f.nombre
  `, [jugadorId]);
  
  return result.rows;
}

async function updateJugadorStats(nivel, xp) {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return undefined;
  }
  
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (nivel !== undefined) {
    updates.push(`nivel = $${paramCount++}`);
    values.push(nivel);
  }

  if (xp !== undefined) {
    updates.push(`xp = $${paramCount++}`);
    values.push(xp);
  }

  if (updates.length === 0) {
    return undefined;
  }

  values.push(jugadorId);

  const result = await dbClient.query(
    `UPDATE jugadores SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  if (result.rowCount === 0) {
    return undefined;
  }
  return result.rows[0];
}

async function setApodo(jugador_pokemon_id, apodo) {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return undefined;
  }
  
  const result = await dbClient.query(
    `UPDATE jugador_pokemons 
     SET apodo = $1 
     WHERE id = $2 AND jugador_id = $3
     RETURNING *`,
    [apodo, jugador_pokemon_id, jugadorId]
  );

  if (result.rowCount === 0) {
    return undefined;
  }
  return result.rows[0];
}

async function eliminarPokemon(jugador_pokemon_id) {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return { error: 'Jugador not found' };
  }
  
  // 1. Verificar que el Pokémon existe y pertenece al jugador
  const pokemonCheck = await dbClient.query(`
    SELECT 
      jp.id,
      p.nombre,
      jp.nivel,
      jp.xp
    FROM jugador_pokemons jp
    INNER JOIN pokemons p ON jp.pokemon_id = p.id
    WHERE jp.id = $1 AND jp.jugador_id = $2
  `, [jugador_pokemon_id, jugadorId]);

  if (pokemonCheck.rowCount === 0) {
    return { error: 'Pokemon not found' };
  }

  const { nombre, nivel, xp } = pokemonCheck.rows[0];

  // 2. Verificar que no está en el equipo de combate
  const enEquipo = await dbClient.query(`
    SELECT posicion FROM equipo_combate
    WHERE jugador_pokemon_id = $1
  `, [jugador_pokemon_id]);

  if (enEquipo.rowCount > 0) {
    return { 
      error: 'Pokemon is in team',
      mensaje: 'No puedes eliminar un Pokémon que está en el equipo. Quítalo del equipo primero.',
      posicion: enEquipo.rows[0].posicion
    };
  }

  // 3. Eliminar el Pokémon (CASCADE eliminará automáticamente de hábitats)
  await dbClient.query(`
    DELETE FROM jugador_pokemons
    WHERE id = $1
  `, [jugador_pokemon_id]);

  return {
    eliminado: true,
    pokemon: {
      jugador_pokemon_id: jugador_pokemon_id,
      nombre: nombre,
      nivel: nivel,
      xp: xp
    },
    mensaje: `${nombre} ha sido liberado`
  };
}
// ==================== BORRAR JUGADOR (REINICIAR PARTIDA) ====================
async function borrarJugador() {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return { error: 'Jugador no encontrado' };
  }

  // Al borrar al jugador, la base de datos debería eliminar automáticamente en cascada 
  // sus pokemons, granjas, inventario, etc.
  await dbClient.query(`
    DELETE FROM jugadores
    WHERE id = $1
  `, [jugadorId]);

  return {
    eliminado: true,
    mensaje: 'Partida eliminada correctamente. Volviendo al inicio.'
  };
}

module.exports = {
  getJugador,
  getJugadorPokemons,
  getJugadorInventario,
  updateJugadorStats,
  setApodo,
  eliminarPokemon,
  borrarJugador  
};