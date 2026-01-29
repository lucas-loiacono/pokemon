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

// ==================== GRANJAS DEL JUGADOR ====================

async function getJugadorGranjas() {
  // 1. Obtener nivel del jugador y slots disponibles
  const config = await dbClient.query(`
    SELECT 
      j.nivel,
      gsc.slots_disponibles
    FROM jugadores j
    INNER JOIN granjas_slots_config gsc ON j.nivel = gsc.nivel_jugador
    WHERE j.id = $1
  `, [JUGADOR_ID]);

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
  `, [JUGADOR_ID, FRUTA_ID, slots_disponibles]);
  
  return {
    nivel: nivel,
    slots_disponibles: slots_disponibles,
    granjas: result.rows
  };
}

async function getGranjaDetalle(granja_id) {
  // 1. Obtener slots disponibles
  const config = await dbClient.query(`
    SELECT 
      j.nivel,
      gsc.slots_disponibles
    FROM jugadores j
    INNER JOIN granjas_slots_config gsc ON j.nivel = gsc.nivel_jugador
    WHERE j.id = $1
  `, [JUGADOR_ID]);

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
  `, [JUGADOR_ID, granja_id, FRUTA_ID, slots_disponibles]);
  
  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
}

// ==================== RECOLECTAR ====================

async function recolectarFrutas(granja_id) {
  // 1. Verificar que la granja está desbloqueada
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
      gsc.slots_disponibles
    FROM granjas_numeradas gn
    CROSS JOIN frutas f
    INNER JOIN jugadores j ON j.id = $1
    INNER JOIN granjas_slots_config gsc ON j.nivel = gsc.nivel_jugador
    WHERE gn.granja_id = $2 AND f.id = $3
  `, [JUGADOR_ID, granja_id, FRUTA_ID]);

  if (granjaCheck.rowCount === 0) {
    return { error: 'Granja not found' };
  }

  const { numero_granja, lista_en, cantidad_produccion, fruta_nombre, tiempo_produccion_minutos, slots_disponibles } = granjaCheck.rows[0];

  // 2. Verificar que está desbloqueada
  if (numero_granja > slots_disponibles) {
    return { error: 'Granja not unlocked yet' };
  }

  // 3. Verificar que pasó el tiempo (o es primera vez)
  if (lista_en && new Date(lista_en) > new Date()) {
    return { 
      error: 'Frutas not ready yet',
      tiempo_restante: Math.ceil((new Date(lista_en) - new Date()) / 1000)
    };
  }

  // 4. Agregar frutas al inventario
  await dbClient.query(`
    INSERT INTO jugador_frutas (jugador_id, fruta_id, cantidad)
    VALUES ($1, $2, $3)
    ON CONFLICT (jugador_id, fruta_id)
    DO UPDATE SET cantidad = jugador_frutas.cantidad + $3
  `, [JUGADOR_ID, FRUTA_ID, cantidad_produccion]);

  // 5. Resetear timer (próxima recolección en 10 minutos)
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
  `, [JUGADOR_ID]);

  return {
    frutas_recolectadas: cantidad_produccion,
    fruta_nombre: fruta_nombre,
    fruta_id: FRUTA_ID,
    proxima_recoleccion: tiempo_produccion_minutos,
    xp_jugador: 20
  };
}

// ==================== CREAR 6 GRANJAS AL INICIO ====================

async function crearGranjasIniciales() {
  // 1. Verificar si ya existen granjas
  const granjasActuales = await dbClient.query(`
    SELECT COUNT(*) as total FROM granjas WHERE jugador_id = $1
  `, [JUGADOR_ID]);

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
    `, [JUGADOR_ID, FRUTA_ID]);
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