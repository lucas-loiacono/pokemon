const { Pool } = require('pg');

//const pool = new Pool({
//  connectionString: 'postgresql://neondb_owner:npg_LXJPI0oZf5Qv@ep-solitary-river-ai21ihv6-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
//  ssl: {
//    rejectUnauthorized: false
//  }
//});


//Para correrlo en localhos
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pokemon',
  password: 'postgres',
  port: 5432,
});

const TOTAL_POKEMON = 1025;
const BATCH_SIZE = 100;

function getGeneracion(id) {
  if (id <= 151) return 1;
  if (id <= 251) return 2;
  if (id <= 386) return 3;
  if (id <= 493) return 4;
  if (id <= 649) return 5;
  if (id <= 721) return 6;
  if (id <= 809) return 7;
  if (id <= 905) return 8;
  return 9;
}

// Mapeo de nombres de tipos de inglés a español
const tipoMap = {
  'normal': 'Normal',
  'fire': 'Fuego',
  'water': 'Agua',
  'grass': 'Planta',
  'electric': 'Eléctrico',
  'ice': 'Hielo',
  'fighting': 'Lucha',
  'poison': 'Veneno',
  'ground': 'Tierra',
  'flying': 'Volador',
  'psychic': 'Psíquico',
  'bug': 'Bicho',
  'rock': 'Roca',
  'ghost': 'Fantasma',
  'dragon': 'Dragón',
  'dark': 'Siniestro',
  'steel': 'Acero',
  'fairy': 'Hada'
};

async function fetchPokemon(id) {
  try {
    // Obtener datos básicos del Pokémon
    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!pokemonResponse.ok) throw new Error(`HTTP error! status: ${pokemonResponse.status}`);
    const pokemonData = await pokemonResponse. json();
    
    // Obtener species para la descripción en español
    const speciesResponse = await fetch(pokemonData.species.url);
    const speciesData = await speciesResponse.json();
    
    // Buscar descripción en español
    const descripcionEntry = speciesData.flavor_text_entries.find(
      entry => entry.language. name === 'es'
    );
    const descripcion = descripcionEntry 
      ? descripcionEntry.flavor_text. replace(/\n|\f/g, ' ').trim()
      : null;
    
    // Obtener tipos y mapearlos a español
    const tipos = pokemonData.types.map(t => ({
      nombre: tipoMap[t.type.name] || t.type.name, // Mapear a español
      orden: t.slot // 1 o 2
    }));
    
    return {
      pokedex_id: id,
      nombre: pokemonData.name,
      descripcion: descripcion,
      imagen_url: pokemonData.sprites.front_default,
      tipos: tipos
    };
  } catch (error) {
    console.error(`❌ Error fetching Pokémon ${id}:`, error.message);
    return null;
  }
}

async function getTipoId(client, nombreTipo) {
  const result = await client.query(
    'SELECT id FROM tipos WHERE nombre = $1',
    [nombreTipo]
  );
  return result.rows[0]?.id;
}

async function insertBatch(pokemons) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const pokemon of pokemons) {
      if (! pokemon) continue;
      
      // Insertar el Pokémon
      const pokemonResult = await client.query(`
        INSERT INTO pokemons (pokedex_id, nombre, descripcion, imagen_url)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (pokedex_id) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          descripcion = EXCLUDED.descripcion,
          imagen_url = EXCLUDED.imagen_url
        RETURNING id
      `, [
        pokemon.pokedex_id,
        pokemon.nombre,
        pokemon.descripcion,
        pokemon.imagen_url
      ]);
      
      const pokemonId = pokemonResult. rows[0].id;
      
      // Eliminar tipos anteriores (por si es una actualización)
      await client.query('DELETE FROM pokemon_tipos WHERE pokemon_id = $1', [pokemonId]);
      
      // Insertar los tipos del Pokémon
      for (const tipo of pokemon.tipos) {
        const tipoId = await getTipoId(client, tipo.nombre);
        
        if (tipoId) {
          await client.query(`
            INSERT INTO pokemon_tipos (pokemon_id, tipo_id, orden)
            VALUES ($1, $2, $3)
            ON CONFLICT (pokemon_id, tipo_id) DO UPDATE SET orden = EXCLUDED.orden
          `, [pokemonId, tipoId, tipo.orden]);
        }
      }
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function seedPokemons() {
  const startTime = Date.now();
  console.log('🔄 Iniciando carga de Pokémon desde PokeAPI...');
  console.log(`📦 Total a cargar: ${TOTAL_POKEMON} Pokémon\n`);
  
  let totalCargados = 0;
  let totalErrores = 0;
  
  for (let i = 1; i <= TOTAL_POKEMON; i += BATCH_SIZE) {
    const batchStart = Date.now();
    const promises = [];
    
    for (let id = i; id < i + BATCH_SIZE && id <= TOTAL_POKEMON; id++) {
      promises.push(fetchPokemon(id));
    }
    
    const batch = await Promise.all(promises);
    const pokemonsValidos = batch.filter(p => p !== null);
    
    if (pokemonsValidos. length > 0) {
      await insertBatch(pokemonsValidos);
      totalCargados += pokemonsValidos.length;
    }
    
    totalErrores += batch.length - pokemonsValidos.length;
    
    const batchTime = ((Date.now() - batchStart) / 1000).toFixed(2);
    const progreso = Math.min(i + BATCH_SIZE - 1, TOTAL_POKEMON);
    const porcentaje = ((progreso / TOTAL_POKEMON) * 100).toFixed(1);
    
    console.log(`✅ ${progreso}/${TOTAL_POKEMON} (${porcentaje}%) - ${batchTime}s`);
    
    // Delay para no saturar la API (2 requests por Pokémon:  pokemon + species)
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n🎉 ¡Carga completada! ');
  console.log(`📊 Resumen:`);
  console.log(`   - Total cargados: ${totalCargados}`);
  console.log(`   - Total errores: ${totalErrores}`);
  console.log(`   - Tiempo total: ${totalTime}s`);
  
  await pool.end();
}

seedPokemons().catch(error => {
  console.error('💥 Error fatal:', error);
  pool.end();
  process.exit(1);
});