const { Pool } = require('pg');

const dbClient = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pokemon',
  password: 'postgres',
  port: 5432,
});

const JUGADOR_ID = 1;
const MAX_NIVEL = 30;
const XP_POR_NIVEL = 100;

// ==================== CALCULAR XP NECESARIA ====================

function calcularXPNecesaria(nivelActual) {
  // Siempre 100 XP por nivel
  return XP_POR_NIVEL;
}

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
  // 1. Obtener Pokémon
  const pokemon = await dbClient.query(`
    SELECT id, nivel, xp, pokemon_id
    FROM jugador_pokemons
    WHERE id = $1 AND jugador_id = $2
  `, [jugador_pokemon_id, JUGADOR_ID]);

  if (pokemon.rowCount === 0) {
    return { error: 'Pokemon not found' };
  }

  const { nivel: nivelActual, xp: xpActual } = pokemon.rows[0];

  // 2. Verificar si puede subir de nivel
  if (nivelActual >= MAX_NIVEL) {
    return { 
      subio_nivel: false, 
      mensaje: 'Pokemon at max level',
      nivel: nivelActual,
      xp: xpActual
    };
  }

  // 3. Calcular cuántos niveles sube
  const xpAcumuladaActual = calcularXPAcumulada(nivelActual);
  const nivelesQuePuedaSubir = Math.floor((xpActual - xpAcumuladaActual) / XP_POR_NIVEL);
  const nivelNuevo = Math.min(nivelActual + nivelesQuePuedaSubir, MAX_NIVEL);

  // 4. Si subió de nivel, actualizar
  if (nivelNuevo > nivelActual) {
    await dbClient.query(`
      UPDATE jugador_pokemons
      SET nivel = $1
      WHERE id = $2
    `, [nivelNuevo, jugador_pokemon_id]);

    const nivelesSubidos = [];
    for (let i = nivelActual + 1; i <= nivelNuevo; i++) {
      nivelesSubidos.push(i);
    }

    return {
      subio_nivel: true,
      nivel_anterior: nivelActual,
      nivel_nuevo: nivelNuevo,
      niveles_subidos: nivelesSubidos,
      xp_actual: xpActual,
      xp_para_siguiente: calcularXPAcumulada(nivelNuevo + 1),
      pokemon_id: jugador_pokemon_id
    };
  }

  // 5. Si no subió, devolver info de progreso
  const xpParaSiguiente = calcularXPAcumulada(nivelActual + 1);
  const xpFaltante = xpParaSiguiente - xpActual;

  return {
    subio_nivel: false,
    nivel: nivelActual,
    xp_actual: xpActual,
    xp_para_siguiente: xpParaSiguiente,
    xp_faltante: xpFaltante,
    pokemon_id: jugador_pokemon_id
  };
}

// ==================== SUBIR NIVEL JUGADOR ====================

async function verificarSubidaNivelJugador() {
  // 1. Obtener jugador
  const jugador = await dbClient.query(`
    SELECT id, nivel, xp
    FROM jugadores
    WHERE id = $1
  `, [JUGADOR_ID]);

  if (jugador.rowCount === 0) {
    return { error: 'Jugador not found' };
  }

  const { nivel: nivelActual, xp: xpActual } = jugador.rows[0];

  // 2. Verificar si puede subir de nivel
  if (nivelActual >= MAX_NIVEL) {
    return { 
      subio_nivel: false, 
      mensaje: 'Jugador at max level',
      nivel: nivelActual,
      xp: xpActual
    };
  }

  // 3. Calcular cuántos niveles sube
  const xpAcumuladaActual = calcularXPAcumulada(nivelActual);
  const nivelesQuePuedaSubir = Math.floor((xpActual - xpAcumuladaActual) / XP_POR_NIVEL);
  const nivelNuevo = Math.min(nivelActual + nivelesQuePuedaSubir, MAX_NIVEL);

  // 4. Si subió de nivel, actualizar
  if (nivelNuevo > nivelActual) {
    await dbClient.query(`
      UPDATE jugadores
      SET nivel = $1
      WHERE id = $2
    `, [nivelNuevo, JUGADOR_ID]);

    const nivelesSubidos = [];
    for (let i = nivelActual + 1; i <= nivelNuevo; i++) {
      nivelesSubidos.push(i);
    }

    // Obtener nuevos slots desbloqueados
    const slotsInventario = await dbClient.query(`
      SELECT slots_disponibles FROM inventario_slots_config
      WHERE nivel_jugador = $1
    `, [nivelNuevo]);

    const slotsGranjas = await dbClient.query(`
      SELECT slots_disponibles FROM granjas_slots_config
      WHERE nivel_jugador = $1
    `, [nivelNuevo]);

    return {
      subio_nivel: true,
      nivel_anterior: nivelActual,
      nivel_nuevo: nivelNuevo,
      niveles_subidos: nivelesSubidos,
      xp_actual: xpActual,
      xp_para_siguiente: calcularXPAcumulada(nivelNuevo + 1),
      slots_inventario: slotsInventario.rows[0].slots_disponibles,
      slots_granjas: slotsGranjas.rows[0].slots_disponibles
    };
  }

  // 5. Si no subió, devolver info de progreso
  const xpParaSiguiente = calcularXPAcumulada(nivelActual + 1);
  const xpFaltante = xpParaSiguiente - xpActual;

  return {
    subio_nivel: false,
    nivel: nivelActual,
    xp_actual: xpActual,
    xp_para_siguiente: xpParaSiguiente,
    xp_faltante: xpFaltante
  };
}

