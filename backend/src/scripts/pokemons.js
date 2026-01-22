const{Pool} = require('pg');

const dbClient = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pokemon',
  password: 'postgres',
  port: 5432,
});


async function getAllPokemons() {
  const result = await dbClient.query('SELECT * FROM pokemons');
  return result.rows;

}


async function getOnePokemon(id) {
  const result = await dbClient.query('SELECT * FROM pokemons where id=$1', [id]);
  return result.rows[0];
}


module.exports = {
  getAllPokemons,
   getOnePokemon,
}