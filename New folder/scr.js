let pokemonData = [];
let currentPage = 1;
let itemsPerPage = 5;
let currentMaxPages = 120;
let searchTerm = '';
let totalPokemonCount = 0;
let cachedNames = []; // Store Pokémon names to enable efficient searching

// Fetch Pokemon data with specific parameters
async function fetchPokemonData(limit = itemsPerPage, offset = 0, search = '') {
    try {
        if (search) {
            await fetchWithSearch(search);
        } else {
            await fetchNormal(limit, offset);
        }
        
        updateURLParams();
    } catch (error) {
        console.error('Error fetching Pokemon data:', error);
    }
}

// Fetch data normally (no search) - uses limit/offset pagination
async function fetchNormal(limit, offset) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    const data = await response.json();
    totalPokemonCount = data.count;
    
    // Fetch detailed data for each Pokémon
    const detailedData = await Promise.all(
        data.results.map(async (pokemon) => {
            const detailResponse = await fetch(pokemon.url);
            return detailResponse.json();
        })
    );

    pokemonData = detailedData.map(mapPokemonData);
    renderGallery(data.count);
    
    // Cache names for search if they're not cached yet
    if (cachedNames.length === 0 && data.count > 0) {
        // Get a larger batch of names for searching
        try {
            const namesResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
            const namesData = await namesResponse.json();
            cachedNames = namesData.results.map(pokemon => pokemon.name);
        } catch (error) {
            console.error('Error caching Pokémon names:', error);
            // If we can't get the full list, at least use what we have
            cachedNames = data.results.map(pokemon => pokemon.name);
        }
    }
}

