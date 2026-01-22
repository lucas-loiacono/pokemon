const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;


const{
    getAllPokemons,
    getOnePokemon,
    createPokemon,
    deletePokemon

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
app.post('/api/pokemons'), async (req, res) => {
    
    
    if (!req.body.nombre || !req.body.descripcion || !req.body.imagen_url) {                
        return res.status(400).json({ error: 'Missing required fields' });
  }


    const newPokemon = await createPokemon(req.body.nombre , req.body.descripcion, req.body.imagen_url);

    if (!newPokemon) {
        return res.status(500).json({ error: 'Failed to create pokemon' });
    }
    res.json(newPokemon);


}

app.delete('/api/pokemons/:id', async (req, res) => {
    const personaje = await deletePokemon(req.params.id);
    if (!personaje) {
      return res.status(404).json({ error: 'Pokemon not found' });
    }
    res.json({ message: 'Pokemon deleted successfully' });
    
})

//update pokemon

