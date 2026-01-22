const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;


const{
    getAllPokemons,
    getOnePokemon,

} = require('./scripts/pokemons');



// Health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});


//pokemons
//get all pokemons
app.get('/api/pokemons', async (req, res) => {
  const pokemons = await getAllPokemons();
    res.json(pokemons);
});

//get pokemon by id
app.get('/api/pokemons/:id', async (req, res) => {
  const pokemon = await getOnePokemon(req.params.id);
  if (!pokemon) {
    return res.status(404).json({ error: 'Pokemon not found' });
  }
  res.json(pokemon);
});

//insert new pokemon 
app.post('/api/pokemons', (req, res) => {
  const newPokemon = req.body;
})

//delete pokemon
app.delete('/api/pokemons/:id', (req, res) => {
  const { id } = req.params;
  // Logic to delete pokemon by id
  res.json({ message: `Pokemon with id ${id} deleted` });
})

//update pokemon
app.put('/api/pokemons/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  // Logic to update pokemon by id
  res.json({ message: `Pokemon with id ${id} updated`, updatedData });
});

