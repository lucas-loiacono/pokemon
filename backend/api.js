const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  next();
});

const PORT = process.env.PORT || 3000;

const dbClient = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pokemon',
  password: 'postgres',
  port: 5432,
});

const {
  getAllPokemons,
  getOnePokemon,
  createPokemon,
  updatePokemon,
  deletePokemon
} = require('./src/scripts/pokemons');

const {
  getJugador,
  getJugadorPokemons,
  getJugadorInventario,
  updateJugadorStats,
  setApodo,
  eliminarPokemon,
  borrarJugador  
} = require('./src/scripts/jugadores');

const {
  getAllHabitats,
  getJugadorHabitats,
  getHabitatPokemons,
  getHabitatTipos, 
  asignarPokemonHabitat,
  quitarPokemonHabitat
} = require('./src/scripts/habitats');

const {
  getAllZonas,
  getOneZona,
  getZonaPokemons,
  capturarPokemon
} = require('./src/scripts/zonas_captura');

const {
  getJugadorGranjas,
  getGranjaDetalle,
  recolectarFrutas,
  crearGranjasIniciales
} = require('./src/scripts/granjas');

const {
  getEquipo,
  agregarAlEquipo,
  quitarDelEquipo,
  reordenarEquipo
} = require('./src/scripts/equipo');

const {
  getAllEntrenadores,
  getOneEntrenador,
  iniciarCombate,
  createEntrenador,
  deleteEntrenador,
  updateEntrenador,
  setEntrenadorTeam
} = require('./src/scripts/combate');

const {
  alimentarPokemon
} = require('./src/scripts/alimentar');

const {
  verificarSubidaNivelPokemon,
  verificarSubidaNivelJugador,
  getInfoNivelPokemon,
  getInfoNivelJugador
} = require('./src/scripts/niveles');

const {
  puedeEvolucionar,
  evolucionarPokemon
} = require('./src/scripts/evoluciones');

const {
  inicializarJuego,
  reiniciarJuego,
  getStartersDisponibles
} = require('./src/scripts/inicializacion');

const { cambiarApodo } = require('./src/scripts/apodo')

// Health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});


app.get('/api/pokemons', async (req, res) => {
  const pokemons = await getAllPokemons();
  res.json(pokemons);
});

app.get('/api/pokemons/:id', async (req, res) => {
  const pokemon = await getOnePokemon(req.params.id);
  if (!pokemon) {
    return res.status(404).json({ error: 'Pokemon not found' });
  }
  res.json(pokemon);
});

