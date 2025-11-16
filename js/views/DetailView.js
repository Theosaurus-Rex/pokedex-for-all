// Detail View - handles rendering for the Pokemon detail page
import { fetchPokemon } from "../services/pokemonService.js";

export async function showDetailView(pokemonId) {
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
              <button class="back-button" onclick="window.location.hash =
  '#/'">←
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
              <img src="${imageUrl}" alt="${pokemon.name}"
  class="detail-image">
              <div class="detail-info">
                <h1 class="detail-name">${pokemon.name}</h1>
                <p class="detail-id">#${pokemon.id
                  .toString()
                  .padStart(3, "0")}</p>
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
