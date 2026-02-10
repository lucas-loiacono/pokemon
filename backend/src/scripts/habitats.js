const { Pool } = require('pg');

const dbClient = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pokemon',
  password: 'postgres',
  port: 5432,
});

async function getJugadorId() {
  const result = await dbClient.query('SELECT id FROM jugadores ORDER BY id DESC LIMIT 1');
  return result.rows[0]?.id || null;
}

// ==================== OBTENER TODOS LOS HÁBITATS ====================
async function getAllHabitats() {
  const result = await dbClient.query('SELECT * FROM habitats ORDER BY id');
  return result.rows;
}

// ==================== OBTENER HÁBITATS DEL JUGADOR ====================
async function getJugadorHabitats() {
  const jugadorId = await getJugadorId();
  if (!jugadorId) return [];

  // OJO: Usamos h.tipo como nombre y hacemos el COUNT para el (0/6)
  const result = await dbClient.query(`
    SELECT 
      h.id as habitat_id,
      h.tipo as nombre, 
      h.imagen_url,
      h.capacidad,
      COUNT(jhp.id) as cantidad_pokemons
    FROM jugador_habitats jh
    INNER JOIN habitats h ON jh.habitat_id = h.id
    LEFT JOIN jugador_habitat_pokemons jhp ON jh.id = jhp.jugador_habitat_id
    WHERE jh.jugador_id = $1
    GROUP BY h.id, h.tipo, h.imagen_url, h.capacidad
    ORDER BY h.id
  `, [jugadorId]);

  return result.rows;
}

// ==================== OBTENER POKÉMONS EN UN HÁBITAT (IMPORTANTE) ====================
async function getHabitatPokemons(habitatId) {
  const jugadorId = await getJugadorId();
  if (!jugadorId) return [];

  // AQUÍ ESTABA EL PROBLEMA: Faltaba pedir p.imagen_url
  const result = await dbClient.query(`
    SELECT 
      jp.id,
      jp.nivel,
      jp.apodo,
      p.nombre,
      p.imagen_url   -- <--- ¡ESTA LÍNEA ES LA QUE HACE QUE SE VEA LA FOTO!
    FROM jugador_habitat_pokemons jhp
    INNER JOIN jugador_habitats jh ON jhp.jugador_habitat_id = jh.id
    INNER JOIN jugador_pokemons jp ON jhp.jugador_pokemon_id = jp.id
    INNER JOIN pokemons p ON jp.pokemon_id = p.id
    WHERE jh.jugador_id = $1 AND jh.habitat_id = $2
    ORDER BY jhp.id
    LIMIT 6
  `, [jugadorId, habitatId]);

  return result.rows;
}

// ==================== ASIGNAR POKÉMON ====================
async function asignarPokemonHabitat(habitatId, jugadorPokemonId) {
  const jugadorId = await getJugadorId();
  if (!jugadorId) return { error: 'Jugador no encontrado' };

  try {
    // 1. Verificar hábitat y obtener capacidad
    const habitatCheck = await dbClient.query(`
      SELECT jh.id, h.capacidad 
      FROM jugador_habitats jh
      INNER JOIN habitats h ON jh.habitat_id = h.id
      WHERE jh.jugador_id = $1 AND jh.habitat_id = $2
    `, [jugadorId, habitatId]);

    if (habitatCheck.rowCount === 0) return { error: 'Hábitat no desbloqueado' };
    
    const jugadorHabitatId = habitatCheck.rows[0].id;
    const capacidad = habitatCheck.rows[0].capacidad || 6;

    // 2. Verificar espacio
    const conteo = await dbClient.query(`
      SELECT COUNT(*) as total FROM jugador_habitat_pokemons 
      WHERE jugador_habitat_id = $1
    `, [jugadorHabitatId]);

    if (parseInt(conteo.rows[0].total) >= capacidad) return { error: 'Hábitat lleno' };

    // 3. Verificar propiedad y duplicados
    const pokeCheck = await dbClient.query('SELECT id FROM jugador_pokemons WHERE id = $1 AND jugador_id = $2', [jugadorPokemonId, jugadorId]);
    if (pokeCheck.rowCount === 0) return { error: 'No es tu Pokémon' };

    const dupCheck = await dbClient.query('SELECT id FROM jugador_habitat_pokemons WHERE jugador_pokemon_id = $1', [jugadorPokemonId]);
    if (dupCheck.rowCount > 0) return { error: 'Ya está en un hábitat' };

    // 4. Insertar
    await dbClient.query(`
      INSERT INTO jugador_habitat_pokemons (jugador_habitat_id, jugador_pokemon_id)
      VALUES ($1, $2)
    `, [jugadorHabitatId, jugadorPokemonId]);

    return { mensaje: 'Asignado correctamente' };

  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
}

// ==================== QUITAR POKÉMON ====================
async function quitarPokemonHabitat(habitatId, jugadorPokemonId) {
  // (Lógica pendiente si la necesitas luego)
  return { mensaje: 'Pendiente' };
}

module.exports = {
  getAllHabitats,
  getJugadorHabitats,
  getHabitatPokemons,
  asignarPokemonHabitat,
  quitarPokemonHabitat
};