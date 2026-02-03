const { Pool } = require('pg');

const dbClient = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pokemon',
  password: 'postgres',
  port: 5432,
});

const FRUTA_ID = 1; // Siempre "Bayas verdes"

// ==================== HELPER: Obtener ID del jugador actual ====================
async function getJugadorId() {
  const result = await dbClient.query('SELECT id FROM jugadores ORDER BY id DESC LIMIT 1');
  return result.rows[0]?.id || null;
}

// ==================== GRANJAS DEL JUGADOR ====================

async function getJugadorGranjas() {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return { error: 'Jugador not found' };
  }

  // 1. Obtener nivel del jugador y slots disponibles
  const config = await dbClient.query(`
    SELECT 
      j.nivel,
      gsc.slots_disponibles
    FROM jugadores j
    INNER JOIN granjas_slots_config gsc ON j.nivel = gsc.nivel_jugador
    WHERE j.id = $1
  `, [jugadorId]);

  if (config.rowCount === 0) {
    return { error: 'Jugador configuration not found' };
  }

  const { nivel, slots_disponibles } = config.rows[0];

  // 2. Obtener todas las granjas y marcar cuáles están desbloqueadas
  const result = await dbClient.query(`
    WITH granjas_numeradas AS (
      SELECT 
        g.id as granja_id,
        g.lista_en,
        ROW_NUMBER() OVER (ORDER BY g.id) as numero_granja
      FROM granjas g
      WHERE g.jugador_id = $1
    )
    SELECT 
      gn.granja_id,
      gn.lista_en,
      gn.numero_granja,
      f.id as fruta_id,
      f.nombre as fruta_nombre,
      f.cantidad_produccion,
      f.imagen_url as fruta_imagen,
      CASE 
        WHEN gn.numero_granja <= $3 THEN true
        ELSE false
      END as desbloqueada,
      CASE 
        WHEN gn.numero_granja <= $3 AND (gn.lista_en IS NULL OR gn.lista_en <= NOW()) THEN true
        ELSE false
      END as puede_recolectar,
      CASE 
        WHEN gn.numero_granja <= $3 AND gn.lista_en IS NOT NULL AND gn.lista_en > NOW() 
        THEN EXTRACT(EPOCH FROM (gn.lista_en - NOW()))
        ELSE 0
      END as tiempo_restante
    FROM granjas_numeradas gn
    CROSS JOIN frutas f
    WHERE f.id = $2
    ORDER BY gn.granja_id
  `, [jugadorId, FRUTA_ID, slots_disponibles]);
  
  return {
    nivel: nivel,
    slots_disponibles: slots_disponibles,
    granjas: result.rows
  };
}

async function getGranjaDetalle(granja_id) {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return null;
  }

  // 1. Obtener slots disponibles
  const config = await dbClient.query(`
    SELECT 
      j.nivel,
      gsc.slots_disponibles
    FROM jugadores j
    INNER JOIN granjas_slots_config gsc ON j.nivel = gsc.nivel_jugador
    WHERE j.id = $1
  `, [jugadorId]);

  if (config.rowCount === 0) {
    return null;
  }

  const { nivel, slots_disponibles } = config.rows[0];

  // 2. Obtener la granja específica
  const result = await dbClient.query(`
    WITH granjas_numeradas AS (
      SELECT 
        g.id as granja_id,
        g.lista_en,
        ROW_NUMBER() OVER (ORDER BY g.id) as numero_granja
      FROM granjas g
      WHERE g.jugador_id = $1
    )
    SELECT 
      gn.granja_id,
      gn.lista_en,
      gn.numero_granja,
      f.id as fruta_id,
      f.nombre as fruta_nombre,
      f.cantidad_produccion,
      f.tiempo_produccion_minutos,
      f.imagen_url as fruta_imagen,
      CASE 
        WHEN gn.numero_granja <= $4 THEN true
        ELSE false
      END as desbloqueada,
      CASE 
        WHEN gn.numero_granja <= $4 AND (gn.lista_en IS NULL OR gn.lista_en <= NOW()) THEN true
        ELSE false
      END as puede_recolectar,
      CASE 
        WHEN gn.numero_granja <= $4 AND gn.lista_en IS NOT NULL AND gn.lista_en > NOW() 
        THEN EXTRACT(EPOCH FROM (gn.lista_en - NOW()))
        ELSE 0
      END as tiempo_restante
    FROM granjas_numeradas gn
    CROSS JOIN frutas f
    WHERE gn.granja_id = $2 AND f.id = $3
  `, [jugadorId, granja_id, FRUTA_ID, slots_disponibles]);
  
  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
}

// ==================== RECOLECTAR ====================


