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

const MAX_NIVEL = 30;
const XP_POR_NIVEL = 100;

// ==================== HELPER: Obtener ID del jugador actual ====================
async function getJugadorId() {
  const result = await dbClient.query('SELECT id FROM jugadores ORDER BY id DESC LIMIT 1');
  return result.rows[0]?.id || null;
}

// ==================== CALCULAR XP ACUMULADA ====================
function calcularXPAcumulada(nivel) {
  // XP total acumulada hasta llegar a ese nivel
  // Nivel 1 = 0 XP
  // Nivel 2 = 100 XP
  // Nivel 3 = 200 XP
  // Nivel 30 = 2900 XP
  return (nivel - 1) * XP_POR_NIVEL;
}

// ==================== SUBIR NIVEL POKÉMON ====================

async function verificarSubidaNivelPokemon(jugador_pokemon_id) {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return { error: 'Jugador not found' };
  }

  // 1. Obtener Pokémon
  const pokemon = await dbClient.query(`
    SELECT 
      jp.id, 
      jp.nivel, 
      jp.xp, 
      jp.pokemon_id,
      p.nombre as pokemon_nombre,
      jp.apodo
    FROM jugador_pokemons jp
    INNER JOIN pokemons p ON jp.pokemon_id = p.id
    WHERE jp.id = $1 AND jp.jugador_id = $2
  `, [jugador_pokemon_id, jugadorId]);

  if (pokemon.rowCount === 0) {
    return { error: 'Pokemon not found' };
  }

  let { nivel, xp, pokemon_nombre, apodo } = pokemon.rows[0];
  const nivelOriginal = nivel;

  // 2. Verificar si puede subir de nivel
  if (nivel >= MAX_NIVEL) {
    return { 
      subio_nivel: false, 
      mensaje: `${apodo || pokemon_nombre} ya está en el nivel máximo (${MAX_NIVEL})`,
      nivel: nivel,
      xp: xp
    };
  }

  // 3. Calcular cuántos niveles sube
  let nivelesSubidos = [];
  
  while (nivel < MAX_NIVEL) {
    const xpNecesaria = calcularXPAcumulada(nivel + 1);
    
    if (xp >= xpNecesaria) {
      nivel++;
      nivelesSubidos.push(nivel);
    } else {
      break;
    }
  }

  // 4. Si subió de nivel, actualizar
  if (nivelesSubidos.length > 0) {
    await dbClient.query(`
      UPDATE jugador_pokemons
      SET nivel = $1
      WHERE id = $2
    `, [nivel, jugador_pokemon_id]);

    const xpParaSiguiente = nivel < MAX_NIVEL ? calcularXPAcumulada(nivel + 1) : 0;
    const xpEnNivelActual = xp - calcularXPAcumulada(nivel);

    return {
      subio_nivel: true,
      mensaje: `¡${apodo || pokemon_nombre} subió de nivel!`,
      pokemon: apodo || pokemon_nombre,
      nivel_anterior: nivelOriginal,
      nivel_nuevo: nivel,
      niveles_subidos: nivelesSubidos,
      xp_actual: xp,
      xp_en_nivel_actual: xpEnNivelActual,
      xp_para_siguiente: xpParaSiguiente,
      pokemon_id: jugador_pokemon_id
    };
  }

  // 5. Si no subió, devolver info de progreso
  const xpParaSiguiente = calcularXPAcumulada(nivel + 1);
  const xpEnNivelActual = xp - calcularXPAcumulada(nivel);
  const xpFaltante = xpParaSiguiente - xp;

  return {
    subio_nivel: false,
    pokemon: apodo || pokemon_nombre,
    nivel: nivel,
    xp_actual: xp,
    xp_en_nivel_actual: xpEnNivelActual,
    xp_para_siguiente: xpParaSiguiente,
    xp_faltante: xpFaltante,
    pokemon_id: jugador_pokemon_id
  };
}

// ==================== SUBIR NIVEL JUGADOR ====================

