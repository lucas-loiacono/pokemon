const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_LXJPI0oZf5Qv@ep-solitary-river-ai21ihv6-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});
//localhost

//const pool = new Pool({
//  user: 'postgres',
//  host: 'localhost',
//  database: 'pokemon',
//  password: 'postgres',
//  port: 5432,
//});

// NIVELES FIJOS DE EVOLUCIÓN
const NIVEL_ETAPA_1_A_2 = 10;  // Primera evolución
const NIVEL_ETAPA_2_A_3 = 20;  // Segunda evolución

async function getPokemonIdByPokedexId(client, pokedexId) {
  const result = await client.query(
    'SELECT id FROM pokemons WHERE pokedex_id = $1',
    [pokedexId]
  );
  return result.rows[0]?.id;
}

async function fetchEvolutionChain(speciesUrl) {
  try {
    const speciesResponse = await fetch(speciesUrl);
    const speciesData = await speciesResponse.json();
    
    const evolutionChainUrl = speciesData.evolution_chain.url;
    const evolutionResponse = await fetch(evolutionChainUrl);
    const evolutionData = await evolutionResponse.json();
    
    return evolutionData.chain;
  } catch (error) {
    console.error(`❌ Error fetching evolution chain:`, error.message);
    return null;
  }
}

function parseEvolutionChain(chain) {
  const evoluciones = [];
  
  function traverse(current, etapa) {
    if (current.evolves_to && current.evolves_to.length > 0) {
      for (const evolution of current.evolves_to) {
        // Obtener Pokedex ID del Pokémon actual
        const pokedexIdActual = parseInt(current.species.url.split('/').slice(-2, -1)[0]);
        
        // Obtener Pokedex ID del Pokémon siguiente
        const pokedexIdSiguiente = parseInt(evolution.species.url.split('/').slice(-2, -1)[0]);
        
        // Determinar nivel requerido según la etapa
        const nivelRequerido = etapa === 1 ? NIVEL_ETAPA_1_A_2 : NIVEL_ETAPA_2_A_3;
        
        evoluciones.push({
          pokedex_id: pokedexIdActual,
          etapa_actual: etapa,
          nivel_requerido: nivelRequerido,
          pokedex_id_siguiente: pokedexIdSiguiente,
          etapa_siguiente: etapa + 1
        });
        
        // Continuar con las siguientes evoluciones
        traverse(evolution, etapa + 1);
      }
    }
  }
  
  traverse(chain, 1);
  return evoluciones;
}

async function insertEvoluciones(client, evoluciones) {
  for (const evo of evoluciones) {
    // Obtener IDs internos de la DB usando pokedex_id
    const pokemonId = await getPokemonIdByPokedexId(client, evo.pokedex_id);
    const siguienteId = await getPokemonIdByPokedexId(client, evo.pokedex_id_siguiente);
    
    if (pokemonId && siguienteId) {
      try {
        await client.query(`
          INSERT INTO evoluciones (pokemon_id, etapa_actual, nivel_requerido, pokemon_id_siguiente, etapa_siguiente)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (pokemon_id, etapa_actual) DO UPDATE SET
            nivel_requerido = EXCLUDED.nivel_requerido,
            pokemon_id_siguiente = EXCLUDED.pokemon_id_siguiente,
            etapa_siguiente = EXCLUDED.etapa_siguiente
        `, [pokemonId, evo.etapa_actual, evo.nivel_requerido, siguienteId, evo.etapa_siguiente]);
      } catch (error) {
        console.error(`❌ Error insertando evolución ${evo.pokedex_id} -> ${evo.pokedex_id_siguiente}:`, error.message);
      }
    }
  }
}

async function seedEvoluciones() {
  const startTime = Date.now();
  console.log('🔄 Iniciando carga de evoluciones desde PokeAPI...');
  console.log(`📋 Niveles de evolución:`);
  console.log(`   - Etapa 1 → 2: Nivel ${NIVEL_ETAPA_1_A_2}`);
  console.log(`   - Etapa 2 → 3: Nivel ${NIVEL_ETAPA_2_A_3}\n`);
  
  const client = await pool.connect();
  let totalProcesados = 0;
  let totalEvoluciones = 0;
  const cadenasProcesadas = new Set();
  
  try {
    const TOTAL_SPECIES = 1025;
    
    for (let i = 1; i <= TOTAL_SPECIES; i++) {
      try {
        const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${i}`;
        const chain = await fetchEvolutionChain(speciesUrl);
        
        if (chain) {
          // Obtener ID de la cadena evolutiva para evitar duplicados
          const chainId = chain.species.url;
          
          // Solo procesar si no hemos visto esta cadena antes
          if (!cadenasProcesadas.has(chainId)) {
            cadenasProcesadas.add(chainId);
            
            const evoluciones = parseEvolutionChain(chain);
            
            if (evoluciones.length > 0) {
              await insertEvoluciones(client, evoluciones);
              totalEvoluciones += evoluciones.length;
            }
          }
        }
        
        totalProcesados++;
        
        if (totalProcesados % 100 === 0) {
          const progreso = ((totalProcesados / TOTAL_SPECIES) * 100).toFixed(1);
          console.log(`✅ ${totalProcesados}/${TOTAL_SPECIES} (${progreso}%) - ${totalEvoluciones} evoluciones cargadas`);
        }
        
        // Delay para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error procesando especie ${i}:`, error.message);
      }
    }
    
  } finally {
    client.release();
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n🎉 ¡Carga de evoluciones completada!');
  console.log(`📊 Resumen:`);
  console.log(`   - Especies procesadas: ${totalProcesados}`);
  console.log(`   - Cadenas evolutivas únicas: ${cadenasProcesadas.size}`);
  console.log(`   - Evoluciones cargadas: ${totalEvoluciones}`);
  console.log(`   - Tiempo total: ${totalTime}s`);
  
  await pool.end();
}

seedEvoluciones().catch(error => {
  console.error('💥 Error fatal:', error);
  pool.end();
  process.exit(1);
});