// API service for fetching Pokemon data from PokeAPI
import { pokemonCache, allPokemonNames, setAllPokemonNames } from "../state.js";

export async function fetchPokemon(id) {
  // Check if we already cached the given Pokemon
  if (pokemonCache[id]) {
    return pokemonCache[id];
  }

  // Fetch and cache it if it is not already in the cache
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const pokemon = await response.json();
  pokemonCache[id] = pokemon;

  return pokemon;
}

export async function fetchPokemonList(offset = 0, limit = 20) {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`,
  );
  const pokemonList = await response.json();
  console.log(pokemonList.results);
  return {
    results: pokemonList.results,
    count: pokemonList.count,
  };
}

// Fetch all Pokemon names for searching
export async function fetchAllPokemonNames() {
  // Return cached names if already fetched
  if (allPokemonNames.length > 0) {
    return allPokemonNames;
  }

  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
  const data = await response.json();
  const names = data.results.map((pokemon, index) => ({
    name: pokemon.name,
    id: index + 1,
    url: pokemon.url,
  }));

  setAllPokemonNames(names);
  return names;
}