async function verificarSubidaNivelJugador() {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return { error: 'Jugador not found' };
  }

  // 1. Obtener jugador
  const jugador = await dbClient.query(`
    SELECT id, nivel, xp
    FROM jugadores
    WHERE id = $1
  `, [jugadorId]);

  if (jugador.rowCount === 0) {
    return { error: 'Jugador not found' };
  }

  let { nivel, xp } = jugador.rows[0];
  const nivelOriginal = nivel;

  // 2. Verificar si puede subir de nivel
  if (nivel >= MAX_NIVEL) {
    return { 
      subio_nivel: false, 
      mensaje: `Jugador en nivel máximo (${MAX_NIVEL})`,
      nivel: nivel,
      xp: xp
    };
  }

  // 3. Calcular cuántos niveles sube
  let nivelesSubidos = [];
  
  while (nivel < MAX_NIVEL) {
    const xpNecesaria = calcularXPAcumulada(nivel + 1);
    
    if (xp >= xpNecesaria) {
      nivel++;
      nivelesSubidos.push(nivel);
    } else {
      break;
    }
  }

  // 4. Si subió de nivel, actualizar
  if (nivelesSubidos.length > 0) {
    await dbClient.query(`
      UPDATE jugadores
      SET nivel = $1
      WHERE id = $2
    `, [nivel, jugadorId]);

    // Obtener slots desbloqueados
    const slotsInventario = await dbClient.query(`
      SELECT slots_disponibles FROM inventario_slots_config
      WHERE nivel_jugador = $1
    `, [nivel]);

    const slotsGranjas = await dbClient.query(`
      SELECT slots_disponibles FROM granjas_slots_config
      WHERE nivel_jugador = $1
    `, [nivel]);

    const xpParaSiguiente = nivel < MAX_NIVEL ? calcularXPAcumulada(nivel + 1) : 0;
    const xpEnNivelActual = xp - calcularXPAcumulada(nivel);

    return {
      subio_nivel: true,
      mensaje: '¡Subiste de nivel!',
      nivel_anterior: nivelOriginal,
      nivel_nuevo: nivel,
      niveles_subidos: nivelesSubidos,
      xp_actual: xp,
      xp_en_nivel_actual: xpEnNivelActual,
      xp_para_siguiente: xpParaSiguiente,
      slots_inventario: slotsInventario.rows[0]?.slots_disponibles || 10,
      slots_granjas: slotsGranjas.rows[0]?.slots_disponibles || 1
    };
  }

  // 5. Si no subió, devolver info de progreso
  const xpParaSiguiente = calcularXPAcumulada(nivel + 1);
  const xpEnNivelActual = xp - calcularXPAcumulada(nivel);
  const xpFaltante = xpParaSiguiente - xp;

  return {
    subio_nivel: false,
    nivel: nivel,
    xp_actual: xp,
    xp_en_nivel_actual: xpEnNivelActual,
    xp_para_siguiente: xpParaSiguiente,
    xp_faltante: xpFaltante
  };
}

// ==================== OBTENER INFO DE NIVEL ====================

async function getInfoNivelPokemon(jugador_pokemon_id) {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return null;
  }

  const pokemon = await dbClient.query(`
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

  if (pokemon.rowCount === 0) {
    return null;
  }

  const { nivel, xp, pokemon_nombre, apodo } = pokemon.rows[0];

  const xpAcumuladaActual = calcularXPAcumulada(nivel);
  const xpParaSiguiente = calcularXPAcumulada(nivel + 1);
  const xpEnNivelActual = xp - xpAcumuladaActual;
  const xpFaltante = nivel >= MAX_NIVEL ? 0 : xpParaSiguiente - xp;
  const porcentaje = nivel >= MAX_NIVEL ? 100 : ((xpEnNivelActual / XP_POR_NIVEL) * 100).toFixed(2);

  return {
    jugador_pokemon_id,
    pokemon: apodo || pokemon_nombre,
    nivel,
    xp_total: xp,
    xp_en_nivel_actual: xpEnNivelActual,
    xp_para_subir: XP_POR_NIVEL,
    xp_faltante: xpFaltante,
    porcentaje_progreso: parseFloat(porcentaje),
    max_nivel: nivel >= MAX_NIVEL,
    progreso: `${xpEnNivelActual}/${XP_POR_NIVEL}`
  };
}

async function getInfoNivelJugador() {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return null;
  }

  const jugador = await dbClient.query(`
    SELECT nivel, xp
    FROM jugadores
    WHERE id = $1
  `, [jugadorId]);

  if (jugador.rowCount === 0) {
    return null;
  }

  const { nivel, xp } = jugador.rows[0];

  const xpAcumuladaActual = calcularXPAcumulada(nivel);
  const xpParaSiguiente = calcularXPAcumulada(nivel + 1);
  const xpEnNivelActual = xp - xpAcumuladaActual;
  const xpFaltante = nivel >= MAX_NIVEL ? 0 : xpParaSiguiente - xp;
  const porcentaje = nivel >= MAX_NIVEL ? 100 : ((xpEnNivelActual / XP_POR_NIVEL) * 100).toFixed(2);

  // Obtener slots
  const slotsInventario = await dbClient.query(`
    SELECT slots_disponibles FROM inventario_slots_config
    WHERE nivel_jugador = $1
  `, [nivel]);

  const slotsGranjas = await dbClient.query(`
    SELECT slots_disponibles FROM granjas_slots_config
    WHERE nivel_jugador = $1
  `, [nivel]);

  return {
    nivel,
    xp_total: xp,
    xp_en_nivel_actual: xpEnNivelActual,
    xp_para_subir: XP_POR_NIVEL,
    xp_faltante: xpFaltante,
    porcentaje_progreso: parseFloat(porcentaje),
    max_nivel: nivel >= MAX_NIVEL,
    progreso: `${xpEnNivelActual}/${XP_POR_NIVEL}`,
    slots_inventario: slotsInventario.rows[0]?.slots_disponibles || 10,
    slots_granjas: slotsGranjas.rows[0]?.slots_disponibles || 1
  };
}

module.exports = {
  verificarSubidaNivelPokemon,
  verificarSubidaNivelJugador,
  getInfoNivelPokemon,
  getInfoNivelJugador,
  calcularXPAcumulada
};