// ==================== OBTENER INFO DE NIVEL ====================

async function getInfoNivelPokemon(jugador_pokemon_id) {
  const pokemon = await dbClient.query(`
    SELECT 
      jp.id,
      jp.nivel,
      jp.xp,
      p.nombre as pokemon_nombre
    FROM jugador_pokemons jp
    INNER JOIN pokemons p ON jp.pokemon_id = p.id
    WHERE jp.id = $1 AND jp.jugador_id = $2
  `, [jugador_pokemon_id, JUGADOR_ID]);

  if (pokemon.rowCount === 0) {
    return null;
  }

  const { nivel, xp, pokemon_nombre } = pokemon.rows[0];

  const xpParaSiguiente = calcularXPAcumulada(nivel + 1);
  const xpAcumuladaActual = calcularXPAcumulada(nivel);
  const xpEnNivelActual = xp - xpAcumuladaActual;
  const xpFaltante = Math.max(0, XP_POR_NIVEL - xpEnNivelActual);
  const porcentaje = nivel >= MAX_NIVEL ? 100 : ((xpEnNivelActual / XP_POR_NIVEL) * 100).toFixed(2);

  return {
    jugador_pokemon_id,
    pokemon_nombre,
    nivel,
    xp_actual: xp,
    xp_en_nivel_actual: xpEnNivelActual,
    xp_para_siguiente: XP_POR_NIVEL,
    xp_faltante: nivel >= MAX_NIVEL ? 0 : xpFaltante,
    porcentaje_progreso: parseFloat(porcentaje),
    max_nivel: nivel >= MAX_NIVEL
  };
}

async function getInfoNivelJugador() {
  const jugador = await dbClient.query(`
    SELECT nivel, xp
    FROM jugadores
    WHERE id = $1
  `, [JUGADOR_ID]);

  if (jugador.rowCount === 0) {
    return null;
  }

  const { nivel, xp } = jugador.rows[0];

  const xpAcumuladaActual = calcularXPAcumulada(nivel);
  const xpEnNivelActual = xp - xpAcumuladaActual;
  const xpFaltante = Math.max(0, XP_POR_NIVEL - xpEnNivelActual);
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
    xp_actual: xp,
    xp_en_nivel_actual: xpEnNivelActual,
    xp_para_siguiente: XP_POR_NIVEL,
    xp_faltante: nivel >= MAX_NIVEL ? 0 : xpFaltante,
    porcentaje_progreso: parseFloat(porcentaje),
    max_nivel: nivel >= MAX_NIVEL,
    slots_inventario: slotsInventario.rows[0].slots_disponibles,
    slots_granjas: slotsGranjas.rows[0].slots_disponibles
  };
}

module.exports = {
  verificarSubidaNivelPokemon,
  verificarSubidaNivelJugador,
  getInfoNivelPokemon,
  getInfoNivelJugador,
  calcularXPNecesaria,
  calcularXPAcumulada
};