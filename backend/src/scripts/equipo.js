const { Pool } = require('pg');

//const dbClient = new Pool({
//  connectionString: 'postgresql://neondb_owner:npg_LXJPI0oZf5Qv@ep-solitary-river-ai21ihv6-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
//  ssl: {
//    rejectUnauthorized: false
//  }
//});

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

// ==================== VER EQUIPO ====================

async function getEquipo() {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return { error: 'Jugador not found' };
  }

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
  `, [jugadorId]);

  return result.rows;
}

// ==================== AGREGAR AL EQUIPO ====================

async function agregarAlEquipo(jugador_pokemon_id, posicion) {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return { error: 'Jugador not found' };
  }

  // 1. Verificar que el Pokémon existe y pertenece al jugador
  const pokemonCheck = await dbClient.query(`
    SELECT id FROM jugador_pokemons
    WHERE id = $1 AND jugador_id = $2
  `, [jugador_pokemon_id, jugadorId]);

  if (pokemonCheck.rowCount === 0) {
    return { error: 'Pokemon not found' };
  }

  // 2. Verificar que no está ya en el equipo
  const enEquipo = await dbClient.query(`
    SELECT posicion FROM equipo_combate
    WHERE jugador_pokemon_id = $1
  `, [jugador_pokemon_id]);

  if (enEquipo.rowCount > 0) {
    return { 
      error: 'Pokemon already in team',
      posicion_actual: enEquipo.rows[0].posicion
    };
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
    `, [jugadorId]);

    if (posicionDisponible.rowCount === 0) {
      return { 
        error: 'Team is full',
        mensaje: 'El equipo está completo (5/5). Quita un Pokémon primero.'
      };
    }

    posicion = posicionDisponible.rows[0].posicion;
  }

  // 4. Verificar que la posición está libre
  const posicionOcupada = await dbClient.query(`
    SELECT jugador_pokemon_id FROM equipo_combate
    WHERE jugador_id = $1 AND posicion = $2
  `, [jugadorId, posicion]);

  if (posicionOcupada.rowCount > 0) {
    return { 
      error: 'Position already occupied',
      mensaje: `La posición ${posicion} ya está ocupada`
    };
  }

  // 5. Agregar al equipo
  await dbClient.query(`
    INSERT INTO equipo_combate (jugador_id, jugador_pokemon_id, posicion)
    VALUES ($1, $2, $3)
  `, [jugadorId, jugador_pokemon_id, posicion]);

  // 6. Obtener info del Pokémon agregado
  const pokemon = await dbClient.query(`
    SELECT 
      jp.id as jugador_pokemon_id,
      p.id as pokemon_id,
      p.pokedex_id,
      p.nombre,
      p.imagen_url,
      jp.nivel,
      jp.apodo,
      ARRAY_AGG(t.nombre ORDER BY pt.orden) as tipos
    FROM jugador_pokemons jp
    INNER JOIN pokemons p ON jp.pokemon_id = p.id
    INNER JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
    INNER JOIN tipos t ON pt.tipo_id = t.id
    WHERE jp.id = $1
    GROUP BY jp.id, p.id, p.pokedex_id, p.nombre, p.imagen_url, jp.nivel, jp.apodo
  `, [jugador_pokemon_id]);

  return {
    mensaje: 'Pokemon agregado al equipo',
    posicion: posicion,
    pokemon: pokemon.rows[0]
  };
}

// ==================== QUITAR DEL EQUIPO ====================

async function quitarDelEquipo(posicion) {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return { error: 'Jugador not found' };
  }

  // Obtener info antes de eliminar
  const pokemon = await dbClient.query(`
    SELECT 
      ec.jugador_pokemon_id,
      p.nombre,
      jp.apodo
    FROM equipo_combate ec
    INNER JOIN jugador_pokemons jp ON ec.jugador_pokemon_id = jp.id
    INNER JOIN pokemons p ON jp.pokemon_id = p.id
    WHERE ec.jugador_id = $1 AND ec.posicion = $2
  `, [jugadorId, posicion]);

  if (pokemon.rowCount === 0) {
    return { 
      error: 'Position empty',
      mensaje: `No hay ningún Pokémon en la posición ${posicion}`
    };
  }

  const { nombre, apodo } = pokemon.rows[0];

  // Eliminar del equipo
  await dbClient.query(`
    DELETE FROM equipo_combate
    WHERE jugador_id = $1 AND posicion = $2
  `, [jugadorId, posicion]);

  return {
    mensaje: `${apodo || nombre} fue removido del equipo`,
    posicion: posicion
  };
}

// ==================== REORDENAR EQUIPO ====================

async function reordenarEquipo(nuevoOrden) {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return { error: 'Jugador not found' };
  }

  // nuevoOrden es un array: [{ jugador_pokemon_id: 1, posicion: 1 }, ...]

  // 1. Validar formato
  if (!Array.isArray(nuevoOrden) || nuevoOrden.length === 0) {
    return { error: 'Invalid format' };
  }

  // 2. Validar que hay exactamente los Pokémon del equipo
  const equipoActual = await dbClient.query(`
    SELECT jugador_pokemon_id FROM equipo_combate
    WHERE jugador_id = $1
  `, [jugadorId]);

  const idsActuales = equipoActual.rows.map(r => r.jugador_pokemon_id).sort((a, b) => a - b);
  const idsNuevos = nuevoOrden.map(p => p.jugador_pokemon_id).sort((a, b) => a - b);

  if (JSON.stringify(idsActuales) !== JSON.stringify(idsNuevos)) {
    return { 
      error: 'Invalid team configuration',
      mensaje: 'Los Pokémon en el nuevo orden no coinciden con el equipo actual'
    };
  }

  // 3. Validar posiciones (1-5, sin duplicados)
  const posiciones = nuevoOrden.map(p => p.posicion);
  const posicionesUnicas = [...new Set(posiciones)];
  
  if (posicionesUnicas.length !== nuevoOrden.length) {
    return { error: 'Duplicate positions' };
  }

  for (const pos of posiciones) {
    if (pos < 1 || pos > 5) {
      return { error: 'Invalid position', mensaje: 'Las posiciones deben estar entre 1 y 5' };
    }
  }

  // 4. Eliminar todas las posiciones actuales
  await dbClient.query(`
    DELETE FROM equipo_combate WHERE jugador_id = $1
  `, [jugadorId]);

  // 5. Insertar el nuevo orden
  for (const pokemon of nuevoOrden) {
    await dbClient.query(`
      INSERT INTO equipo_combate (jugador_id, jugador_pokemon_id, posicion)
      VALUES ($1, $2, $3)
    `, [jugadorId, pokemon.jugador_pokemon_id, pokemon.posicion]);
  }

  return { 
    mensaje: 'Equipo reordenado exitosamente',
    nuevo_orden: nuevoOrden
  };
}

module.exports = {
  getEquipo,
  agregarAlEquipo,
  quitarDelEquipo,
  reordenarEquipo
};