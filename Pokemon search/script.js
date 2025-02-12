const ITEMS_PER_PAGE = 15;
const API_BASE_URL = "https://pokeapi.co/api/v2/pokemon";

// DOM Elements
const pokemonGrid = document.getElementById("pokemonGrid");
const shimmerContainer = document.getElementById("shimmerContainer");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const infiniteScrollToggle = document.getElementById("infiniteScrollToggle");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");

// State
let currentPage = 1;
let isLoading = false;
let hasMore = true;
let infiniteScrollEnabled = false;
let pokemonCache = new Map();

const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && infiniteScrollEnabled && !isLoading && hasMore) {
      currentPage++;
      fetchPokemon();
    }
  },
  { threshold: 0.5 }
);

function createShimmerCards(count) {
  shimmerContainer.innerHTML = Array(count)
    .fill(`
      <div class="shimmer-card">
        <div class="shimmer-image"></div>
        <div class="shimmer-title"></div>
      </div>
    `).join('');
}

function createPokemonCard(pokemon) {
  const card = document.createElement("div");
  card.className = "pokemon-card";
  const imageUrl = pokemon.sprites?.front_default || "placeholder-image-url.png";
  card.innerHTML = `
    <img src="${imageUrl}" alt="${pokemon.name}" onerror="this.src='placeholder-image-url.png'">
    <h5>${pokemon.name}</h5>
  `;
  return card;
}

async function fetchPokemon() {
  if (isLoading) return;
  isLoading = true;
  showShimmerLoading(true);
  
  // Add a minimum delay to prevent flickering
  const minDelay = new Promise(resolve => setTimeout(resolve, 300));

  try {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    const [listData, pokemonDetails] = await Promise.all([
      fetch(`${API_BASE_URL}?limit=${ITEMS_PER_PAGE}&offset=${offset}`).then(response => response.json()),
      minDelay // Ensure minimum shimmer display time
    ]);
    console.log(listData);

    hasMore = !!listData.next;

    const pokemonPromises = listData.results.map(async (pokemon) => {
      if (pokemonCache.has(pokemon.url)) return pokemonCache.get(pokemon.url);
      try {
        const data = await fetch(pokemon.url).then(r => r.json());
        pokemonCache.set(pokemon.url, data);
        return data;
      } catch (error) {
        console.error(`Error fetching ${pokemon.name}:`, error);
        return null;
      }
    });

    // Fetch pokemon in batches to improve performance
    const batchSize = 5;
    const validPokemon = [];
    
    for (let i = 0; i < pokemonPromises.length; i += batchSize) {
      const batch = await Promise.all(pokemonPromises.slice(i, i + batchSize));
      batch.forEach(pokemon => {
        if (pokemon) validPokemon.push(pokemon);
      });
    }

    if (!infiniteScrollEnabled) pokemonGrid.innerHTML = "";

    validPokemon.forEach((pokemon, index) => {
      const card = createPokemonCard(pokemon);
      pokemonGrid.appendChild(card);
      if (index === validPokemon.length - 1) observer.observe(card);
    });

    updatePaginationButtons();
  } catch (error) {
    console.error("Error fetching Pokemon:", error);
    pokemonGrid.innerHTML = '<div class="error">Error loading Pokemon. Please try again later.</div>';
  } finally {
    await new Promise(resolve => setTimeout(resolve, 200)); 
    isLoading = false;
    showShimmerLoading(false);
    pokemonGrid.style.display = 'grid';
  }
}

function showShimmerLoading(show) {
  shimmerContainer.style.display = show ? "grid" : "none";
  if (show) {
    createShimmerCards(ITEMS_PER_PAGE);
    shimmerContainer.style.opacity = '1';
  } else {
    shimmerContainer.style.opacity = '0';
  }
}

function updatePaginationButtons() {
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = !hasMore;
}

// Event Listeners
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchPokemon();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

nextBtn.addEventListener("click", () => {
  if (hasMore) {
    currentPage++;
    fetchPokemon();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

infiniteScrollToggle.addEventListener("change", (e) => {
  infiniteScrollEnabled = e.target.checked;
  pagination.style.display = infiniteScrollEnabled ? "none" : "flex";
  pokemonGrid.innerHTML = "";
  currentPage = 1;
  fetchPokemon();
});

// Search functionality
let searchTimeout;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const searchTerm = e.target.value.toLowerCase().trim();
    if (searchTerm.length > 0) {
      showShimmerLoading(true);
      pokemonGrid.style.display = 'none';
      
      // Add minimum delay for shimmer
      const minDelay = new Promise(resolve => setTimeout(resolve, 300));

      try {
        const [response, _] = await Promise.all([
          fetch(`${API_BASE_URL}?limit=1000`),
          minDelay
        ]);
        const data = await response.json();
        
        const filteredPokemon = data.results.filter(pokemon => 
          pokemon.name.toLowerCase().includes(searchTerm)
        );

        if (filteredPokemon.length > 0) {
          pokemonGrid.innerHTML = "";
          // Process in batches
          const batchSize = 5;
          for (let i = 0; i < Math.min(filteredPokemon.length, ITEMS_PER_PAGE); i += batchSize) {
            const batch = filteredPokemon.slice(i, i + batchSize);
            const pokemonDetails = await Promise.all(
              batch.map(async (pokemon) => {
                if (pokemonCache.has(pokemon.url)) return pokemonCache.get(pokemon.url);
                const response = await fetch(pokemon.url);
                const pokemonData = await response.json();
                pokemonCache.set(pokemon.url, pokemonData);
                return pokemonData;
              })
            );
            pokemonDetails.forEach(pokemon => {
              pokemonGrid.appendChild(createPokemonCard(pokemon));
            });
          }
        } else {
          pokemonGrid.innerHTML = '<div class="error">No Pokemon found matching your search</div>';
        }
      } catch (error) {
        console.error("Error searching Pokemon:", error);
        pokemonGrid.innerHTML = '<div class="error">Error searching Pokemon</div>';
      } finally {
        await new Promise(resolve => setTimeout(resolve, 200)); // Smooth transition out
        showShimmerLoading(false);
        pokemonGrid.style.display = 'grid';
      }
    } else {
      currentPage = 1;
      fetchPokemon();
    }
  }, 300);
});

// Initial Load
document.addEventListener("DOMContentLoaded", fetchPokemon);