// Fetch with search term - optimized to use direct name API calls
async function fetchWithSearch(search) {
    // If we don't have cached names yet, fetch them first via normal fetch
    if (cachedNames.length === 0) {
        const tempResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const tempData = await tempResponse.json();
        cachedNames = tempData.results.map(pokemon => pokemon.name);
        totalPokemonCount = tempData.count;
    }
    
    // Filter cached names based on search term
    const matchingNames = cachedNames.filter(name => 
        name.toLowerCase().includes(search.toLowerCase())
    );
    
    totalPokemonCount = matchingNames.length;
    
    // Handle pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, matchingNames.length);
    const namesToFetch = matchingNames.slice(startIndex, endIndex);
    
    // Use direct name API calls for each matching Pokémon
    try {
        const detailedData = await Promise.all(
            namesToFetch.map(async (name) => {
                // This is the key difference - direct name API call
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch Pokémon: ${name}`);
                }
                return response.json();
            })
        );
        
        pokemonData = detailedData.map(mapPokemonData);
    } catch (error) {
        console.error('Error fetching Pokémon details:', error);
        pokemonData = [];
    }
    
    renderGallery(matchingNames.length);
}

// Map Pokémon data to our format
function mapPokemonData(pokemon) {
    return {
        name: pokemon.name,
        height: pokemon.height,
        weight: pokemon.weight,
        order: pokemon.order,
        image: pokemon.sprites?.front_default || 'placeholder.png'
    };
}

// Update URL parameters
function updateURLParams() {
    const params = new URLSearchParams(window.location.search);
    params.set('page', currentPage);
    params.set('perPage', itemsPerPage);
    params.set('sort', document.getElementById('sortOrder').value);
    params.set('search', searchTerm);
    params.set('maxPages', currentMaxPages);
    
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}

// Calculate total pages
function calculateTotalPages(totalItems) {
    const calculatedPages = Math.ceil(totalItems / itemsPerPage);
    // Return the minimum between calculated pages and user-selected max pages
    return Math.min(calculatedPages, currentMaxPages);
}

// Sort Pokemon data
function sortPokemonData(data) {
    const sortOrder = document.getElementById('sortOrder').value;
    const sortedData = [...data];

    switch(sortOrder) {
        case 'height-high':
            return sortedData.sort((a, b) => b.height - a.height);
        case 'height-low':
            return sortedData.sort((a, b) => a.height - b.height);
        case 'weight-high':
            return sortedData.sort((a, b) => b.weight - a.weight);
        case 'weight-low':
            return sortedData.sort((a, b) => a.weight - b.weight);
        case 'order-high':
            return sortedData.sort((a, b) => b.order - a.order);
        case 'order-low':
            return sortedData.sort((a, b) => a.order - b.order);
        default:
            return sortedData;
    }
}

// Render Pokemon gallery
function renderGallery(totalCount) {
    const gallery = document.getElementById('pokemonGallery');
    const sortedData = sortPokemonData(pokemonData);
    
    if (sortedData.length === 0) {
        gallery.innerHTML = '<div class="no-results">No Pokémon found matching your search.</div>';
    } else {
        gallery.innerHTML = sortedData.map(pokemon => `
            <div class="card">
                <img src="${pokemon.image}" alt="${pokemon.name}">
                <div class="pokemon-info">
                    <p>Name: ${pokemon.name}</p>
                    <p>Height: ${pokemon.height}</p>
                    <p>Weight: ${pokemon.weight}kg</p>
                    <p>Order: ${pokemon.order}</p>
                </div>
            </div>
        `).join('');
    }

    renderPagination(totalCount);
}

// Render pagination
function renderPagination(totalItems) {
    const pagination = document.getElementById('pagination');
    const totalPages = calculateTotalPages(totalItems);
    let paginationHTML = '';

    // Previous button
    paginationHTML += `
        <button onclick="changePage('prev')" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
    `;

    // First page
    paginationHTML += `
        <button onclick="changePage(1)" ${currentPage === 1 ? 'class="active"' : ''}>1</button>
    `;

    // Calculate range of pages to show
    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    // Adjust range if at the start or end
    if (currentPage <= 3) {
        endPage = Math.min(6, totalPages - 1);
    } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(totalPages - 5, 2);
    }

    // Add ellipsis after first page if needed
    if (startPage > 2) {
        paginationHTML += '<button disabled>...</button>';
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="changePage(${i})" 
                    ${currentPage === i ? 'class="active"' : ''}>${i}</button>
        `;
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
        paginationHTML += '<button disabled>...</button>';
    }

    // Last page (if not already included)
    if (totalPages > 1) {
        paginationHTML += `
            <button onclick="changePage(${totalPages})" 
                    ${currentPage === totalPages ? 'class="active"' : ''}>${totalPages}</button>
        `;
    }

    // Next button
    paginationHTML += `
        <button onclick="changePage('next')" 
                ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
    `;

    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    let newPage;
    if (page === 'prev') {
        newPage = Math.max(1, currentPage - 1);
    } else if (page === 'next') {
        newPage = currentPage + 1; // We'll handle max check after fetching
    } else {
        newPage = page;
    }
    
    currentPage = newPage;
    
    if (searchTerm) {
        // If searching, no offset needed as we're using direct name API calls
        fetchPokemonData(itemsPerPage, 0, searchTerm);
    } else {
        // If browsing normally, use offset for pagination
        const offset = (currentPage - 1) * itemsPerPage;
        fetchPokemonData(itemsPerPage, offset);
    }
}

// Event listeners
document.getElementById('search').addEventListener('input', debounce((e) => {
    searchTerm = e.target.value;
    currentPage = 1;
    fetchPokemonData(itemsPerPage, 0, searchTerm);
}, 300)); // Debounce to avoid making too many API calls while typing

// Simple debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

document.getElementById('sortOrder').addEventListener('change', () => {
    // Since sorting is done client-side, we don't need a new API call
    updateURLParams();
    renderGallery(totalPokemonCount);
});

document.getElementById('perPage').addEventListener('change', (e) => {
    if (e.target.value) {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1;
        
        if (searchTerm) {
            // If searching, reuse the search term
            fetchPokemonData(itemsPerPage, 0, searchTerm);
        } else {
            // If browsing normally, use offset for pagination
            fetchPokemonData(itemsPerPage, 0);
        }
    }
});

document.getElementById('totalPages').addEventListener('change', (e) => {
    if (e.target.value) {
        currentMaxPages = parseInt(e.target.value);
        currentPage = 1; // Reset to first page when changing max pages
        updateURLParams();
        // No need for a new API call, just re-render with updated pagination
        renderGallery(totalPokemonCount);
    }
});

// Load initial params from URL
function loadURLParams() {
    const params = new URLSearchParams(window.location.search);
    
    currentPage = parseInt(params.get('page')) || 1;
    itemsPerPage = parseInt(params.get('perPage')) || 5;
    currentMaxPages = parseInt(params.get('maxPages')) || 120;
    
    const sortOrder = params.get('sort');
    if (sortOrder) {
        document.getElementById('sortOrder').value = sortOrder;
    }
    
    searchTerm = params.get('search') || '';
    if (searchTerm) {
        document.getElementById('search').value = searchTerm;
    }

    if (itemsPerPage) {
        document.getElementById('perPage').value = itemsPerPage;
    }
    
    if (currentMaxPages) {
        document.getElementById('totalPages').value = currentMaxPages;
    }
}

// Initialize
window.onload = () => {
    loadURLParams();
    
    if (searchTerm) {
        // If there's a search term in the URL, use search mode
        fetchPokemonData(itemsPerPage, 0, searchTerm);
    } else {
        // Normal browsing mode - use limit/offset
        const offset = (currentPage - 1) * itemsPerPage;
        fetchPokemonData(itemsPerPage, offset);
    }
};