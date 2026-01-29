const { Pool } = require('pg');

const dbClient = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pokemon',
  password: 'postgres',
  port: 5432,
});

const JUGADOR_ID = 1;

// ==================== ENTRENADORES ====================

async function getAllEntrenadores() {
  // Obtener el nivel más alto desbloqueado (basado en victorias)
  const maxNivelDesbloqueado = await dbClient.query(`
    SELECT COALESCE(MAX(e.nivel), 0) + 1 as siguiente_nivel
    FROM batallas b
    INNER JOIN entrenadores e ON b.entrenador_id = e.id
    WHERE b.jugador_id = $1 AND b.resultado = 'victoria'
  `, [JUGADOR_ID]);

  const nivelDesbloqueado = maxNivelDesbloqueado.rows[0].siguiente_nivel;

  // Obtener todos los entrenadores con info de desbloqueo
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
  `, [JUGADOR_ID, nivelDesbloqueado]);

  return result.rows;
}

async function getOneEntrenador(id) {
  // Verificar si está desbloqueado
  const maxNivelDesbloqueado = await dbClient.query(`
    SELECT COALESCE(MAX(e.nivel), 0) + 1 as siguiente_nivel
    FROM batallas b
    INNER JOIN entrenadores e ON b.entrenador_id = e.id
    WHERE b.jugador_id = $1 AND b.resultado = 'victoria'
  `, [JUGADOR_ID]);

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

  // Obtener Pokémon del entrenador
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

// ==================== COMBATE ====================

function calcularMultiplicador(tiposAtacante, tiposDefensor, efectividades) {
  let multiplicador = 1.0;

  for (const tipoAtacante of tiposAtacante) {
    for (const tipoDefensor of tiposDefensor) {
      const efectividad = efectividades.find(
        e => e.tipo_atacante === tipoAtacante && e.tipo_defensor === tipoDefensor
      );
      if (efectividad) {
        multiplicador *= parseFloat(efectividad.multiplicador);
      }
    }
  }

  return multiplicador;
}

async function iniciarCombate(entrenador_id) {
  // 1. Verificar que el entrenador está desbloqueado
  const maxNivelDesbloqueado = await dbClient.query(`
    SELECT COALESCE(MAX(e.nivel), 0) + 1 as siguiente_nivel
    FROM batallas b
    INNER JOIN entrenadores e ON b.entrenador_id = e.id
    WHERE b.jugador_id = $1 AND b.resultado = 'victoria'
  `, [JUGADOR_ID]);

  const nivelDesbloqueado = maxNivelDesbloqueado.rows[0].siguiente_nivel;

  const entrenadorCheck = await dbClient.query(`
    SELECT nivel FROM entrenadores WHERE id = $1
  `, [entrenador_id]);

  if (entrenadorCheck.rowCount === 0) {
    return { error: 'Entrenador no encontrado' };
  }

  if (entrenadorCheck.rows[0].nivel > nivelDesbloqueado) {
    return { error: 'Entrenador no desbloqueado' };
  }

  // 2. Obtener equipo del jugador
  const equipoJugador = await dbClient.query(`
    SELECT 
      ec.posicion,
      jp.id as jugador_pokemon_id,
      jp.nivel,
      p.id as pokemon_id,
      p.nombre as pokemon_nombre,
      ARRAY_AGG(t.nombre ORDER BY pt.orden) as tipos
    FROM equipo_combate ec
    INNER JOIN jugador_pokemons jp ON ec.jugador_pokemon_id = jp.id
    INNER JOIN pokemons p ON jp.pokemon_id = p.id
    INNER JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
    INNER JOIN tipos t ON pt.tipo_id = t.id
    WHERE ec.jugador_id = $1
    GROUP BY ec.posicion, jp.id, jp.nivel, p.id, p.nombre
    ORDER BY ec.posicion
  `, [JUGADOR_ID]);

  if (equipoJugador.rowCount === 0) {
    return { error: 'No hay Pokémon en el equipo' };
  }

  // 3. Obtener equipo del entrenador
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

  // 4. Obtener tabla de efectividades
  const efectividades = await dbClient.query(`
    SELECT tipo_atacante, tipo_defensor, multiplicador
    FROM tipo_efectividad
  `);

  // 5. Simular combates 1v1 (hasta 5 combates)
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

    // Calcular poder de ataque (nivel * multiplicador de tipo)
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

    // Determinar ganador
    let ganador;
    if (poderJugador > poderEnemigo) {
      ganador = 'jugador';
      victoriasJugador++;
    } else {
      // Si es empate o el enemigo tiene más poder, gana el enemigo
      ganador = 'enemigo';
      victoriasEnemigo++;
    }

    resultadosCombates.push({
      posicion: i + 1,
      ganador: ganador,
      pokemon_jugador: pokemonJugador.pokemon_nombre,
      pokemon_enemigo: pokemonEnemigo.pokemon_nombre,
      nivel_jugador: pokemonJugador.nivel,
      nivel_enemigo: pokemonEnemigo.nivel,
      poder_jugador: poderJugador.toFixed(2),
      poder_enemigo: poderEnemigo.toFixed(2),
      multiplicador_jugador: multiplicadorJugador.toFixed(2),
      multiplicador_enemigo: multiplicadorEnemigo.toFixed(2)
    });
  }

  // 6. Determinar resultado final (necesita 3+ victorias)
  const resultado = victoriasJugador >= 3 ? 'victoria' : 'derrota';

  // 7. Calcular XP según resultado
  let xpJugador;
  let xpPokemon;

  if (resultado === 'victoria') {
    xpJugador = 100;  // Jugador gana 100 XP
    xpPokemon = 30;   // Cada Pokémon gana 30 XP
  } else {
    xpJugador = 10;   // Jugador gana 10 XP
    xpPokemon = 10;   // Cada Pokémon gana 10 XP
  }

  // 8. Registrar batalla
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
    JUGADOR_ID,
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

  // 9. Dar XP al jugador
  await dbClient.query(`
    UPDATE jugadores
    SET xp = xp + $1
    WHERE id = $2
  `, [xpJugador, JUGADOR_ID]);

  // 10. Dar XP a TODOS los Pokémon del equipo (ganen o pierdan)
  for (let i = 0; i < equipoJugador.rowCount; i++) {
    const pokemon = equipoJugador.rows[i];
    
    await dbClient.query(`
      UPDATE jugador_pokemons
      SET xp = xp + $1
      WHERE id = $2
    `, [xpPokemon, pokemon.jugador_pokemon_id]);
  }

  // 11. Marcar combates ganados solo para los que ganaron su duelo
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

  return {
    batalla_id: batalla.rows[0].id,
    resultado: resultado,
    combates: resultadosCombates,
    victorias_jugador: victoriasJugador,
    victorias_enemigo: victoriasEnemigo,
    xp_jugador: xpJugador,
    xp_pokemon: xpPokemon,
    total_pokemons: equipoJugador.rowCount
  };
}

// ==================== HISTORIAL ====================

async function getHistorialBatallas() {
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
  `, [JUGADOR_ID]);

  return result.rows;
}

module.exports = {
  getAllEntrenadores,
  getOneEntrenador,
  iniciarCombate,
  getHistorialBatallas
};