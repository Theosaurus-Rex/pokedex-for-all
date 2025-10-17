const pokemonCache = {};

const POKEMON_PER_PAGE = 20;
let currentPage = 1;
let totalPages = 1;
let allPokemonList = [];

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

async function fetchPokemonList(offset = 0, limit = 20) {
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

// Initialise pagination and render first page of pokemon
async function initializePagination() {
  try {
    // Get total pokemon count to calculate number of pages
    const initialData = await fetchPokemonList(0, 1);
    const totalPokemon = Math.min(initialData.count, 151);
    totalPages = Math.ceil(totalPokemon / POKEMON_PER_PAGE);

    await renderCurrentPage();
    updatePaginationControls();
  } catch (error) {
    console.error("Error initialising page:", error);
  }
}

function updatePaginationControls() {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const pageInfo = document.getElementById("page-info");

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

async function goToPreviousPage() {
  if (currentPage > 1) {
    currentPage--;
    await renderCurrentPage();
    updatePaginationControls();
  }
}

async function goToNextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    await renderCurrentPage();
    updatePaginationControls();
  }
}

// Render the current page of Pokemon index cards
async function renderCurrentPage() {
  const pokemonListContainer = document.getElementById("pokemon-list");
  const loadingElement = document.getElementById("loading");

  loadingElement.style.display = "block";
  pokemonListContainer.innerHTML = "";

  try {
    const offset = (currentPage - 1) * POKEMON_PER_PAGE;
    const pokemonData = await fetchPokemonList(offset, POKEMON_PER_PAGE);

    // Retrieve data for each individual pokemon record on the page
    const pokemonPromises = pokemonData.results.map(async (pokemonItem) => {
      const id = getPokemonIdFromUrl(pokemonItem.url);
      return await fetchPokemon(id);
    });

    const currentPagePokemon = await Promise.all(pokemonPromises);

    // Clear loading state
    loadingElement.style.display = "none";

    // Render fetched pokemon's cards
    currentPagePokemon.forEach((pokemon) => {
      const card = createPokemonCard(pokemon);
      pokemonListContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error Loading Pokemon", error);
    loadingElement.textContent =
      "Error loading Pokémon. Please refresh the page and try again.";
  }
}

// Initialise the app when the page loads
document.addEventListener("DOMContentLoaded", () => {
  initializePagination();

  // Event listeners for pagination buttons
  document
    .getElementById("prev-btn")
    .addEventListener("click", goToPreviousPage);
  document.getElementById("next-btn").addEventListener("click", goToNextPage);
});
