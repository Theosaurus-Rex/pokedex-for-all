const pokemonCache = {};

const POKEMON_PER_PAGE = 20;
let currentPage = 1;
let totalPages = 1;
let allPokemonList = [];
let allPokemonNames = [];
let isSearchActive = false;

// Determine which page to show based on the URL hash
// NOTE: We're using hash-based routing for now due to not using a server
// This is fair game for refactoring if we decide to convert this app to using a server later
function router() {
  const hash = window.location.hash;

  if (hash === "" || hash === "#/" || hash === "#") {
    showListView();
  } else if (hash.startsWith("#/pokemon/")) {
    // Pull out numeric Pokemon ID from URL
    const pokemonId = hash.split("/")[2];
    // Number is in Gen 1-9 range
    if (isNaN(pokemonId) || pokemonId < 1 || pokemonId > 1025) {
      // Invalid ID - redirect to home
      console.warn(`Invalid Pokemon ID: ${pokemonId}`);
      window.location.hash = "#/";
    } else {
      showDetailView(pokemonId);
    }
  } else {
    // Invalid route - redirect to home
    window.location.hash = "#/";
  }
}

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

// Fetch all Pokemon names for searching
async function fetchAllPokemonNames() {
  // Return cached names if already fetched
  if (allPokemonNames.length > 0) {
    return allPokemonNames;
  }

  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
  const data = await response.json();
  allPokemonNames = data.results.map((pokemon, index) => ({
    name: pokemon.name,
    id: index + 1,
    url: pokemon.url,
  }));
  return allPokemonNames;
}
// Extract Pokemon ID from URL
function getPokemonIdFromUrl(url) {
  const segments = url.split("/");
  return segments[segments.length - 2];
}

// Create a Pokemon card element for the index list view
function createPokemonCard(pokemon) {
  const card = document.createElement("a");
  card.href = `#/pokemon/${pokemon.id}`;
  card.className = "pokemon-card";

  card.innerHTML = `
    <img class="pokemon-image" src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h2 class="pokemon-name">${pokemon.name}</h2>
    <p class="pokemon-id">#${pokemon.id.toString().padStart(3, "0")}</p>
  `;

  return card;
}

function showListView() {
  document.getElementById("list-view").style.display = "flex";
  document.getElementById("detail-view").style.display = "none";
  window.scrollTo(0, 0);
}

async function showDetailView(pokemonId) {
  document.getElementById("list-view").style.display = "none";
  document.getElementById("detail-view").style.display = "block";

  window.scrollTo(0, 0);

  document.getElementById("detail-view").innerHTML = `
    <div style="padding: 2rem; text-align: center;">
            <p>Loading Pokemon data...</p>
          </div>
    `;

  // Fetch Pokemon data to render details
  try {
    const pokemon = await fetchPokemon(pokemonId);
    renderPokemonDetail(pokemon);
  } catch (error) {
    console.error("Error fetching Pokemon:", error);

    // Determine error type for better messaging
    let errorMessage = "Could not load Pokemon data.";

    if (error.message.includes("404")) {
      errorMessage = `Pokemon #${pokemonId} does not exist.`;
    } else if (!navigator.onLine) {
      errorMessage = "You appear to be offline. Please check your connection.";
    }

    document.getElementById("detail-view").innerHTML = `
          <div class="detail-container" style="text-align: center;">
            <h2>Oops!</h2>
            <p>${errorMessage}</p>
            <button class="back-button" onclick="window.location.hash = '#/'">←
    Back to List</button>
          </div>
        `;
  }
}

function renderPokemonDetail(pokemon) {
  const imageUrl = pokemon.sprites.other["official-artwork"].front_default;
  const types = pokemon.types.map((t) => t.type.name);
  const stats = pokemon.stats.map((s) => ({
    name: s.stat.name,
    value: s.base_stat,
  }));
  const abilities = pokemon.abilities.map((a) => a.ability.name);
  const heightInMeters = (pokemon.height / 10).toFixed(1);
  const weightInKg = (pokemon.weight / 10).toFixed(1);

  // Render Pokemon Information
  const detailHTML = `
        <div class="detail-container">
          <button class="back-button" onclick="window.location.hash = '#/'">
            ← Back to List
          </button>

          <div class="detail-header">
            <img src="${imageUrl}" alt="${pokemon.name}" class="detail-image">
            <div class="detail-info">
              <h1 class="detail-name">${pokemon.name}</h1>
              <p class="detail-id">#${pokemon.id.toString().padStart(3, "0")}</p>
              <div class="detail-types">
                ${types
                  .map(
                    (type) => `<span class="type-badge
    type-${type}">${type}</span>`,
                  )
                  .join("")}
              </div>
            </div>
          </div>

          <div class="detail-body">
            <div class="detail-section">
              <h2>Physical Characteristics</h2>
              <p><strong>Height:</strong> ${heightInMeters} m</p>
              <p><strong>Weight:</strong> ${weightInKg} kg</p>
            </div>

            <div class="detail-section">
              <h2>Abilities</h2>
              <ul>
                ${abilities.map((ability) => `<li>${ability}</li>`).join("")}
              </ul>
            </div>

            <div class="detail-section">
              <h2>Base Stats</h2>
              ${stats
                .map(
                  (stat) => `
                <div class="stat-row">
                  <span class="stat-name">${stat.name}</span>
                  <div class="stat-bar-container">
                    <div class="stat-bar" style="width: ${
                      (stat.value / 255) * 100
                    }%"></div>
                  </div>
                  <span class="stat-value">${stat.value}</span>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        </div>
      `;

  document.getElementById("detail-view").innerHTML = detailHTML;
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

  // Listen for hash changes in the route (e.g. user clicks back/forward, or a link)
  window.addEventListener("hashchange", router);

  // Run router on initial page load
  window.addEventListener("DOMContentLoaded", router);

  // Event listeners for pagination buttons
  document
    .getElementById("prev-btn")
    .addEventListener("click", goToPreviousPage);
  document.getElementById("next-btn").addEventListener("click", goToNextPage);

  // Event listener for search input
  const searchInput = document.getElementById("pokemon-search");
  // Using input event rather than change will fire every time the user types a character
  searchInput.addEventListener("input", handleSearch);
});

async function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase().trim();
  if (searchTerm === "") {
    // Return normal pagination when search is cleared
    isSearchActive = false;
    await renderCurrentPage();
    updatePaginationControls();
    return;
  }

  isSearchActive = true;
  await performSearch(searchTerm);
}

async function performSearch(searchTerm) {
  const loadingElement = document.getElementById("loading");
  const pokemonListContainer = document.getElementById("pokemon-list");

  loadingElement.style.display = "block";
  pokemonListContainer.innerHTML = "";

  try {
    // Get all Pokemon names if not already cached
    const allNames = await fetchAllPokemonNames();

    // Filter Pokemon that match the search term
    const matchingPokemon = allNames.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm),
    );

    loadingElement.style.display = "none";

    if (matchingPokemon.length === 0) {
      pokemonListContainer.innerHTML =
        '<p class="no-results">No Pokémon found matching your search.</p>';
      return;
    }

    // Fetch and display matching Pokemon
    const pokemonPromises = matchingPokemon.map((pokemon) =>
      fetchPokemon(pokemon.id),
    );
    const pokemonData = await Promise.all(pokemonPromises);

    pokemonData.forEach((pokemon) => {
      const card = createPokemonCard(pokemon);
      pokemonListContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error performing search:", error);
    loadingElement.textContent = "Error performing search. Please try again.";
  }
}
