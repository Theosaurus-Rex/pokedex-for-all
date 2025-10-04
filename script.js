const pokemonCache = {};

async function fetchPokemon(id) {
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

async function fetchPokemonList() {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
  const pokemonList = await response.json();
  console.log(pokemonList.results);
  return pokemonList.results;
}

// Extract Pokemon ID from URL
function getPokemonIdFromUrl(url) {
  const segments = url.split("/");
  return segments[segments.length - 2];
}

// Create a Pokemon card element for the index list view
function createPokemonCard(pokemon) {
  const card = document.createElement("div");
  card.className = "pokemon-card";
  card.innerHTML = `
    <img class="pokemon-image" src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h2 class="pokemon-name">${pokemon.name}</h2>
    <p class="pokemon-id">#${pokemon.id.toString().padStart(3, "0")}</p>
  `;
  return card;
}

// Render all Pokemon cards for index view
async function renderPokemonCards() {
  const pokemonListContainer = document.getElementById("pokemon-list");
  const loadingElement = document.getElementById("loading");

  loadingElement.style.display = "block";

  try {
    const pokemonList = await fetchPokemonList();

    // Fetch the data for each individual Pokemon
    const pokemonPromises = pokemonList.map(async (pokemonItem) => {
      const id = getPokemonIdFromUrl(pokemonItem.url);
      return await fetchPokemon(id);
    });

    const allPokemon = await Promise.all(pokemonPromises);

    // Clear loading state and render cards in index view
    loadingElement.style.display = "none";
    pokemonListContainer.innerHTML = "";

    allPokemon.forEach((pokemon) => {
      const card = createPokemonCard(pokemon);
      pokemonListContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error Loading Pokemon:", error);
    loadingElement.textContent =
      "Error loading Pokémon. Please refresh the page and try again.";
  }
}

// Initialise the app when the page loads
document.addEventListener("DOMContentLoaded", () => {
  renderPokemonCards();
});
