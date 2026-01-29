const { Pool } = require('pg');

const dbClient = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pokemon',
  password: 'postgres',
  port: 5432,
});

const JUGADOR_ID = 1;

// ==================== HÁBITATS GLOBALES ====================

async function getAllHabitats() {
  const result = await dbClient.query(`
    SELECT 
      id,
      tipo,
      capacidad,
      imagen_url
    FROM habitats
    ORDER BY id
  `);
  return result.rows;
}

// ==================== HÁBITATS DEL JUGADOR ====================

async function getJugadorHabitats() {
  const result = await dbClient.query(`
    SELECT 
      jh.id as jugador_habitat_id,
      h.id as habitat_id,
      h.tipo,
      h.capacidad,
      h.imagen_url,
      COUNT(jhp.jugador_pokemon_id) as pokemons_asignados
    FROM jugador_habitats jh
    INNER JOIN habitats h ON jh.habitat_id = h.id
    LEFT JOIN jugador_habitat_pokemons jhp ON jh.id = jhp.jugador_habitat_id
    WHERE jh.jugador_id = $1
    GROUP BY jh.id, h.id, h.tipo, h.capacidad, h.imagen_url
    ORDER BY jh.id
  `, [JUGADOR_ID]);
  
  return result.rows;
}

async function getHabitatPokemons(jugador_habitat_id) {
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
    FROM jugador_habitat_pokemons jhp
    INNER JOIN jugador_pokemons jp ON jhp.jugador_pokemon_id = jp.id
    INNER JOIN pokemons p ON jp.pokemon_id = p.id
    INNER JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
    INNER JOIN tipos t ON pt.tipo_id = t.id
    WHERE jhp.jugador_habitat_id = $1
    GROUP BY jp.id, p.id, p.pokedex_id, p.nombre, p.imagen_url, jp.nivel, jp.xp, jp.combates_ganados, jp.etapa_evolucion, jp.apodo
    ORDER BY jp.id
  `, [jugador_habitat_id]);
  
  return result.rows;
}

async function asignarPokemonHabitat(jugador_habitat_id, jugador_pokemon_id) {
  // 1. Verificar que el Pokémon existe y pertenece al jugador
  const pokemonCheck = await dbClient.query(`
    SELECT 
      jp.id,
      p.nombre,
      ARRAY_AGG(t.nombre) as tipos
    FROM jugador_pokemons jp
    INNER JOIN pokemons p ON jp.pokemon_id = p.id
    INNER JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
    INNER JOIN tipos t ON pt.tipo_id = t.id
    WHERE jp.id = $1 AND jp.jugador_id = $2
    GROUP BY jp.id, p.nombre
  `, [jugador_pokemon_id, JUGADOR_ID]);

  if (pokemonCheck.rowCount === 0) {
    return { error: 'Pokemon not found' };
  }

  const { tipos: tiposPokemon, nombre: pokemonNombre } = pokemonCheck.rows[0];

  // 2. Verificar que el hábitat existe y obtener tipos compatibles
  const habitatCheck = await dbClient.query(`
    SELECT 
      jh.id,
      h.tipo as habitat_tipo,
      ARRAY_AGG(hat.tipo_nombre) as tipos_compatibles
    FROM jugador_habitats jh
    INNER JOIN habitats h ON jh.habitat_id = h.id
    INNER JOIN habitat_tipos_aceptados hat ON h.id = hat.habitat_id
    WHERE jh.id = $1 AND jh.jugador_id = $2
    GROUP BY jh.id, h.tipo
  `, [jugador_habitat_id, JUGADOR_ID]);

  if (habitatCheck.rowCount === 0) {
    return { error: 'Habitat not found' };
  }

  const { habitat_tipo, tipos_compatibles } = habitatCheck.rows[0];

  // 3. Verificar compatibilidad de tipos
  const esCompatible = tiposPokemon.some(tipo => tipos_compatibles.includes(tipo));

  if (!esCompatible) {
    return { 
      error: 'Pokémon incompatible con el hábitat',
      pokemon: pokemonNombre,
      pokemon_tipos: tiposPokemon,
      habitat: habitat_tipo,
      tipos_compatibles: tipos_compatibles,
      mensaje: `${pokemonNombre} (${tiposPokemon.join('/')}) no es compatible con ${habitat_tipo}`
    };
  }

  // 4. Verificar que hay espacio (máximo 6 Pokémon)
  const countCheck = await dbClient.query(`
    SELECT COUNT(*) as total
    FROM jugador_habitat_pokemons
    WHERE jugador_habitat_id = $1
  `, [jugador_habitat_id]);


  if (parseInt(countCheck.rows[0].total) >= 6) {
    return { error: 'Habitat is full' };
  }

  // Verificar que el Pokémon no está ya asignado a otro hábitat
  const assignedCheck = await dbClient.query(`
    SELECT id FROM jugador_habitat_pokemons
    WHERE jugador_pokemon_id = $1
  `, [jugador_pokemon_id]);

  if (assignedCheck.rowCount > 0) {
    return { error: 'Pokemon already assigned to a habitat' };
  }

  // Asignar Pokémon al hábitat
  const result = await dbClient.query(`
    INSERT INTO jugador_habitat_pokemons (jugador_habitat_id, jugador_pokemon_id)
    VALUES ($1, $2)
    RETURNING *
  `, [jugador_habitat_id, jugador_pokemon_id]);

  return result.rows[0];
}

async function quitarPokemonHabitat(jugador_habitat_id, jugador_pokemon_id) {
  const result = await dbClient.query(`
    DELETE FROM jugador_habitat_pokemons
    WHERE jugador_habitat_id = $1 AND jugador_pokemon_id = $2
    RETURNING *
  `, [jugador_habitat_id, jugador_pokemon_id]);

  if (result.rowCount === 0) {
    return undefined;
  }
  return result.rows[0];
}

module.exports = {
  getAllHabitats,
  getJugadorHabitats,
  getHabitatPokemons,
  asignarPokemonHabitat,
  quitarPokemonHabitat
};