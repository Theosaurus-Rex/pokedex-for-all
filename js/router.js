// Router - handles hash-based routing for the application
import { showListView } from "./views/ListView.js";
import { showDetailView } from "./views/DetailView.js";

// Determine which page to show based on the URL hash
// NOTE: We're using hash-based routing for now due to not using a server
// This is fair game for refactoring if we decide to convert this app to using a server later
export function router() {
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
