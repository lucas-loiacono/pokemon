const { Pool } = require('pg');
const { verificarSubidaNivelPokemon, verificarSubidaNivelJugador } = require('./niveles');

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
  return sumaEfectividad || 1;
}


async function getAllEntrenadores() {
  const jugadorId = await getJugadorId();
  if (!jugadorId) return { error: 'Jugador not found' };

 
  const maxNivelDesbloqueado = await dbClient.query(`
    SELECT COALESCE(MAX(e.nivel), 0) + 1 as siguiente_nivel
    FROM batallas b
    INNER JOIN entrenadores e ON b.entrenador_id = e.id
    WHERE b.jugador_id = $1 AND b.resultado = 'victoria' AND e.descripcion != 'Entrenador Personalizado'
  `, [jugadorId]);

  const nivelDesbloqueado = maxNivelDesbloqueado.rows[0].siguiente_nivel;

  const result = await dbClient.query(`
    SELECT 
      e.id, e.nombre, e.nivel, e.descripcion, e.imagen_url,
      COUNT(ep.id) as total_pokemons,
      CASE 
        WHEN e.descripcion = 'Entrenador Personalizado' THEN true
        WHEN e.nivel <= $2 THEN true
        ELSE false
      END as desbloqueado,
      (SELECT COUNT(*) FROM batallas b WHERE b.entrenador_id = e.id AND b.jugador_id = $1 AND b.resultado = 'victoria') as victorias
    FROM entrenadores e
    LEFT JOIN entrenador_pokemons ep ON e.id = ep.entrenador_id
    GROUP BY e.id
    ORDER BY CASE WHEN e.descripcion = 'Entrenador Personalizado' THEN 1 ELSE 0 END, e.nivel, e.id
  `, [jugadorId, nivelDesbloqueado]);

  return result.rows;
}

async function getOneEntrenador(id) {
  const jugadorId = await getJugadorId();
  if (!jugadorId) return { error: 'Jugador not found' };

  const result = await dbClient.query(`SELECT * FROM entrenadores WHERE id = $1`, [id]);
  if (result.rowCount === 0) return null;

  const pokemons = await dbClient.query(`
    SELECT ep.posicion, p.id as pokemon_id, p.pokedex_id, p.nombre, p.imagen_url, ep.nivel, ARRAY_AGG(t.nombre ORDER BY pt.orden) as tipos
    FROM entrenador_pokemons ep
    INNER JOIN pokemons p ON ep.pokemon_id = p.id
    INNER JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
    INNER JOIN tipos t ON pt.tipo_id = t.id
    WHERE ep.entrenador_id = $1
    GROUP BY ep.posicion, p.id, p.pokedex_id, p.nombre, p.imagen_url, ep.nivel
    ORDER BY ep.posicion
  `, [id]);

  return { ...result.rows[0], pokemons: pokemons.rows, desbloqueado: true };
}

