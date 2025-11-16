// Utility helper functions

// Extract Pokemon ID from URL
export function getPokemonIdFromUrl(url) {
  const segments = url.split("/");
  return segments[segments.length - 2];
}
