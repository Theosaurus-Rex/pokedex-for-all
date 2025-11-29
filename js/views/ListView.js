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
  selectedType,
  setSelectedType,
  setIsTypeFilterActive,
  isTypeFilterActive,
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

  // Disable pagination when search or type filter is active
  if (isSearchActive || isTypeFilterActive) {
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    pageInfo.textContent = "Showing filtered results";
    return;
  }

  // Normal pagination controls
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
    // Return normal pagination or type filter when search is cleared
    setIsSearchActive(false);

    // If type filter is active, re-apply it, otherwise show normal pagination
    if (isTypeFilterActive) {
      await performTypeFilter(selectedType);
    } else {
      await renderCurrentPage();
      updatePaginationControls();
    }
    return;
  }

  setIsSearchActive(true);

  // If type filter is active, search within filtered results
  if (isTypeFilterActive) {
    await performCombinedFilter(selectedType, searchTerm);
  } else {
    await performSearch(searchTerm);
  }

  updatePaginationControls();
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

export async function handleTypeFilter(event) {
  const typeValue = event.target.value.toLowerCase().trim();

  if (typeValue === "") {
    // Return to normal pagination when filter is cleared
    setIsTypeFilterActive(false);
    setSelectedType("");
    // If search is active, re-run the search, otherwise show normal pagination
    if (isSearchActive) {
      const searchInput = document.getElementById("pokemon-search");
      await performSearch(searchInput.value.toLowerCase().trim());
    } else {
      await renderCurrentPage();
      updatePaginationControls();
    }
    return;
  }

  setIsTypeFilterActive(true);
  setSelectedType(typeValue);

  // If search is active, filter by both type and search term
  if (isSearchActive) {
    const searchInput = document.getElementById("pokemon-search");
    await performCombinedFilter(
      typeValue,
      searchInput.value.toLowerCase().trim(),
    );
  } else {
    await performTypeFilter(typeValue);
  }

  updatePaginationControls();
}

async function performTypeFilter(type) {
  const loadingElement = document.getElementById("loading");
  const pokemonListContainer = document.getElementById("pokemon-list");

  loadingElement.style.display = "block";
  pokemonListContainer.innerHTML = "";

  try {
    // Fetch Pokemon of the selected type from PokeAPI
    const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    const typeData = await response.json();

    // Filter to only include Gen 1 Pokemon (IDs 1-151)
    const gen1Pokemon = typeData.pokemon
      .map((p) => {
        const id = getPokemonIdFromUrl(p.pokemon.url);
        return { ...p.pokemon, id };
      })
      .filter((p) => p.id >= 1 && p.id <= 151);

    loadingElement.style.display = "none";

    if (gen1Pokemon.length === 0) {
      pokemonListContainer.innerHTML =
        '<p class="no-results">No Generation 1 Pokémon found with this type.</p>';
      return;
    }

    // Fetch and display matching Pokemon
    const pokemonPromises = gen1Pokemon.map((pokemon) =>
      fetchPokemon(pokemon.id),
    );
    const pokemonData = await Promise.all(pokemonPromises);

    pokemonData.forEach((pokemon) => {
      const card = createPokemonCard(pokemon);
      pokemonListContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error filtering by type:", error);
    loadingElement.textContent = "Error filtering Pokémon. Please try again.";
  }
}

async function performCombinedFilter(type, searchTerm) {
  const loadingElement = document.getElementById("loading");
  const pokemonListContainer = document.getElementById("pokemon-list");

  loadingElement.style.display = "block";
  pokemonListContainer.innerHTML = "";

  try {
    // Fetch Pokemon of the selected type from PokeAPI
    const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    const typeData = await response.json();

    // Filter to only include Gen 1 Pokemon (IDs 1-151) that match search term
    const gen1Pokemon = typeData.pokemon
      .map((p) => {
        const id = getPokemonIdFromUrl(p.pokemon.url);
        return { ...p.pokemon, id };
      })
      .filter((p) => p.id >= 1 && p.id <= 151)
      .filter((p) => p.name.toLowerCase().includes(searchTerm));

    loadingElement.style.display = "none";

    if (gen1Pokemon.length === 0) {
      pokemonListContainer.innerHTML =
        '<p class="no-results">No Pokémon found matching your search and type filter.</p>';
      return;
    }

    // Fetch and display matching Pokemon
    const pokemonPromises = gen1Pokemon.map((pokemon) =>
      fetchPokemon(pokemon.id),
    );
    const pokemonData = await Promise.all(pokemonPromises);

    pokemonData.forEach((pokemon) => {
      const card = createPokemonCard(pokemon);
      pokemonListContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error filtering:", error);
    loadingElement.textContent = "Error filtering Pokémon. Please try again.";
  }
}
