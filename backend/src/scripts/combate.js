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
      COUNT(ep.id) as total_pokemons,
      CASE 
        WHEN e.nivel <= $2 THEN true
        ELSE false
      END as desbloqueado,
      (
        SELECT COUNT(*) 
        FROM batallas b 
        WHERE b.entrenador_id = e.id AND b.jugador_id = $1 AND b.resultado = 'victoria'
      ) as victorias,
      (
        SELECT COUNT(*) 
        FROM batallas b 
        WHERE b.entrenador_id = e.id AND b.jugador_id = $1
      ) as batallas_totales
    FROM entrenadores e
    LEFT JOIN entrenador_pokemons ep ON e.id = ep.entrenador_id
    GROUP BY e.id
    ORDER BY e.nivel, e.id
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

  const entrenadorCheck = await dbClient.query(`
    SELECT nivel, nombre FROM entrenadores WHERE id = $1
  `, [entrenador_id]);

  if (entrenadorCheck.rowCount === 0) {
    return { error: 'Entrenador no encontrado' };
  }

  const { nivel: nivelEntrenador, nombre: nombreEntrenador } = entrenadorCheck.rows[0];

  if (nivelEntrenador > nivelDesbloqueado) {
    return { 
      error: 'Entrenador no desbloqueado',
      mensaje: `Debes derrotar al entrenador nivel ${nivelDesbloqueado - 1} primero`
    };
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
    return { 
      error: 'No hay Pokémon en el equipo',
      mensaje: 'Debes tener al menos 1 Pokémon en el equipo para combatir'
    };
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

  if (equipoEntrenador.rowCount === 0) {
    return { error: 'Entrenador sin Pokémon' };
  }

  const efectividades = await dbClient.query(`
    SELECT tipo_atacante, tipo_defensor, multiplicador
    FROM tipo_efectividad
  `);

  const resultadosCombates = [];
  let victoriasJugador = 0;
  let victoriasEnemigo = 0;

  const totalCombates = Math.min(
    equipoJugador.rowCount, 
    equipoEntrenador.rowCount, 
    5
  );

  for (let i = 0; i < totalCombates; i++) {
    const pokemonJugador = equipoJugador.rows[i];
    const pokemonEnemigo = equipoEntrenador.rows[i];

    const multiplicadorJugador = calcularMultiplicador(
      pokemonJugador.tipos,
      pokemonEnemigo.tipos,
      efectividades.rows
    );

    const multiplicadorEnemigo = calcularMultiplicador(
      pokemonEnemigo.tipos,
      pokemonJugador.tipos,
      efectividades.rows
    );

    const poderJugador = pokemonJugador.nivel * multiplicadorJugador;
    const poderEnemigo = pokemonEnemigo.nivel * multiplicadorEnemigo;

    let ganador;
    if (poderJugador > poderEnemigo) {
      ganador = 'jugador';
      victoriasJugador++;
    } else {
      ganador = 'enemigo';
      victoriasEnemigo++;
    }
    
    console.log(`🥊 Combate ${i+1}:`, {
      jugador: `${pokemonJugador.apodo || pokemonJugador.pokemon_nombre} (${pokemonJugador.tipos.join('/')}) Lvl ${pokemonJugador.nivel}`,
      enemigo: `${pokemonEnemigo.pokemon_nombre} (${pokemonEnemigo.tipos.join('/')}) Lvl ${pokemonEnemigo.nivel}`,
      multiplicadorJugador: multiplicadorJugador.toFixed(2),
      multiplicadorEnemigo: multiplicadorEnemigo.toFixed(2),
      poderJugador: poderJugador.toFixed(2),
      poderEnemigo: poderEnemigo.toFixed(2),
      ganador: ganador
    });

    resultadosCombates.push({
      posicion: i + 1,
      ganador: ganador,
      pokemon_jugador: pokemonJugador.apodo || pokemonJugador.pokemon_nombre,
      pokemon_enemigo: pokemonEnemigo.pokemon_nombre,
      nivel_jugador: pokemonJugador.nivel,
      nivel_enemigo: pokemonEnemigo.nivel,
      tipos_jugador: pokemonJugador.tipos,
      tipos_enemigo: pokemonEnemigo.tipos,
      poder_jugador: parseFloat(poderJugador.toFixed(2)),
      poder_enemigo: parseFloat(poderEnemigo.toFixed(2)),
      multiplicador_jugador: parseFloat(multiplicadorJugador.toFixed(2)),
      multiplicador_enemigo: parseFloat(multiplicadorEnemigo.toFixed(2))
    });
  }

  const resultado = victoriasJugador >= 3 ? 'victoria' : 'derrota';
  
  console.log(`\n🏆 RESULTADO FINAL:`);
  console.log(`   Victorias Jugador: ${victoriasJugador}`);
  console.log(`   Victorias Enemigo: ${victoriasEnemigo}`);
  console.log(`   Resultado: ${resultado.toUpperCase()}\n`);

  let xpJugador;
  let xpPokemon;

  if (resultado === 'victoria') {
    xpJugador = 100;  
    xpPokemon = 30;   
  } else {
    xpJugador = 10;   
    xpPokemon = 10;   
  }

  const batalla = await dbClient.query(`
    INSERT INTO batallas (
      jugador_id,
      entrenador_id,
      resultado,
      combate_1_ganador,
      combate_2_ganador,
      combate_3_ganador,
      combate_4_ganador,
      combate_5_ganador,
      victorias_jugador,
      victorias_enemigo,
      xp_ganada
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `, [
    jugadorId,
    entrenador_id,
    resultado,
    resultadosCombates[0]?.ganador || null,
    resultadosCombates[1]?.ganador || null,
    resultadosCombates[2]?.ganador || null,
    resultadosCombates[3]?.ganador || null,
    resultadosCombates[4]?.ganador || null,
    victoriasJugador,
    victoriasEnemigo,
    xpJugador
  ]);

  await dbClient.query(`
    UPDATE jugadores
    SET xp = xp + $1
    WHERE id = $2
  `, [xpJugador, jugadorId]);

  const pokemonsActualizados = [];
  
  for (let i = 0; i < equipoJugador.rowCount; i++) {
    const pokemon = equipoJugador.rows[i];
    
    await dbClient.query(`
      UPDATE jugador_pokemons
      SET xp = xp + $1
      WHERE id = $2
    `, [xpPokemon, pokemon.jugador_pokemon_id]);

    const nivelResultado = await verificarSubidaNivelPokemon(pokemon.jugador_pokemon_id);
    
    pokemonsActualizados.push({
      pokemon: pokemon.apodo || pokemon.pokemon_nombre,
      xp_ganada: xpPokemon,
      subio_nivel: nivelResultado.subio_nivel || false,
      niveles_subidos: nivelResultado.niveles_subidos || []
    });
  }

  for (let i = 0; i < resultadosCombates.length; i++) {
    if (resultadosCombates[i].ganador === 'jugador') {
      const pokemonGanador = equipoJugador.rows[i];
      
      await dbClient.query(`
        UPDATE jugador_pokemons
        SET combates_ganados = combates_ganados + 1
        WHERE id = $1
      `, [pokemonGanador.jugador_pokemon_id]);
    }
  }

  const jugadorNivel = await verificarSubidaNivelJugador();

  return {
    batalla_id: batalla.rows[0].id,
    resultado: resultado,
    mensaje: resultado === 'victoria' 
      ? `¡Derrotaste a ${nombreEntrenador}!`
      : `${nombreEntrenador} te ha derrotado`,
    entrenador: nombreEntrenador,
    combates: resultadosCombates,
    victorias_jugador: victoriasJugador,
    victorias_enemigo: victoriasEnemigo,
    xp_jugador: xpJugador,
    xp_pokemon: xpPokemon,
    total_pokemons: equipoJugador.rowCount,
    pokemons_actualizados: pokemonsActualizados,
    jugador_subio_nivel: jugadorNivel.subio_nivel || false,
    jugador_niveles_subidos: jugadorNivel.niveles_subidos || []
  };
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

module.exports = {
  getAllEntrenadores,
  getOneEntrenador,
  iniciarCombate,
  getHistorialBatallas
};