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

async function cambiarApodo(jugadorPokemonId, nuevoApodo) {
    try {
        if (!nuevoApodo || nuevoApodo.trim() === '') {
            return { error: 'El apodo no puede estar vacío' };
        }

        const result = await dbClient.query('SELECT jugador_id FROM jugador_pokemons WHERE id = $1', [jugadorPokemonId]);
        if (result.rowCount === 0) return { error: 'Pokémon no encontrado' };
        
        

        await dbClient.query(
            'UPDATE jugador_pokemons SET apodo = $1 WHERE id = $2',
            [nuevoApodo.trim(), jugadorPokemonId]
        );

        return { 
            mensaje: 'Apodo actualizado', 
            apodo: nuevoApodo.trim() 
        };

    } catch (error) {
        console.error(error);
        return { error: 'Error al cambiar apodo' };
    }
}

module.exports = { cambiarApodo };