async function iniciarCombate(entrenador_id) {
  const jugadorId = await getJugadorId();
  if (!jugadorId) return { error: 'Jugador not found' };

  
  const entrenadorCheck = await dbClient.query(`SELECT nivel, nombre, descripcion FROM entrenadores WHERE id = $1`, [entrenador_id]);
  if (entrenadorCheck.rowCount === 0) return { error: 'Entrenador no encontrado' };
  
  const { nivel: nivelEntrenador, nombre: nombreEntrenador, descripcion } = entrenadorCheck.rows[0];

  
  if (descripcion !== 'Entrenador Personalizado') {
      const maxNivel = await dbClient.query(`
        SELECT COALESCE(MAX(e.nivel), 0) + 1 as sig 
        FROM batallas b
        JOIN entrenadores e ON b.entrenador_id = e.id
        WHERE b.jugador_id = $1 AND b.resultado = 'victoria' AND e.descripcion != 'Entrenador Personalizado'
      `, [jugadorId]);
      
      const nivelPermitido = maxNivel.rows[0].sig;
      if (nivelEntrenador > nivelPermitido) {
        return { error: 'Bloqueado', mensaje: `Debes derrotar al nivel ${nivelPermitido - 1} de la historia primero.` };
      }
  }

  
  const equipoJugador = await dbClient.query(`
    SELECT ec.posicion, jp.id as jugador_pokemon_id, jp.nivel, p.nombre as pokemon_nombre, jp.apodo, ARRAY_AGG(t.nombre ORDER BY pt.orden) as tipos
    FROM equipo_combate ec
    JOIN jugador_pokemons jp ON ec.jugador_pokemon_id = jp.id
    JOIN pokemons p ON jp.pokemon_id = p.id
    JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
    JOIN tipos t ON pt.tipo_id = t.id
    WHERE ec.jugador_id = $1 GROUP BY ec.posicion, jp.id, jp.nivel, p.id, p.nombre, jp.apodo ORDER BY ec.posicion
  `, [jugadorId]);

  if (equipoJugador.rowCount === 0) return { error: 'Sin equipo', mensaje: 'Equipa al menos 1 Pokémon' };

  const equipoEntrenador = await dbClient.query(`
    SELECT ep.posicion, ep.nivel, p.nombre as pokemon_nombre, ARRAY_AGG(t.nombre ORDER BY pt.orden) as tipos
    FROM entrenador_pokemons ep
    JOIN pokemons p ON ep.pokemon_id = p.id
    JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
    JOIN tipos t ON pt.tipo_id = t.id
    WHERE ep.entrenador_id = $1 GROUP BY ep.posicion, ep.nivel, p.id, p.nombre ORDER BY ep.posicion
  `, [entrenador_id]);

  if (equipoEntrenador.rowCount === 0) return { error: 'Rival sin Pokémon' };

  
  const efectividades = await dbClient.query('SELECT * FROM tipo_efectividad');
  let victoriasJugador = 0;
  let victoriasEnemigo = 0;
  const resultadosCombates = [];

  
  for (let i = 1; i <= 5; i++) {
    const pJug = equipoJugador.rows.find(p => p.posicion === i);
    const pRiv = equipoEntrenador.rows.find(p => p.posicion === i);

    let ganadorRound = null;
    let detalle = {};

    
    if (!pJug && !pRiv) {
        resultadosCombates.push({ ganador: null, posicion: i });
        continue;
    }

    
    if (pJug && !pRiv) {
        victoriasJugador++;
        resultadosCombates.push({ ganador: 'jugador', posicion: i, ...pJug });
        continue;
    }

    
    if (!pJug && pRiv) {
        victoriasEnemigo++;
        resultadosCombates.push({ ganador: 'enemigo', posicion: i, ...pRiv });
        continue;
    }

    
    const multJug = calcularMultiplicador(pJug.tipos, pRiv.tipos, efectividades.rows);
    const multRiv = calcularMultiplicador(pRiv.tipos, pJug.tipos, efectividades.rows);

    const poderJug = pJug.nivel * multJug;
    const poderRiv = pRiv.nivel * multRiv;

    if (poderJug >= poderRiv) { 
        ganadorRound = 'jugador';
        victoriasJugador++;
    } else {
        ganadorRound = 'enemigo';
        victoriasEnemigo++;
    }

    resultadosCombates.push({ 
        ganador: ganadorRound, 
        posicion: i,
        pokemon_jugador: pJug.apodo || pJug.pokemon_nombre,
        pokemon_enemigo: pRiv.pokemon_nombre,
        poder_jugador: poderJug.toFixed(2),
        poder_enemigo: poderRiv.toFixed(2)
    });
  }

  
  const ganoCombate = victoriasJugador > victoriasEnemigo;
  const resultadoTexto = ganoCombate ? 'victoria' : 'derrota';

  
  let xpFinalJugador;
  let xpFinalPokemon;

  if (ganoCombate) {
    xpFinalJugador = 100;
    xpFinalPokemon = 30;
  } else {
    xpFinalJugador = 10;
    xpFinalPokemon = 10;
  }
  
  let pokemonsActualizados = [];
  
  
  await dbClient.query('UPDATE jugadores SET xp = xp + $1 WHERE id = $2', [xpFinalJugador, jugadorId]);
  
  
  for (const poke of equipoJugador.rows) {
      await dbClient.query('UPDATE jugador_pokemons SET xp = xp + $1 WHERE id = $2', [xpFinalPokemon, poke.jugador_pokemon_id]);
      
      const resNivel = await verificarSubidaNivelPokemon(poke.jugador_pokemon_id);
      if (resNivel.subio_nivel) {
          pokemonsActualizados.push({
              pokemon: poke.apodo || poke.pokemon_nombre,
              subio_nivel: true,
              niveles_subidos: resNivel.niveles_subidos,
              xp_ganada: xpFinalPokemon
          });
      }
  }

  
  const batalla = await dbClient.query(`
    INSERT INTO batallas (
      jugador_id, entrenador_id, resultado, 
      combate_1_ganador, combate_2_ganador, combate_3_ganador, combate_4_ganador, combate_5_ganador,
      victorias_jugador, victorias_enemigo, xp_ganada
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id
  `, [
    jugadorId, entrenador_id, resultadoTexto,
    resultadosCombates.find(r => r.posicion === 1)?.ganador || null,
    resultadosCombates.find(r => r.posicion === 2)?.ganador || null,
    resultadosCombates.find(r => r.posicion === 3)?.ganador || null,
    resultadosCombates.find(r => r.posicion === 4)?.ganador || null,
    resultadosCombates.find(r => r.posicion === 5)?.ganador || null,
    victoriasJugador, victoriasEnemigo, xpFinalJugador
  ]);

  const jugadorNivel = await verificarSubidaNivelJugador();

  return {
    batalla_id: batalla.rows[0].id,
    resultado: resultadoTexto,
    mensaje: ganoCombate ? `¡Derrotaste a ${nombreEntrenador}!` : `${nombreEntrenador} te ha derrotado.`,
    entrenador: nombreEntrenador,
    combates: resultadosCombates,
    victorias_jugador: victoriasJugador,
    victorias_enemigo: victoriasEnemigo,
    xp_jugador: xpFinalJugador,
    xp_pokemon: xpFinalPokemon,
    total_pokemons: equipoJugador.rowCount,
    pokemons_actualizados: pokemonsActualizados,
    jugador_subio_nivel: jugadorNivel.subio_nivel,
    jugador_niveles_subidos: jugadorNivel.niveles_subidos
  };
}

async function getHistorialBatallas() {
  const jugadorId = await getJugadorId();
  if (!jugadorId) return { error: 'Jugador not found' };
  const result = await dbClient.query(`
    SELECT b.*, e.nombre as entrenador_nombre FROM batallas b
    JOIN entrenadores e ON b.entrenador_id = e.id
    WHERE b.jugador_id = $1 ORDER BY b.id DESC
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
  } catch (e) { return { error: e.message }; }
}

async function updateEntrenador(id, nombre, imagen_url, nivel) {
  try {
    const res = await dbClient.query(
      'UPDATE entrenadores SET nombre = $1, imagen_url = $2, nivel = $3 WHERE id = $4 RETURNING *',
      [nombre, imagen_url, nivel, id]
    );
    return res.rows[0];
  } catch (e) { return { error: e.message }; }
}

async function deleteEntrenador(id) {
  try {
    await dbClient.query('DELETE FROM entrenadores WHERE id = $1', [id]);
    return { message: 'Eliminado' };
  } catch (e) { return { error: e.message }; }
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
  updateEntrenador,   
  deleteEntrenador,  
  setEntrenadorTeam   
};

