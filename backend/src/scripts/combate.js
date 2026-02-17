const { Pool } = require('pg');
const { verificarSubidaNivelPokemon, verificarSubidaNivelJugador } = require('./niveles');

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

async function getJugadorId() {
  const result = await dbClient.query('SELECT id FROM jugadores ORDER BY id DESC LIMIT 1');
  return result.rows[0]?.id || null;
}


async function getAllEntrenadores() {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return { error: 'Jugador not found' };
  }

  
  const maxNivelDesbloqueado = await dbClient.query(`
    SELECT COALESCE(MAX(e.nivel), 0) + 1 as siguiente_nivel
    FROM batallas b
    INNER JOIN entrenadores e ON b.entrenador_id = e.id
    WHERE b.jugador_id = $1 
      AND b.resultado = 'victoria' 
      AND e.descripcion != 'Entrenador Personalizado'
  `, [jugadorId]);

  const nivelDesbloqueado = maxNivelDesbloqueado.rows[0].siguiente_nivel;

  
  const result = await dbClient.query(`
    SELECT 
      e.id,
      e.nombre,
      e.nivel,
      e.descripcion,
      e.imagen_url,
      COUNT(ep.id) as total_pokemons,
      CASE 
        WHEN e.descripcion = 'Entrenador Personalizado' THEN true
        WHEN e.nivel <= $2 THEN true
        ELSE false
      END as desbloqueado,
      (
        SELECT COUNT(*) 
        FROM batallas b 
        WHERE b.entrenador_id = e.id AND b.jugador_id = $1 AND b.resultado = 'victoria'
      ) as victorias
    FROM entrenadores e
    LEFT JOIN entrenador_pokemons ep ON e.id = ep.entrenador_id
    GROUP BY e.id
    ORDER BY 
      CASE WHEN e.descripcion = 'Entrenador Personalizado' THEN 1 ELSE 0 END, -- Historia primero
      e.nivel, 
      e.id
  `, [jugadorId, nivelDesbloqueado]);

  return result.rows;
}

async function getOneEntrenador(id) {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return { error: 'Jugador not found' };
  }

  const maxNivelDesbloqueado = await dbClient.query(`
    SELECT COALESCE(MAX(e.nivel), 0) + 1 as siguiente_nivel
    FROM batallas b
    INNER JOIN entrenadores e ON b.entrenador_id = e.id
    WHERE b.jugador_id = $1 AND b.resultado = 'victoria'
  `, [jugadorId]);

  const nivelDesbloqueado = maxNivelDesbloqueado.rows[0].siguiente_nivel;

  const result = await dbClient.query(`
    SELECT 
      e.id,
      e.nombre,
      e.nivel,
      e.descripcion,
      e.imagen_url,
      CASE 
        WHEN e.nivel <= $2 THEN true
        ELSE false
      END as desbloqueado
    FROM entrenadores e
    WHERE e.id = $1
  `, [id, nivelDesbloqueado]);

  if (result.rowCount === 0) {
    return null;
  }

  const pokemons = await dbClient.query(`
    SELECT 
      ep.posicion,
      p.id as pokemon_id,
      p.pokedex_id,
      p.nombre,
      p.imagen_url,
      ep.nivel,
      ARRAY_AGG(t.nombre ORDER BY pt.orden) as tipos
    FROM entrenador_pokemons ep
    INNER JOIN pokemons p ON ep.pokemon_id = p.id
    INNER JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
    INNER JOIN tipos t ON pt.tipo_id = t.id
    WHERE ep.entrenador_id = $1
    GROUP BY ep.posicion, p.id, p.pokedex_id, p.nombre, p.imagen_url, ep.nivel
    ORDER BY ep.posicion
  `, [id]);

  return {
    ...result.rows[0],
    pokemons: pokemons.rows
  };
}



function calcularMultiplicador(tiposAtacante, tiposDefensor, efectividades) {
  let sumaEfectividad = 0; 

  for (const tipoAtacante of tiposAtacante) {
    for (const tipoDefensor of tiposDefensor) {
      const efectividad = efectividades.find(
        e => e.tipo_atacante === tipoAtacante && e.tipo_defensor === tipoDefensor
      );

      if (efectividad) {
        sumaEfectividad += parseFloat(efectividad.multiplicador);
      } else {
        sumaEfectividad += 1.0;
      }
    }
  }

  return sumaEfectividad;
}

