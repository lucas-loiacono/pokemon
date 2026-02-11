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

async function getAllPokemons() {
  const result = await dbClient.query(`
    SELECT 
      p.id,
      p.pokedex_id,
      p.nombre,
      p.imagen_url,
      ARRAY_AGG(t.nombre ORDER BY pt.orden) as tipos
    FROM pokemons p
    INNER JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
    INNER JOIN tipos t ON pt.tipo_id = t.id
    GROUP BY p.id, p.pokedex_id, p.nombre, p.imagen_url
    ORDER BY p.pokedex_id
  `);
  return result.rows;
}

async function getOnePokemon(id) {
  const result = await dbClient.query(`
    SELECT 
      p.id,
      p.pokedex_id,
      p.nombre,
      p.imagen_url,
      ARRAY_AGG(t.nombre ORDER BY pt.orden) as tipos
    FROM pokemons p
    INNER JOIN pokemon_tipos pt ON p.id = pt.pokemon_id
    INNER JOIN tipos t ON pt.tipo_id = t.id
    WHERE p.id = $1
    GROUP BY p.id, p.pokedex_id, p.nombre, p.imagen_url
  `, [id]);
  return result.rows[0];
}

async function createPokemon(pokedex_id, nombre, imagen_url) { 
  const result = await dbClient.query(
    'INSERT INTO pokemons (pokedex_id, nombre, imagen_url) VALUES ($1, $2, $3) RETURNING *', 
    [pokedex_id, nombre, imagen_url]
  );
  
  console.log("result", result.rows[0]);

  if (result.rowCount === 0) {
    return undefined;
  }
  return result.rows[0];
}

async function updatePokemon(id, nombre, imagen_url) {
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (nombre) {
    updates.push(`nombre = $${paramCount++}`);
    values.push(nombre);
  }

  if (imagen_url) {
    updates.push(`imagen_url = $${paramCount++}`);
    values.push(imagen_url);
  }

  if (updates.length === 0) {
    return undefined;
  }

  values.push(id);

  const result = await dbClient.query(
    `UPDATE pokemons SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  if (result.rowCount === 0) {
    return undefined;
  }
  return result.rows[0];
}

async function deletePokemon(id) {
  const result = await dbClient.query('DELETE FROM pokemons WHERE id = $1 RETURNING *', [id]);

  if (result.rowCount === 0) {
    return undefined;
  }
  return result.rows[0];
}

module.exports = {
  getAllPokemons,
  getOnePokemon,
  createPokemon,
  updatePokemon,
  deletePokemon,
};