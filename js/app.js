// Main application entry point - initializes and wires up the app
import { router } from "./router.js";
import {
  initializePagination,
  goToPreviousPage,
  goToNextPage,
  handleSearch,
  handleTypeFilter,
} from "./views/ListView.js";

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

  // Event listener for type filter
  const typeFilter = document.getElementById("type-filter");
  typeFilter.addEventListener("change", handleTypeFilter);
});
