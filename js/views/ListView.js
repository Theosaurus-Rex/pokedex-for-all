// List View - handles rendering and interaction for the Pokemon list page
import {
  fetchPokemonList,
  fetchPokemon,
  fetchAllPokemonNames,
} from "../services/pokemonService.js";
import { createPokemonCard } from "../components/PokemonCard.js";
import { getPokemonIdFromUrl } from "../utils/helpers.js";
import {
  currentPage,
  totalPages,
  POKEMON_PER_PAGE,
  setCurrentPage,
  setTotalPages,
  setIsSearchActive,
  isSearchActive,
} from "../state.js";

export function showListView() {
  document.getElementById("list-view").style.display = "flex";
  document.getElementById("detail-view").style.display = "none";
  window.scrollTo(0, 0);
}

// Initialise pagination and render first page of pokemon
export async function initializePagination() {
  try {
    // Get total pokemon count to calculate number of pages
    const initialData = await fetchPokemonList(0, 1);
    const totalPokemon = Math.min(initialData.count, 151);
    const pages = Math.ceil(totalPokemon / POKEMON_PER_PAGE);
    setTotalPages(pages);

    await renderCurrentPage();
    updatePaginationControls();
  } catch (error) {
    console.error("Error initialising page:", error);
  }
}

export function updatePaginationControls() {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const pageInfo = document.getElementById("page-info");

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

export async function goToPreviousPage() {
  if (currentPage > 1) {
    setCurrentPage(currentPage - 1);
    await renderCurrentPage();
    updatePaginationControls();
  }
}

export async function goToNextPage() {
  if (currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
    await renderCurrentPage();
    updatePaginationControls();
  }
}

// Render the current page of Pokemon index cards
export async function renderCurrentPage() {
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

export async function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase().trim();
  if (searchTerm === "") {
    // Return normal pagination when search is cleared
    setIsSearchActive(false);
    await renderCurrentPage();
    updatePaginationControls();
    return;
  }

  setIsSearchActive(true);
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
