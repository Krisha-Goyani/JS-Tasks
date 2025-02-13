const ITEMS_PER_PAGE = 10;
const PRELOAD_THRESHOLD = 3;
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
let preloadedData = [];
let isInitialLoad = true;
let loadedPokemon = new Set(); // Track already loaded Pokemon
let isFetching = false; // Additional flag to prevent parallel fetches

const observer = new IntersectionObserver(
  (entries) => {
    if (
      entries[0].isIntersecting &&
      infiniteScrollEnabled &&
      !isLoading &&
      (hasMore || preloadedData.length > 0)
    ) {
      currentPage++;
      fetchPokemon(true);
    }
  },
  {
    threshold: 0.1,
    rootMargin: "300px",
  }
);

function createShimmerCards(count) {
  shimmerContainer.innerHTML = Array(count)
    .fill(
      `
      <div class="shimmer-card">
        <div class="shimmer-image"></div>
        <div class="shimmer-title"></div>
      </div>
    `
    )
    .join("");
}

function createPokemonCard(pokemon) {
  const card = document.createElement("div");
  card.className = "pokemon-card";
  const imageUrl =
    pokemon.sprites?.front_default || "placeholder-image-url.png";
  card.innerHTML = `
    <img src="${imageUrl}" alt="${pokemon.name}" onerror="this.src='placeholder-image-url.png'">
    <h5>${pokemon.name}</h5>
  `;
  return card;
}

async function preloadNextPages() {
  if (!infiniteScrollEnabled || !isLoading || !hasMore) return;
  
  try {
    // Only fetch one next page instead of multiple
    const nextPage = currentPage + 1;
    const offset = nextPage * ITEMS_PER_PAGE;
    
    // Check if we're within the API limit and don't already have this data
    if (offset < 1000 && preloadedData.length < ITEMS_PER_PAGE * 2) {
      const response = await fetch(`${API_BASE_URL}?limit=${ITEMS_PER_PAGE}&offset=${offset}`);
      const data = await response.json();
      preloadedData = [...preloadedData, ...data.results];
    }
  } catch (error) {
    console.error("Error preloading Pokemon:", error);
  }
}

async function fetchPokemon(isInfiniteScroll = false) {
  if (isLoading) return;
  isLoading = true;
  showShimmerLoading(!isInfiniteScroll);

  try {
    let listData;
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    if (isInfiniteScroll && preloadedData.length >= ITEMS_PER_PAGE) {
      listData = {
        results: preloadedData.slice(0, ITEMS_PER_PAGE),
        next: preloadedData.length > ITEMS_PER_PAGE || offset + ITEMS_PER_PAGE < 1000
      };
      preloadedData = preloadedData.slice(ITEMS_PER_PAGE);
    } else {
      pokemonGrid.style.display = 'none';
      listData = await fetch(`${API_BASE_URL}?limit=${ITEMS_PER_PAGE}&offset=${offset}`)
        .then(response => response.json());
    }

    hasMore = !!listData.next;

    if (!isInfiniteScroll) {
      pokemonGrid.innerHTML = "";
    }

    // Track this page as loaded
    loadedPokemon.add(offset);

    const fragment = document.createDocumentFragment();
    listData.results.forEach((pokemon, index) => {
      const pokemonId = pokemon.url.split("/").slice(-2, -1)[0];
      const card = document.createElement("div");
      card.className = "pokemon-card";
      const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;

      card.innerHTML = `
        <img src="${imageUrl}" alt="${pokemon.name}" loading="lazy" onerror="this.src='placeholder-image-url.png'">
        <h5>${pokemon.name}</h5>
      `;

      fragment.appendChild(card);
      if (index === listData.results.length - 1 && infiniteScrollEnabled) {
        observer.disconnect();
        observer.observe(card);
      }
    });

    pokemonGrid.appendChild(fragment);
    updatePaginationButtons();

    // Only preload if we're running low on preloaded data
    if (infiniteScrollEnabled && preloadedData.length < ITEMS_PER_PAGE) {
      preloadNextPages();
    }
  } catch (error) {
    console.error("Error fetching Pokemon:", error);
    if (!isInfiniteScroll) {
      pokemonGrid.innerHTML = '<div class="error">Error loading Pokemon. Please try again later.</div>';
    }
  } finally {
    isLoading = false;
    showShimmerLoading(false);
    pokemonGrid.style.display = 'grid';
  }
}

function showShimmerLoading(show) {
  shimmerContainer.style.display = show ? "grid" : "none";
  if (show) {
    createShimmerCards(ITEMS_PER_PAGE);
    shimmerContainer.style.opacity = "1";
  } else {
    shimmerContainer.style.opacity = "0";
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
  preloadedData = [];
  currentPage = 1;
  isInitialLoad = true;
  observer.disconnect();
  showShimmerLoading(true);
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
      pokemonGrid.style.display = "none";

      const minDelay = new Promise((resolve) => setTimeout(resolve, 300));

      try {
        const [response, _] = await Promise.all([
          fetch(`${API_BASE_URL}?limit=1000`),
          minDelay,
        ]);
        const data = await response.json();

        const filteredPokemon = data.results
          .filter((pokemon) => pokemon.name.toLowerCase().includes(searchTerm))
          .slice(0, ITEMS_PER_PAGE);

        if (filteredPokemon.length > 0) {
          pokemonGrid.innerHTML = "";
          filteredPokemon.forEach((pokemon) => {
            const pokemonId = pokemon.url.split("/").slice(-2, -1)[0];
            const card = document.createElement("div");
            card.className = "pokemon-card";
            const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;

            card.innerHTML = `
              <img src="${imageUrl}" alt="${pokemon.name}" onerror="this.src='placeholder-image-url.png'">
              <h5>${pokemon.name}</h5>
            `;

            pokemonGrid.appendChild(card);
          });
        } else {
          pokemonGrid.innerHTML =
            '<div class="error">No Pokemon found matching your search</div>';
        }
      } catch (error) {
        console.error("Error searching Pokemon:", error);
        pokemonGrid.innerHTML =
          '<div class="error">Error searching Pokemon</div>';
      } finally {
        await new Promise((resolve) => setTimeout(resolve, 200));
        showShimmerLoading(false);
        pokemonGrid.style.display = "grid";
      }
    } else {
      currentPage = 1;
      fetchPokemon();
    }
  }, 300);
});

// Initial Load
document.addEventListener("DOMContentLoaded", fetchPokemon);
