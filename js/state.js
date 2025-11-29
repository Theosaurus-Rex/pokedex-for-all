// State management for the Pokedex app
export const pokemonCache = {};

export const POKEMON_PER_PAGE = 20;
export let currentPage = 1;
export let totalPages = 1;
export let allPokemonList = [];
export let allPokemonNames = [];
export let isSearchActive = false;
export let selectedType = "";
export let isTypeFilterActive = false;

// State updaters
export function setCurrentPage(page) {
  currentPage = page;
}

export function setTotalPages(pages) {
  totalPages = pages;
}

export function setIsSearchActive(active) {
  isSearchActive = active;
}

export function setAllPokemonNames(names) {
  allPokemonNames = names;
}

export function setSelectedType(type) {
  selectedType = type;
}

export function setIsTypeFilterActive(active) {
  isTypeFilterActive = active;
}
