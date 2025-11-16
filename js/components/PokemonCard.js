// Create a Pokemon card element for the index list view
export function createPokemonCard(pokemon) {
  const card = document.createElement("a");
  card.href = `#/pokemon/${pokemon.id}`;
  card.className = "pokemon-card";

  card.innerHTML = `
      <img class="pokemon-image" src="${pokemon.sprites.front_default}"
  alt="${pokemon.name}">
      <h2 class="pokemon-name">${pokemon.name}</h2>
      <p class="pokemon-id">#${pokemon.id.toString().padStart(3, "0")}</p>
    `;

  return card;
}
