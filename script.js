const pokemonCache = {};

async function fetchPokemon(id) {
  const pokemonNameElement = document.getElementById("pokemon-name");
  const pokemonImageElement = document.getElementById("pokemon-image");
  // Check if we already cached the given Pokemon
  if (pokemonCache[id]) {
    return pokemonCache[id];
  }

  // Fetch and cache it if it is not already in the cache
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const pokemon = await response.json();
  pokemonCache[id] = pokemon;

  pokemonNameElement.textContent = pokemon.name;
  pokemonImageElement.src = pokemon.sprites.front_default;
  pokemonImageElement.alt = pokemon.name;

  return pokemon;
}

fetchPokemon(1);
