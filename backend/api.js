const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 3000;

// Configuración de la base de datos para tipo-efectividad
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
  eliminarPokemon  
} = require('./src/scripts/jugadores');

const {
  getAllHabitats,
  getJugadorHabitats,
  getHabitatPokemons,
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
  iniciarCombate
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

// ==================== POKEMONS ====================

// Get all pokemons
app.get('/api/pokemons', async (req, res) => {
  const pokemons = await getAllPokemons();
  res.json(pokemons);
});

// Get pokemon by id
app.get('/api/pokemons/:id', async (req, res) => {
  const pokemon = await getOnePokemon(req.params.id);
  if (!pokemon) {
    return res.status(404).json({ error: 'Pokemon not found' });
  }
  res.json(pokemon);
});

// Insert new pokemon 
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

// Update pokemon
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

// Delete pokemon
app.delete('/api/pokemons/:id', async (req, res) => {
  const pokemon = await deletePokemon(req.params.id);
  if (!pokemon) {
    return res.status(404).json({ error: 'Pokemon not found' });
  }
  res.json({ message: 'Pokemon deleted successfully' });
});

// ==================== JUGADOR ====================

// Get jugador info
app.get('/api/jugador', async (req, res) => {
  const jugador = await getJugador();
  if (!jugador) {
    return res.status(404).json({ error: 'Jugador not found' });
  }
  res.json(jugador);
});

// Get jugador's pokemons
app.get('/api/jugador/pokemons', async (req, res) => {
  const pokemons = await getJugadorPokemons();
  res.json(pokemons);
});

// Get jugador's inventario (frutas)
app.get('/api/jugador/inventario', async (req, res) => {
  const inventario = await getJugadorInventario();
  res.json(inventario);
});

// Update jugador stats (usado internamente por el juego)
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

// Set apodo to a pokemon
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


// Eliminar Pokémon del inventario
app.delete('/api/jugador/pokemons/:id', async (req, res) => {
  const result = await eliminarPokemon(req.params.id);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// ==================== HÁBITATS ====================

// Get all habitat types
app.get('/api/habitats', async (req, res) => {
  const habitats = await getAllHabitats();
  res.json(habitats);
});

// Get jugador's habitats
app.get('/api/jugador/habitats', async (req, res) => {
  const habitats = await getJugadorHabitats();
  res.json(habitats);
});

// Get pokemons in a habitat
app.get('/api/jugador/habitats/:id/pokemons', async (req, res) => {
  const pokemons = await getHabitatPokemons(req.params.id);
  res.json(pokemons);
});

// Assign pokemon to habitat
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

// Remove pokemon from habitat
app.delete('/api/jugador/habitats/:id/pokemons/:pokemon_id', async (req, res) => {
  const result = await quitarPokemonHabitat(req.params.id, req.params.pokemon_id);

  if (!result) {
    return res.status(404).json({ error: 'Pokemon not found in habitat' });
  }

  res.json({ message: 'Pokemon removed from habitat' });
});

// ==================== ZONAS ====================

// Get all zones
app.get('/api/zonas', async (req, res) => {
  const zonas = await getAllZonas();
  res.json(zonas);
});

// Get zone by id
app.get('/api/zonas/:id', async (req, res) => {
  const zona = await getOneZona(req.params.id);
  if (!zona) {
    return res.status(404).json({ error: 'Zona not found' });
  }
  res.json(zona);
});

// Get pokemons available in a zone
app.get('/api/zonas/:id/pokemons', async (req, res) => {
  const pokemons = await getZonaPokemons(req.params.id);
  res.json(pokemons);
});

// Capture a pokemon from a zone
app.post('/api/zonas/:id/capturar', async (req, res) => {
  const result = await capturarPokemon(req.params.id);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// ==================== GRANJAS ====================

// Get jugador's granjas (con info de desbloqueo)
app.get('/api/jugador/granjas', async (req, res) => {
  const result = await getJugadorGranjas();
  res.json(result);
});

// Get granja detail
app.get('/api/jugador/granjas/:id', async (req, res) => {
  const granja = await getGranjaDetalle(req.params.id);
  if (!granja) {
    return res.status(404).json({ error: 'Granja not found' });
  }
  res.json(granja);
});

// Recolectar frutas
app.post('/api/jugador/granjas/:id/recolectar', async (req, res) => {
  const result = await recolectarFrutas(req.params.id);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Crear 6 granjas al inicio (ejecutar una sola vez)
app.post('/api/jugador/granjas/inicializar', async (req, res) => {
  const result = await crearGranjasIniciales();
  res.json(result);
});


// ==================== EQUIPO ====================

// Get jugador's team
app.get('/api/jugador/equipo', async (req, res) => {
  const equipo = await getEquipo();
  
  if (equipo.error) {
    return res.status(404).json(equipo);
  }
  
  res.json(equipo);
});

// Add pokemon to team
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

// Remove pokemon from team
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

// Reorder team
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


// ==================== ALIMENTAR ====================

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

// ==================== COMBATE ====================

// Get all entrenadores
app.get('/api/entrenadores', async (req, res) => {
  try {
    const entrenadores = await getAllEntrenadores();
    res.json(entrenadores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get entrenador by id
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

// Combatir contra un entrenador
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


// ==================== TIPO EFECTIVIDAD ====================

// Get tipo efectividad table
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

// ==================== NIVELES ====================

// Verificar subida de nivel de un Pokémon
app.post('/api/jugador/pokemons/:id/verificar-nivel', async (req, res) => {
  const result = await verificarSubidaNivelPokemon(req.params.id);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Verificar subida de nivel del jugador
app.post('/api/jugador/verificar-nivel', async (req, res) => {
  const result = await verificarSubidaNivelJugador();

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Obtener info de nivel de un Pokémon
app.get('/api/jugador/pokemons/:id/nivel', async (req, res) => {
  const info = await getInfoNivelPokemon(req.params.id);

  if (!info) {
    return res.status(404).json({ error: 'Pokemon not found' });
  }

  res.json(info);
});

// Obtener info de nivel del jugador
app.get('/api/jugador/nivel', async (req, res) => {
  const info = await getInfoNivelJugador();

  if (!info) {
    return res.status(404).json({ error: 'Jugador not found' });
  }

  res.json(info);
});

// ==================== EVOLUCIONES ====================

// Verificar si un Pokémon puede evolucionar
app.get('/api/jugador/pokemons/:id/puede-evolucionar', async (req, res) => {
  const result = await puedeEvolucionar(req.params.id);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Evolucionar un Pokémon
app.post('/api/jugador/pokemons/:id/evolucionar', async (req, res) => {
  const result = await evolucionarPokemon(req.params.id);

  if (result.error || !result.evolucionado) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// ==================== INICIALIZACIÓN ====================

// Obtener Pokémon starters disponibles
app.get('/api/inicializar/starters', async (req, res) => {
  const starters = await getStartersDisponibles();
  res.json(starters);
});

// Inicializar juego con un starter
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

// Reiniciar juego (BORRAR TODO)
app.post('/api/reiniciar', async (req, res) => {
  const result = await reiniciarJuego();
  res.json(result);
});

app.put('/api/jugador/pokemons/:id/apodo', async (req, res) => {
    const { apodo } = req.body;
    const resultado = await cambiarApodo(req.params.id, apodo);
    res.json(resultado);
});

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});