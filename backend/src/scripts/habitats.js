const { Pool } = require('pg');

const dbClient = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_LXJPI0oZf5Qv@ep-solitary-river-ai21ihv6-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

//const dbClient = new Pool({
//  user: 'postgres',
//  host: 'localhost',
//  database: 'pokemon',
//  password: 'postgres',
//  port: 5432,
//});

// Helper: Obtener ID del jugador
async function getJugadorId() {
  const result = await dbClient.query('SELECT id FROM jugadores ORDER BY id DESC LIMIT 1');
  return result.rows[0]?.id || null;
}

// 1. OBTENER TODOS LOS HÁBITATS (Para el menú)
async function getAllHabitats() {
  const result = await dbClient.query('SELECT * FROM habitats ORDER BY id');
  return result.rows;
}

// 2. OBTENER HÁBITATS DEL JUGADOR (Con conteo 0/6)
async function getJugadorHabitats() {
  const jugadorId = await getJugadorId();
  if (!jugadorId) return [];

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

// 3. OBTENER POKÉMONS DENTRO DE UN HÁBITAT
async function getHabitatPokemons(habitatId) {
  const jugadorId = await getJugadorId();
  if (!jugadorId) return [];

  const result = await dbClient.query(`
    SELECT 
      jp.id,
      jp.nivel,
      jp.apodo,
      p.nombre,
      p.imagen_url
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

// 4. NUEVO: OBTENER TIPOS PERMITIDOS (Para el frontend y validación)
async function getHabitatTipos(habitatId) {
  const result = await dbClient.query(`
    SELECT tipo_nombre 
    FROM habitat_tipos_aceptados 
    WHERE habitat_id = $1
  `, [habitatId]);
  
  // Devuelve array simple: ['Normal', 'Eléctrico', ...]
  return result.rows.map(row => row.tipo_nombre);
}

// 5. ASIGNAR POKÉMON (¡AHORA CON VALIDACIÓN DE TIPO!)
async function asignarPokemonHabitat(habitatId, jugadorPokemonId) {
  const jugadorId = await getJugadorId();
  if (!jugadorId) return { error: 'Jugador no encontrado' };

  try {
    // A. Verificar hábitat y obtener capacidad
    const habitatCheck = await dbClient.query(`
      SELECT jh.id, h.capacidad 
      FROM jugador_habitats jh
      INNER JOIN habitats h ON jh.habitat_id = h.id
      WHERE jh.jugador_id = $1 AND jh.habitat_id = $2
    `, [jugadorId, habitatId]);

    if (habitatCheck.rowCount === 0) return { error: 'Hábitat no desbloqueado' };
    
    const jugadorHabitatId = habitatCheck.rows[0].id;
    const capacidad = habitatCheck.rows[0].capacidad || 6;

    // B. Verificar espacio
    const conteo = await dbClient.query(`
      SELECT COUNT(*) as total FROM jugador_habitat_pokemons 
      WHERE jugador_habitat_id = $1
    `, [jugadorHabitatId]);

    if (parseInt(conteo.rows[0].total) >= capacidad) return { error: 'Hábitat lleno' };

    // C. Verificar propiedad y duplicados
    const pokeCheck = await dbClient.query('SELECT id FROM jugador_pokemons WHERE id = $1 AND jugador_id = $2', [jugadorPokemonId, jugadorId]);
    if (pokeCheck.rowCount === 0) return { error: 'No es tu Pokémon' };

    const dupCheck = await dbClient.query('SELECT id FROM jugador_habitat_pokemons WHERE jugador_pokemon_id = $1', [jugadorPokemonId]);
    if (dupCheck.rowCount > 0) return { error: 'Ya está en un hábitat' };

    // D. VALIDACIÓN DE TIPO (NUEVO)
    // 1. Obtenemos los tipos del Pokémon
    const pokemonTipos = await dbClient.query(`
      SELECT t.nombre 
      FROM jugador_pokemons jp
      INNER JOIN pokemons p ON jp.pokemon_id = p.id
      INNER JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
      INNER JOIN tipos t ON pt.tipo_id = t.id
      WHERE jp.id = $1
    `, [jugadorPokemonId]);
    
    const tiposDelPokemon = pokemonTipos.rows.map(t => t.nombre);

    // 2. Obtenemos los tipos permitidos en el hábitat
    const tiposPermitidos = await getHabitatTipos(habitatId);

    // 3. Verificamos si al menos uno coincide
    const esCompatible = tiposDelPokemon.some(tipo => tiposPermitidos.includes(tipo));

    if (!esCompatible) {
      return { 
        error: `Tipo incompatible. Este hábitat solo acepta: ${tiposPermitidos.join(', ')}` 
      };
    }

    // E. Insertar
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


// 6. QUITAR POKÉMON DEL HÁBITAT
async function quitarPokemonHabitat(habitatId, jugadorPokemonId) {
  try {
    // Borramos la asignación en la tabla intermedia
    const result = await dbClient.query(`
      DELETE FROM jugador_habitat_pokemons 
      WHERE jugador_pokemon_id = $1
    `, [jugadorPokemonId]);
    
    if (result.rowCount === 0) {
        return { error: 'El Pokémon no estaba asignado a este hábitat' };
    }
    
    return { mensaje: 'Pokemon retirado correctamente' };
  } catch (error) {
    console.error(error);
    return { error: 'Error al retirar pokemon' };
  }
}

module.exports = {
  getAllHabitats,
  getJugadorHabitats,
  getHabitatPokemons,
  getHabitatTipos,        // <--- No olvides esto para que funcione la API
  asignarPokemonHabitat,
  quitarPokemonHabitat
};