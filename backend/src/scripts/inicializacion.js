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

const FRUTA_ID = 1; 


async function inicializarJuego(pokemon_starter_id) {
  try {
    const jugadorExistente = await dbClient.query(`
      SELECT id FROM jugadores LIMIT 1
    `);

    if (jugadorExistente.rowCount > 0) {
      return { 
        error: 'El juego ya está inicializado',
        jugador_id: jugadorExistente.rows[0].id
      };
    }

    const pokemonCheck = await dbClient.query(`
      SELECT id, nombre FROM pokemons WHERE id = $1
    `, [pokemon_starter_id]);

    if (pokemonCheck.rowCount === 0) {
      return { error: 'Pokémon starter no encontrado' };
    }

    const starterNombre = pokemonCheck.rows[0].nombre;

    const jugador = await dbClient.query(`
      INSERT INTO jugadores (nivel, xp)
      VALUES (1, 0)
      RETURNING id, nivel, xp
    `);

    const jugador_id = jugador.rows[0].id;

    const pokemonStarter = await dbClient.query(`
      INSERT INTO jugador_pokemons (jugador_id, pokemon_id, nivel, xp, etapa_evolucion)
      VALUES ($1, $2, 1, 0, 1)
      RETURNING id
    `, [jugador_id, pokemon_starter_id]);

    const jugador_pokemon_id = pokemonStarter.rows[0].id;

    await dbClient.query(`
      INSERT INTO equipo_combate (jugador_id, jugador_pokemon_id, posicion)
      VALUES ($1, $2, 1)
    `, [jugador_id, jugador_pokemon_id]);

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

    const granjasCreadas = [];
    for (let i = 0; i < 6; i++) {
      const result = await dbClient.query(`
        INSERT INTO granjas (jugador_id, fruta_id, estado, plantada_en, lista_en)
          VALUES ($1, $2, 'lista', NOW(), NOW() - INTERVAL '3 hours')
        RETURNING id
      `, [jugador_id, FRUTA_ID]);

      granjasCreadas.push(result.rows[0].id);
    }

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


async function reiniciarJuego() {
  try {
    await dbClient.query(`DELETE FROM jugadores`);

    return {
      mensaje: 'Juego reiniciado. Todos los datos del jugador han sido eliminados.'
    };

  } catch (error) {
    console.error('Error en reiniciarJuego:', error);
    return { error: 'Error al reiniciar el juego', detalle: error.message };
  }
}


async function getStartersDisponibles() {
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