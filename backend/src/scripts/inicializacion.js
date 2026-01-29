const { Pool } = require('pg');

const dbClient = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pokemon',
  password: 'postgres',
  port: 5432,
});

const FRUTA_ID = 1; // Bayas verdes

// ==================== INICIALIZAR JUEGO ====================

async function inicializarJuego(pokemon_starter_id) {
  try {
    // 1. Verificar si ya existe un jugador
    const jugadorExistente = await dbClient.query(`
      SELECT id FROM jugadores LIMIT 1
    `);

    if (jugadorExistente.rowCount > 0) {
      return { 
        error: 'El juego ya está inicializado',
        jugador_id: jugadorExistente.rows[0].id
      };
    }

    // 2. Verificar que el Pokémon starter existe
    const pokemonCheck = await dbClient.query(`
      SELECT id, nombre FROM pokemons WHERE id = $1
    `, [pokemon_starter_id]);

    if (pokemonCheck.rowCount === 0) {
      return { error: 'Pokémon starter no encontrado' };
    }

    const starterNombre = pokemonCheck.rows[0].nombre;

    // 3. Crear jugador (nivel 1, 0 XP)
    const jugador = await dbClient.query(`
      INSERT INTO jugadores (nivel, xp)
      VALUES (1, 0)
      RETURNING id, nivel, xp
    `);

    const jugador_id = jugador.rows[0].id;

    // 4. Dar Pokémon starter (nivel 1, 0 XP, etapa 1)
    const pokemonStarter = await dbClient.query(`
      INSERT INTO jugador_pokemons (jugador_id, pokemon_id, nivel, xp, etapa_evolucion)
      VALUES ($1, $2, 1, 0, 1)
      RETURNING id
    `, [jugador_id, pokemon_starter_id]);

    const jugador_pokemon_id = pokemonStarter.rows[0].id;

    // 5. Agregar el starter al equipo en posición 1
    await dbClient.query(`
      INSERT INTO equipo_combate (jugador_id, jugador_pokemon_id, posicion)
      VALUES ($1, $2, 1)
    `, [jugador_id, jugador_pokemon_id]);

    // 6. Crear los 6 hábitats del jugador
    const habitatsCreados = [];
    const habitats = await dbClient.query(`SELECT id, tipo FROM habitats ORDER BY id`);

    for (const habitat of habitats.rows) {
      const result = await dbClient.query(`
        INSERT INTO jugador_habitats (jugador_id, habitat_id)
        VALUES ($1, $2)
        RETURNING id
      `, [jugador_id, habitat.id]);

      habitatsCreados.push({
        jugador_habitat_id: result.rows[0].id,
        habitat_tipo: habitat.tipo
      });
    }

    // 7. Crear las 6 granjas (todas listas para recolectar)
    const granjasCreadas = [];
    for (let i = 0; i < 6; i++) {
      const result = await dbClient.query(`
        INSERT INTO granjas (jugador_id, fruta_id, estado, plantada_en, lista_en)
        VALUES ($1, $2, 'lista', NOW(), NOW())
        RETURNING id
      `, [jugador_id, FRUTA_ID]);

      granjasCreadas.push(result.rows[0].id);
    }

    // 8. Dar 10 frutas iniciales
    await dbClient.query(`
      INSERT INTO jugador_frutas (jugador_id, fruta_id, cantidad)
      VALUES ($1, $2, 10)
    `, [jugador_id, FRUTA_ID]);

    return {
      mensaje: 'Juego inicializado exitosamente',
      jugador: {
        id: jugador_id,
        nivel: 1,
        xp: 0
      },
      pokemon_starter: {
        jugador_pokemon_id: jugador_pokemon_id,
        pokemon_id: pokemon_starter_id,
        nombre: starterNombre,
        nivel: 1,
        en_equipo: true
      },
      habitats_creados: habitatsCreados.length,
      granjas_creadas: granjasCreadas.length,
      frutas_iniciales: 10
    };

  } catch (error) {
    console.error('Error en inicializarJuego:', error);
    return { error: 'Error al inicializar el juego', detalle: error.message };
  }
}

// ==================== REINICIAR JUEGO (BORRAR TODO) ====================

async function reiniciarJuego() {
  try {
    // CUIDADO: Esto borra TODOS los datos del jugador
    await dbClient.query(`DELETE FROM jugadores`);

    return {
      mensaje: 'Juego reiniciado. Todos los datos del jugador han sido eliminados.'
    };

  } catch (error) {
    console.error('Error en reiniciarJuego:', error);
    return { error: 'Error al reiniciar el juego', detalle: error.message };
  }
}

// ==================== OBTENER POKÉMON STARTERS DISPONIBLES ====================

async function getStartersDisponibles() {
  // Puedes personalizar esta lista según los Pokémon que tengas
  // Por ahora, devolvemos los clásicos: Bulbasaur, Charmander, Squirtle
  const starters = await dbClient.query(`
    SELECT 
      p.id,
      p.pokedex_id,
      p.nombre,
      p.imagen_url,
      ARRAY_AGG(t.nombre ORDER BY pt.orden) as tipos
    FROM pokemons p
    INNER JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
    INNER JOIN tipos t ON pt.tipo_id = t.id
    WHERE p.pokedex_id IN (1, 4, 7)  -- Bulbasaur, Charmander, Squirtle
    GROUP BY p.id, p.pokedex_id, p.nombre, p.imagen_url
    ORDER BY p.pokedex_id
  `);

  return starters.rows;
}

module.exports = {
  inicializarJuego,
  reiniciarJuego,
  getStartersDisponibles
};