async function iniciarCombate(entrenador_id) {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) return { error: 'Jugador not found' };

  
  const entrenadorCheck = await dbClient.query(`
    SELECT nivel, nombre, descripcion FROM entrenadores WHERE id = $1
  `, [entrenador_id]);

  if (entrenadorCheck.rowCount === 0) return { error: 'Entrenador no encontrado' };

  const { nivel: nivelEntrenador, nombre: nombreEntrenador, descripcion } = entrenadorCheck.rows[0];

  if (descripcion !== 'Entrenador Personalizado') {
      const maxNivelDesbloqueado = await dbClient.query(`
        SELECT COALESCE(MAX(e.nivel), 0) + 1 as siguiente_nivel
        FROM batallas b
        INNER JOIN entrenadores e ON b.entrenador_id = e.id
        WHERE b.jugador_id = $1 AND b.resultado = 'victoria' AND e.descripcion != 'Entrenador Personalizado'
      `, [jugadorId]);

      const nivelDesbloqueado = maxNivelDesbloqueado.rows[0].siguiente_nivel;

      if (nivelEntrenador > nivelDesbloqueado) {
        return { 
          error: 'Entrenador no desbloqueado',
          mensaje: `Debes derrotar al nivel ${nivelDesbloqueado - 1} de la historia primero.`
        };
      }
  }

  const equipoJugador = await dbClient.query(`
    SELECT 
      ec.posicion,
      jp.id as jugador_pokemon_id,
      jp.nivel,
      p.id as pokemon_id,
      p.nombre as pokemon_nombre,
      jp.apodo,
      ARRAY_AGG(t.nombre ORDER BY pt.orden) as tipos
    FROM equipo_combate ec
    INNER JOIN jugador_pokemons jp ON ec.jugador_pokemon_id = jp.id
    INNER JOIN pokemons p ON jp.pokemon_id = p.id
    INNER JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
    INNER JOIN tipos t ON pt.tipo_id = t.id
    WHERE ec.jugador_id = $1
    GROUP BY ec.posicion, jp.id, jp.nivel, p.id, p.nombre, jp.apodo
    ORDER BY ec.posicion
  `, [jugadorId]);

  if (equipoJugador.rowCount === 0) {
    return { error: 'No hay Pokémon en el equipo', mensaje: 'Debes tener al menos 1 Pokémon' };
  }

  const equipoEntrenador = await dbClient.query(`
    SELECT 
      ep.posicion,
      ep.nivel,
      p.id as pokemon_id,
      p.nombre as pokemon_nombre,
      ARRAY_AGG(t.nombre ORDER BY pt.orden) as tipos
    FROM entrenador_pokemons ep
    INNER JOIN pokemons p ON ep.pokemon_id = p.id
    INNER JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
    INNER JOIN tipos t ON pt.tipo_id = t.id
    WHERE ep.entrenador_id = $1
    GROUP BY ep.posicion, ep.nivel, p.id, p.nombre
    ORDER BY ep.posicion
  `, [entrenador_id]);

  if (equipoEntrenador.rowCount === 0) return { error: 'Entrenador sin Pokémon' };
  const efectividades = await dbClient.query('SELECT tipo_atacante, tipo_defensor, multiplicador FROM tipo_efectividad');
  return require('./combate_logica_core_si_tuvieras_uno').resolverCombate(jugadorId, entrenador_id, equipoJugador, equipoEntrenador, dbClient, efectividades); 
}


async function getHistorialBatallas() {
  const jugadorId = await getJugadorId();
  
  if (!jugadorId) {
    return { error: 'Jugador not found' };
  }

  const result = await dbClient.query(`
    SELECT 
      b.id,
      b.resultado,
      b.victorias_jugador,
      b.victorias_enemigo,
      b.xp_ganada,
      e.nombre as entrenador_nombre,
      e.nivel as entrenador_nivel,
      e.imagen_url as entrenador_imagen
    FROM batallas b
    INNER JOIN entrenadores e ON b.entrenador_id = e.id
    WHERE b.jugador_id = $1
    ORDER BY b.id DESC
  `, [jugadorId]);

  return result.rows;
}

async function createEntrenador(nombre, nivel, imagen_url) {
  try {
    const res = await dbClient.query(
      'INSERT INTO entrenadores (nombre, nivel, descripcion, imagen_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, nivel, 'Entrenador Personalizado', imagen_url]
    );
    return res.rows[0];
  } catch (e) {
    return { error: e.message };
  }
}

async function deleteEntrenador(id) {
  try {
    await dbClient.query('DELETE FROM entrenadores WHERE id = $1', [id]);
    return { message: 'Entrenador eliminado' };
  } catch (e) {
    return { error: e.message };
  }
}

async function updateEntrenador(id, nombre, imagen_url, nivel) {
  try {
    const res = await dbClient.query(
      'UPDATE entrenadores SET nombre = $1, imagen_url = $2, nivel = $3 WHERE id = $4 RETURNING *',
      [nombre, imagen_url, nivel, id]
    );
    return res.rows[0];
  } catch (e) {
    return { error: e.message };
  }
}

async function setEntrenadorTeam(entrenadorId, pokemons) {
  try {
    await dbClient.query('BEGIN');
    
    await dbClient.query('DELETE FROM entrenador_pokemons WHERE entrenador_id = $1', [entrenadorId]);

    for (const p of pokemons) {
      await dbClient.query(
        'INSERT INTO entrenador_pokemons (entrenador_id, pokemon_id, nivel, posicion) VALUES ($1, $2, $3, $4)',
        [entrenadorId, p.pokemon_id, p.nivel, p.posicion]
      );
    }

    await dbClient.query('COMMIT');
    return { message: 'Equipo actualizado' };
  } catch (e) {
    await dbClient.query('ROLLBACK');
    return { error: e.message };
  }
}

module.exports = {
  getAllEntrenadores,
  getOneEntrenador,
  iniciarCombate,
  getHistorialBatallas,
  createEntrenador,
  deleteEntrenador,
  updateEntrenador,
  setEntrenadorTeam
};