async function recolectarFrutas(granja_id) {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return { error: 'Jugador not found' };
  }

  // 1. Verificar que la granja está desbloqueada y obtener info
  const granjaCheck = await dbClient.query(`
    WITH granjas_numeradas AS (
      SELECT 
        g.id as granja_id,
        g.lista_en,
        ROW_NUMBER() OVER (ORDER BY g.id) as numero_granja
      FROM granjas g
      WHERE g.jugador_id = $1
    )
    SELECT 
      gn.granja_id,
      gn.lista_en,
      gn.numero_granja,
      f.cantidad_produccion,
      f.nombre as fruta_nombre,
      f.tiempo_produccion_minutos,
      gsc.slots_disponibles,
      CASE 
        WHEN gn.lista_en IS NULL THEN true
        WHEN gn.lista_en <= NOW() THEN true
        ELSE false
      END as puede_recolectar,
      CASE 
        WHEN gn.lista_en > NOW() 
        THEN EXTRACT(EPOCH FROM (gn.lista_en - NOW()))
        ELSE 0
      END as tiempo_restante_segundos
    FROM granjas_numeradas gn
    CROSS JOIN frutas f
    INNER JOIN jugadores j ON j.id = $1
    INNER JOIN granjas_slots_config gsc ON j.nivel = gsc.nivel_jugador
    WHERE gn.granja_id = $2 AND f.id = $3
  `, [jugadorId, granja_id, FRUTA_ID]);

  if (granjaCheck.rowCount === 0) {
    return { error: 'Granja not found' };
  }

  const { 
    numero_granja, 
    puede_recolectar, 
    tiempo_restante_segundos,
    cantidad_produccion, 
    fruta_nombre, 
    tiempo_produccion_minutos, 
    slots_disponibles 
  } = granjaCheck.rows[0];

  // 2. Verificar que está desbloqueada
  if (numero_granja > slots_disponibles) {
    return { 
      error: 'Granja not unlocked yet',
      mensaje: `Esta granja se desbloquea con más slots de granja`
    };
  }

  // 3. Verificar que puede recolectar (calculado en la DB)
  if (!puede_recolectar) {
    const minutosRestantes = Math.ceil(tiempo_restante_segundos / 60);
    return { 
      error: 'Frutas not ready yet',
      mensaje: `Aún no puedes recolectar. Tiempo restante: ${minutosRestantes} minutos`,
      tiempo_restante: Math.ceil(tiempo_restante_segundos)
    };
  }

  // 4. Agregar frutas al inventario
  await dbClient.query(`
    INSERT INTO jugador_frutas (jugador_id, fruta_id, cantidad)
    VALUES ($1, $2, $3)
    ON CONFLICT (jugador_id, fruta_id)
    DO UPDATE SET cantidad = jugador_frutas.cantidad + $3
  `, [jugadorId, FRUTA_ID, cantidad_produccion]);

  // 5. Resetear timer (próxima recolección)
  await dbClient.query(`
    UPDATE granjas
    SET 
      fruta_id = $1,
      estado = 'plantada',
      plantada_en = NOW(),
      lista_en = NOW() + INTERVAL '${tiempo_produccion_minutos} minutes'
    WHERE id = $2
  `, [FRUTA_ID, granja_id]);

  // 6. Dar 20 XP al jugador por recolectar
  await dbClient.query(`
    UPDATE jugadores
    SET xp = xp + 20
    WHERE id = $1
  `, [jugadorId]);

  // 7. Obtener cantidad total de frutas
  const inventario = await dbClient.query(`
    SELECT cantidad FROM jugador_frutas
    WHERE jugador_id = $1 AND fruta_id = $2
  `, [jugadorId, FRUTA_ID]);

  return {
    recolectado: true,
    frutas_recolectadas: cantidad_produccion,
    fruta_nombre: fruta_nombre,
    fruta_id: FRUTA_ID,
    total_frutas: inventario.rows[0].cantidad,
    proxima_recoleccion_minutos: tiempo_produccion_minutos,
    xp_ganada: 20,
    mensaje: `¡Recolectaste ${cantidad_produccion} ${fruta_nombre}!`
  };
}



// ==================== CREAR 6 GRANJAS AL INICIO ====================

async function crearGranjasIniciales() {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return { error: 'Jugador not found' };
  }

  // 1. Verificar si ya existen granjas
  const granjasActuales = await dbClient.query(`
    SELECT COUNT(*) as total FROM granjas WHERE jugador_id = $1
  `, [jugadorId]);

  const totalActual = parseInt(granjasActuales.rows[0].total);

  if (totalActual >= 6) {
    return { mensaje: 'Granjas already exist', total: totalActual };
  }

  // 2. Crear las 6 granjas (todas empiezan listas para recolectar)
  const granjasACrear = 6 - totalActual;

  for (let i = 0; i < granjasACrear; i++) {
    await dbClient.query(`
      INSERT INTO granjas (jugador_id, fruta_id, estado, plantada_en, lista_en)
      VALUES ($1, $2, 'lista', NOW(), NOW())
    `, [jugadorId, FRUTA_ID]);
  }

  return {
    mensaje: 'Granjas created successfully',
    granjas_creadas: granjasACrear,
    total: 6
  };
}

module.exports = {
  getJugadorGranjas,
  getGranjaDetalle,
  recolectarFrutas,
  crearGranjasIniciales
};