app.post('/api/pokemons', async (req, res) => {
  if (!req.body.pokedex_id || !req.body.nombre || !req.body.imagen_url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newPokemon = await createPokemon(req.body.pokedex_id, req.body.nombre, req.body.imagen_url);

  if (!newPokemon) {
    return res.status(500).json({ error: 'Failed to create pokemon' });
  }
  res.status(201).json(newPokemon);
});

app.put('/api/pokemons/:id', async (req, res) => {
  if (!req.body.nombre && !req.body.imagen_url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const updatedPokemon = await updatePokemon(req.params.id, req.body.nombre, req.body.imagen_url);

  if (!updatedPokemon) {
    return res.status(404).json({ error: 'Pokemon not found' });
  }
  res.json(updatedPokemon);
});

app.delete('/api/pokemons/:id', async (req, res) => {
  const pokemon = await deletePokemon(req.params.id);
  if (!pokemon) {
    return res.status(404).json({ error: 'Pokemon not found' });
  }
  res.json({ message: 'Pokemon deleted successfully' });
});


app.get('/api/jugador', async (req, res) => {
  const jugador = await getJugador();
  if (!jugador) {
    return res.status(404).json({ error: 'Jugador not found' });
  }
  res.json(jugador);
});

app.get('/api/jugador/pokemons', async (req, res) => {
  const pokemons = await getJugadorPokemons();
  res.json(pokemons);
});

app.get('/api/jugador/inventario', async (req, res) => {
  try {
    const jugadorQuery = await dbClient.query('SELECT id FROM jugadores ORDER BY id DESC LIMIT 1');
    const jugadorId = jugadorQuery.rows[0]?.id;

    if (!jugadorId) return res.json([]); 

    const result = await dbClient.query(
      'SELECT fruta_id, cantidad FROM jugador_frutas WHERE jugador_id = $1', 
      [jugadorId]
    );
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error obteniendo inventario:', error);
    res.status(500).json({ error: 'Error de servidor' });
  }
});

app.put('/api/jugador/stats', async (req, res) => {
  const { nivel, xp } = req.body;

  if (nivel === undefined && xp === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const updatedJugador = await updateJugadorStats(nivel, xp);

  if (!updatedJugador) {
    return res.status(500).json({ error: 'Failed to update jugador' });
  }
  res.json(updatedJugador);
});

app.put('/api/jugador/pokemons/:id/apodo', async (req, res) => {
  const { apodo } = req.body;

  if (!apodo) {
    return res.status(400).json({ error: 'Missing apodo' });
  }

  const pokemon = await setApodo(req.params.id, apodo);

  if (!pokemon) {
    return res.status(404).json({ error: 'Pokemon not found' });
  }

  res.json(pokemon);
});


app.delete('/api/jugador/pokemons/:id', async (req, res) => {
  const result = await eliminarPokemon(req.params.id);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

app.delete('/api/jugador', async (req, res) => {
  try {
    await dbClient.query('BEGIN');

    await dbClient.query('TRUNCATE jugadores, habitats, zonas, granjas, jugador_frutas RESTART IDENTITY CASCADE');

    await dbClient.query("DELETE FROM entrenadores WHERE descripcion = 'Entrenador Personalizado'");

    await dbClient.query(`
      INSERT INTO habitats (id, tipo, capacidad, imagen_url) VALUES
      (1, 'Pradera', 6, 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/habitats/habitatllanura.jpg'),
      (2, 'Bosque', 6, 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/habitats/habitatbosque.png'),
      (3, 'Agua', 6, 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/habitats/habitatagua.png'),
      (4, 'Acero', 6, 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/habitats/habitatacero.png'),
      (5, 'Desierto', 6, 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/habitats/habitatdesierto.jpeg'),
      (6, 'Hielo', 6, 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/habitats/habitathielo.png');
    `);

    await dbClient.query(`
      INSERT INTO habitat_tipos_aceptados (habitat_id, tipo_nombre) VALUES
      (1, 'Normal'), (1, 'Eléctrico'), (1, 'Psíquico'),
      (2, 'Planta'), (2, 'Bicho'), (2, 'Veneno'), (2, 'Hada'),
      (3, 'Agua'), (3, 'Volador'),
      (4, 'Roca'), (4, 'Lucha'), (4, 'Acero'), (4, 'Siniestro'),
      (5, 'Tierra'), (5, 'Fuego'), (5, 'Fantasma'),
      (6, 'Hielo'), (6, 'Dragón');
    `);

    await dbClient.query(`
      INSERT INTO zonas (id, nombre, descripcion, imagen_url) VALUES
      (1, 'Pradera', 'Campos abiertos', 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/nuevas_zonas_captura/zonacapturallanura.png'),
      (2, 'Bosque', 'Bosque frondoso', 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/nuevas_zonas_captura/zonacapturabosque.png'),
      (3, 'Playa', 'Costa marina', 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/nuevas_zonas_captura/zonacapturaplaya.png'),
      (4, 'Cueva', 'Cueva oscura', 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/nuevas_zonas_captura/zonacapturacueva.png'),
      (5, 'Desierto', 'Desierto árido', 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/nuevas_zonas_captura/zonacapturadesierto.png'),
      (6, 'Nieve', 'Montañas nevadas', 'https://raw.githubusercontent.com/lucas-loiacono/imagenes/refs/heads/main/assets/nuevas_zonas_captura/zonacapturahielo.png');
    `);

    await dbClient.query(`
      INSERT INTO zona_tipos (zona_id, tipo_id) 
      SELECT 1, id FROM tipos WHERE nombre IN ('Normal', 'Eléctrico', 'Psíquico') UNION ALL
      SELECT 2, id FROM tipos WHERE nombre IN ('Planta', 'Bicho', 'Veneno', 'Hada') UNION ALL
      SELECT 3, id FROM tipos WHERE nombre IN ('Agua', 'Volador') UNION ALL
      SELECT 4, id FROM tipos WHERE nombre IN ('Roca', 'Lucha', 'Acero', 'Siniestro') UNION ALL
      SELECT 5, id FROM tipos WHERE nombre IN ('Tierra', 'Fuego', 'Fantasma') UNION ALL
      SELECT 6, id FROM tipos WHERE nombre IN ('Hielo', 'Dragón');
    `);

    await dbClient.query("SELECT setval('habitats_id_seq', 6, true)");
    await dbClient.query("SELECT setval('zonas_id_seq', 6, true)");

    await dbClient.query('COMMIT');
    res.json({ message: '¡Partida y mundo reiniciados de fábrica!' });

  } catch (error) {
    await dbClient.query('ROLLBACK');
    console.error('Error crítico al reiniciar:', error);
    res.status(500).json({ error: 'No se pudo reiniciar el mundo correctamente.' });
  }
});


app.get('/api/habitats', async (req, res) => {
  const habitats = await getAllHabitats();
  res.json(habitats);
});

app.get('/api/jugador/habitats', async (req, res) => {
  const habitats = await getJugadorHabitats();
  res.json(habitats);
});

app.get('/api/jugador/habitats/:id/pokemons', async (req, res) => {
  const pokemons = await getHabitatPokemons(req.params.id);
  res.json(pokemons);
});

app.get('/api/habitats/:id/tipos', async (req, res) => {
  const tipos = await getHabitatTipos(req.params.id);
  res.json(tipos);
});

app.post('/api/jugador/habitats/:id/asignar', async (req, res) => {
  const { jugador_pokemon_id } = req.body;

  if (!jugador_pokemon_id) {
    return res.status(400).json({ error: 'Missing jugador_pokemon_id' });
  }

  const result = await asignarPokemonHabitat(req.params.id, jugador_pokemon_id);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

app.delete('/api/jugador/habitats/:id/pokemons/:pokemon_id', async (req, res) => {
  const result = await quitarPokemonHabitat(req.params.id, req.params.pokemon_id);

  if (!result) {
    return res.status(404).json({ error: 'Pokemon not found in habitat' });
  }

  res.json({ message: 'Pokemon removed from habitat' });
});

app.get('/api/zonas', async (req, res) => {
  const zonas = await getAllZonas();
  res.json(zonas);
});

app.get('/api/zonas/:id', async (req, res) => {
  const zona = await getOneZona(req.params.id);
  if (!zona) {
    return res.status(404).json({ error: 'Zona not found' });
  }
  res.json(zona);
});

app.get('/api/zonas/:id/pokemons', async (req, res) => {
  const pokemons = await getZonaPokemons(req.params.id);
  res.json(pokemons);
});

app.post('/api/zonas/:id/capturar', async (req, res) => {
  const result = await capturarPokemon(req.params.id);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});


app.get('/api/jugador/granjas', async (req, res) => {
  const result = await getJugadorGranjas();
  res.json(result);
});

app.get('/api/jugador/granjas/:id', async (req, res) => {
  const granja = await getGranjaDetalle(req.params.id);
  if (!granja) {
    return res.status(404).json({ error: 'Granja not found' });
  }
  res.json(granja);
});

app.post('/api/jugador/granjas/:id/recolectar', async (req, res) => {
  const result = await recolectarFrutas(req.params.id);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

app.post('/api/jugador/granjas/inicializar', async (req, res) => {
  const result = await crearGranjasIniciales();
  res.json(result);
});



app.get('/api/jugador/equipo', async (req, res) => {
  const equipo = await getEquipo();
  
  if (equipo.error) {
    return res.status(404).json(equipo);
  }
  
  res.json(equipo);
});

app.post('/api/jugador/equipo', async (req, res) => {
  const { jugador_pokemon_id, posicion } = req.body;

  if (!jugador_pokemon_id) {
    return res.status(400).json({ error: 'Missing jugador_pokemon_id' });
  }

  const result = await agregarAlEquipo(jugador_pokemon_id, posicion);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

app.delete('/api/jugador/equipo/:posicion', async (req, res) => {
  const posicion = parseInt(req.params.posicion);
  
  if (isNaN(posicion) || posicion < 1 || posicion > 5) {
    return res.status(400).json({ error: 'Invalid position' });
  }
  
  const result = await quitarDelEquipo(posicion);

  if (result.error) {
    return res.status(404).json(result);
  }

  res.json(result);
});

app.put('/api/jugador/equipo/reordenar', async (req, res) => {
  const nuevoOrden = req.body;

  if (!Array.isArray(nuevoOrden) || nuevoOrden.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid nuevoOrden array' });
  }

  const result = await reordenarEquipo(nuevoOrden);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});



app.post('/api/jugador/pokemons/:id/alimentar', async (req, res) => {
  try {
    const result = await alimentarPokemon(parseInt(req.params.id));

    if (result.error) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/entrenadores', async (req, res) => {
  try {
    const entrenadores = await getAllEntrenadores();
    res.json(entrenadores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/entrenadores/:id', async (req, res) => {
  try {
    const entrenador = await getOneEntrenador(parseInt(req.params.id));
    if (!entrenador) {
      return res.status(404).json({ error: 'Entrenador not found' });
    }
    res.json(entrenador);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/entrenadores/:id/combatir', async (req, res) => {
  try {
    const result = await iniciarCombate(parseInt(req.params.id));
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.get('/api/tipo-efectividad', async (req, res) => {
  try {
    const result = await dbClient.query(`
      SELECT tipo_atacante, tipo_defensor, multiplicador
      FROM tipo_efectividad
      ORDER BY tipo_atacante, tipo_defensor
    `);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/jugador/pokemons/:id/verificar-nivel', async (req, res) => {
  const result = await verificarSubidaNivelPokemon(req.params.id);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

app.post('/api/jugador/verificar-nivel', async (req, res) => {
  const result = await verificarSubidaNivelJugador();

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

app.get('/api/jugador/pokemons/:id/nivel', async (req, res) => {
  const info = await getInfoNivelPokemon(req.params.id);

  if (!info) {
    return res.status(404).json({ error: 'Pokemon not found' });
  }

  res.json(info);
});

app.get('/api/jugador/nivel', async (req, res) => {
  const info = await getInfoNivelJugador();

  if (!info) {
    return res.status(404).json({ error: 'Jugador not found' });
  }

  res.json(info);
});


app.get('/api/jugador/pokemons/:id/puede-evolucionar', async (req, res) => {
  const result = await puedeEvolucionar(req.params.id);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

app.post('/api/jugador/pokemons/:id/evolucionar', async (req, res) => {
  const result = await evolucionarPokemon(req.params.id);

  if (result.error || !result.evolucionado) {
    return res.status(400).json(result);
  }

  res.json(result);
});

app.get('/api/inicializar/starters', async (req, res) => {
  const starters = await getStartersDisponibles();
  res.json(starters);
});

app.post('/api/inicializar', async (req, res) => {
  const { pokemon_starter_id } = req.body;

  if (!pokemon_starter_id) {
    return res.status(400).json({ error: 'Missing pokemon_starter_id' });
  }

  const result = await inicializarJuego(pokemon_starter_id);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

app.post('/api/reiniciar', async (req, res) => {
  const result = await reiniciarJuego();
  res.json(result);
});

app.put('/api/jugador/pokemons/:id/apodo', async (req, res) => {
    const { apodo } = req.body;
    const resultado = await cambiarApodo(req.params.id, apodo);
    res.json(resultado);
});


app.post('/api/habitats', async (req, res) => {
    const { nombre, imagen_url, tiposAceptados } = req.body; 
    
    if (!tiposAceptados || !Array.isArray(tiposAceptados)) {
        return res.status(400).json({ error: "Debes especificar tipos compatibles." });
    }

    try {
        await dbClient.query('BEGIN');

        const result = await dbClient.query(
            'INSERT INTO habitats (tipo, imagen_url, capacidad) VALUES ($1, $2, 6) RETURNING *',
            [nombre, imagen_url]
        );
        const nuevoHabitat = result.rows[0];

        for (const nombreTipo of tiposAceptados) {
            await dbClient.query(
                'INSERT INTO habitat_tipos_aceptados (habitat_id, tipo_nombre) VALUES ($1, $2)',
                [nuevoHabitat.id, nombreTipo.trim()]
            );
        }

        const jugadorRes = await dbClient.query('SELECT id FROM jugadores ORDER BY id DESC LIMIT 1');
        const jugadorId = jugadorRes.rows[0]?.id;
        if (jugadorId) {
            await dbClient.query(
                'INSERT INTO jugador_habitats (jugador_id, habitat_id) VALUES ($1, $2)',
                [jugadorId, nuevoHabitat.id]
            );
        }

        await dbClient.query('COMMIT');
        res.json(nuevoHabitat);
    } catch (e) { 
        await dbClient.query('ROLLBACK');
        res.status(500).json({ error: e.message }); 
    }
});

app.put('/api/habitats/:id', async (req, res) => {
    const { nombre, imagen_url } = req.body;
    try {
        const result = await dbClient.query(
            'UPDATE habitats SET tipo = COALESCE($1, tipo), imagen_url = COALESCE($2, imagen_url) WHERE id = $3 RETURNING *',
            [nombre, imagen_url, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/habitats/:id', async (req, res) => {
    try {
        await dbClient.query('DELETE FROM habitats WHERE id = $1', [req.params.id]);
        res.json({ message: 'Hábitat eliminado correctamente.' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});


app.post('/api/zonas', async (req, res) => {
    const { nombre, imagen_url, descripcion, tiposAceptados } = req.body; 
    
    if (!tiposAceptados || !Array.isArray(tiposAceptados)) {
        return res.status(400).json({ error: "Debes especificar al menos un tipo para esta zona." });
    }

    try {
        await dbClient.query('BEGIN');

        const result = await dbClient.query(
            'INSERT INTO zonas (nombre, imagen_url, descripcion) VALUES ($1, $2, $3) RETURNING *',
            [nombre, imagen_url, descripcion || 'Zona de aventura']
        );
        const nuevaZona = result.rows[0];

        for (const nombreTipo of tiposAceptados) {
            const tipoFormateado = nombreTipo.trim().charAt(0).toUpperCase() + nombreTipo.trim().slice(1).toLowerCase();

            const resTipo = await dbClient.query('SELECT id FROM tipos WHERE nombre = $1', [tipoFormateado]);
            
            if (resTipo.rows.length > 0) {
                const tipoId = resTipo.rows[0].id;
                await dbClient.query(
                    'INSERT INTO zona_tipos (zona_id, tipo_id) VALUES ($1, $2)',
                    [nuevaZona.id, tipoId]
                );
            }
        }

        await dbClient.query('COMMIT');
        res.json(nuevaZona);
    } catch (e) { 
        await dbClient.query('ROLLBACK');
        console.error("❌ Error creando zona:", e);
        res.status(500).json({ error: e.message }); 
    }
});

app.put('/api/zonas/:id', async (req, res) => {
    const { nombre, imagen_url } = req.body;
    try {
        const result = await dbClient.query(
            'UPDATE zonas SET nombre = COALESCE($1, nombre), imagen_url = COALESCE($2, imagen_url) WHERE id = $3 RETURNING *',
            [nombre, imagen_url, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/zonas/:id', async (req, res) => {
    try {
        await dbClient.query('DELETE FROM zonas WHERE id = $1', [req.params.id]);
        res.json({ message: 'Zona eliminada' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});


app.put('/api/granjas/:id/renombrar', async (req, res) => {
    const { nombre } = req.body;
    try {
        const result = await dbClient.query(
            'UPDATE granjas SET nombre_personalizado = $1 WHERE id = $2 RETURNING *',
            [nombre, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/entrenadores', async (req, res) => {
    const { nombre, nivel, imagen_url } = req.body;
    const result = await createEntrenador(nombre, nivel, imagen_url);
    if(result.error) return res.status(500).json(result);
    res.json(result);
});

app.put('/api/entrenadores/:id', async (req, res) => {
    const { nombre, nivel, imagen_url } = req.body;
    const result = await updateEntrenador(req.params.id, nombre, imagen_url, nivel);
    if(result.error) return res.status(500).json(result);
    res.json(result);
});

app.delete('/api/entrenadores/:id', async (req, res) => {
    const result = await deleteEntrenador(req.params.id);
    if(result.error) return res.status(500).json(result);
    res.json(result);
});

app.post('/api/entrenadores/:id/equipo', async (req, res) => {
    const { team } = req.body;
    if(!team || !Array.isArray(team)) return res.status(400).json({error: "Formato de equipo inválido"});
    
    const result = await setEntrenadorTeam(req.params.id, team);
    if(result.error) return res.status(500).json(result);
    res.json(result);
});

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});