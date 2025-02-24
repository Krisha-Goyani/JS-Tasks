let pokemonData = [];
let currentPage = 1;
let itemsPerPage = 5;
let currentMaxPages = 120;
let totalPokemons = 0;

// Function to get consistent random values for a page
function getPageRandomValues(pageNumber, itemsPerPage) {
    const heights = [];
    const weights = [];
    
    for(let i = 0; i < itemsPerPage; i++) {
        // Use a different seed for each value to avoid patterns
        const heightSeed = (pageNumber * 1000 + i * 7 + 13) * 17;
        const weightSeed = (pageNumber * 1000 + i * 13 + 17) * 23;
        
        heights.push(Math.floor((heightSeed % 20) + 5));  // Random height between 5-25
        weights.push(Math.floor((weightSeed % 1000) + 100));  // Random weight between 100-1100
    }
    
    return { heights, weights };
}

// Fetch Pokemon data from API with pagination and search
async function fetchPokemonData(searchTerm = '') {
    try {
        let url;
        if (searchTerm) {
            url = `https://pokeapi.co/api/v2/pokemon?limit=1000&name=${searchTerm}`;
        } else {
            const offset = (currentPage - 1) * itemsPerPage;
            url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${itemsPerPage}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        
        totalPokemons = Math.min(data.count, 1000);
        
        let filteredResults = data.results;
        if (searchTerm) {
            filteredResults = data.results.filter(pokemon => 
                pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).slice(0, 1000);
            totalPokemons = filteredResults.length;
            
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            filteredResults = filteredResults.slice(startIndex, endIndex);
        }

        // Get random values for current page
        const { heights, weights } = getPageRandomValues(currentPage, itemsPerPage);

        pokemonData = filteredResults.map((pokemon, index) => {
            const id = pokemon.url.split('/')[6];
            return {
                name: pokemon.name,
                height: heights[index],
                weight: weights[index],
                order: parseInt(id),
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
            };
        });

        updateAvailablePages();
        updatePageOptions();
        updateURLParams();
        renderGallery();
    } catch (error) {
        console.error('Error fetching Pokémon data:', error);
    }
}

// Update page options based on items per page
function updatePageOptions() {
    const maxAvailablePages = Math.ceil(totalPokemons / itemsPerPage);
    const totalPagesSelect = document.getElementById('totalPages');
    
    // Define available page options for different items per page
    const pageOptions = {
        5: [5, 10, 15, 25, 50, 100, 120],
        10: [5, 10, 15, 25, 50, 100],
        15: [5, 10, 15, 25, 50, 100],
        20: [5, 10, 15, 25, 50, 100],
        25: [5, 10, 15, 25, 50],
        50: [5, 10, 15, 25, 50],
        100: [5, 10, 15, 25, 50, 100],
        120: [5, 10, 15, 25, 50, 100]
    };

    // Get available options for current items per page
    const availableOptions = pageOptions[itemsPerPage] || [5, 10, 15, 25, 50, 100];

    // Filter options based on maximum available pages
    const validOptions = availableOptions.filter(option => option <= maxAvailablePages);

    // Update select options
    totalPagesSelect.innerHTML = validOptions.map(value => 
        `<option value="${value}" ${currentMaxPages === value ? 'selected' : ''}>${value}</option>`
    ).join('');

    // Update currentMaxPages if current value is not in valid options
    if (!validOptions.includes(currentMaxPages)) {
        currentMaxPages = validOptions[validOptions.length - 1];
        totalPagesSelect.value = currentMaxPages;
    }
}

// Update available pages based on total items and items per page
function updateAvailablePages() {
    const maxAvailablePages = Math.ceil(totalPokemons / itemsPerPage);
    const totalPagesInput = document.getElementById('totalPages');
    
    // Update max attribute
    totalPagesInput.max = maxAvailablePages;
    
    // If current value is higher than available pages, adjust it
    if (parseInt(totalPagesInput.value) > maxAvailablePages) {
        totalPagesInput.value = maxAvailablePages;
        currentMaxPages = maxAvailablePages;
    }
    
    // Also adjust current page if it's beyond the new maximum
    if (currentPage > maxAvailablePages) {
        currentPage = maxAvailablePages;
    }
}

// Update URL parameters
function updateURLParams() {
    const params = new URLSearchParams(window.location.search);
    params.set('page', currentPage);
    params.set('perPage', itemsPerPage);
    params.set('sort', document.getElementById('sortOrder').value);
    params.set('search', document.getElementById('search').value);
    params.set('maxPages', currentMaxPages);
    
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}

// Calculate total pages
function calculateTotalPages() {
    const maxAvailablePages = Math.ceil(totalPokemons / itemsPerPage);
    return Math.min(maxAvailablePages, currentMaxPages);
}

// Sort Pokemon data
function sortPokemonData(data) {
    const sortOrder = document.getElementById('sortOrder').value;
    const sortedData = [...data];

    const sortConfigs = {
        'height-high': (a, b) => b.height - a.height,
        'height-low': (a, b) => a.height - b.height,
        'weight-high': (a, b) => b.weight - a.weight,
        'weight-low': (a, b) => a.weight - b.weight,
        'order-high': (a, b) => b.order - a.order,
        'order-low': (a, b) => a.order - b.order
    };

    return sortConfigs[sortOrder] 
        ? sortedData.sort(sortConfigs[sortOrder])
        : sortedData;
}

// Update max pages based on available items
function updateMaxPages() {
    const calculatedMaxPages = Math.ceil(totalPokemons / itemsPerPage);
    document.getElementById('totalPages').max = calculatedMaxPages;
    
    // Ensure current max pages doesn't exceed available pages
    currentMaxPages = Math.min(currentMaxPages, calculatedMaxPages);
    document.getElementById('totalPages').value = currentMaxPages;
}

// Render Pokemon gallery
function renderGallery() {
    const gallery = document.getElementById('pokemonGallery');
    const sortedData = sortPokemonData(pokemonData);
    
    updateMaxPages();
    
    gallery.innerHTML = sortedData.map(pokemon => `
        <div class="card">
            <img src="${pokemon.image}" alt="${pokemon.name}">
            <div class="pokemon-info">
                <p><b>Name:</b> ${pokemon.name}</p>
                <p><b>Height:</b> ${pokemon.height}</p>
                <p><b>Weight:</b> ${pokemon.weight}kg</p>
                <p><b>Order:</b> ${pokemon.order}</p>
            </div>
        </div>
    `).join('');

    renderPagination();
}

// Render pagination
function renderPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = calculateTotalPages();
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
    const totalPages = calculateTotalPages();
    
    if (page === 'prev') {
        currentPage = Math.max(1, currentPage - 1);
    } else if (page === 'next') {
        currentPage = Math.min(totalPages, currentPage + 1);
    } else {
        currentPage = Math.min(Math.max(1, page), totalPages);
    }
    
    // Fetch new data for the current page
    const searchTerm = document.getElementById('search').value;
    fetchPokemonData(searchTerm);
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Event listeners
document.getElementById('search').addEventListener('input', 
    debounce((e) => {
        currentPage = 1;
        fetchPokemonData(e.target.value);
    }, 300)
);

document.getElementById('sortOrder').addEventListener('change', () => {
    updateURLParams();
    renderGallery();
});

document.getElementById('perPage').addEventListener('change', (e) => {
    if (e.target.value) {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1;
        // Update page options before fetching new data
        updatePageOptions();
        const searchTerm = document.getElementById('search').value;
        fetchPokemonData(searchTerm);
    }
});

document.getElementById('totalPages').addEventListener('change', (e) => {
    if (e.target.value) {
        const maxAvailablePages = Math.ceil(totalPokemons / itemsPerPage);
        currentMaxPages = Math.min(parseInt(e.target.value), maxAvailablePages);
        e.target.value = currentMaxPages; // Update input value if it was capped
        currentPage = 1;
        const searchTerm = document.getElementById('search').value;
        fetchPokemonData(searchTerm);
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
    
    document.getElementById('search').value = ''; // Always set search to empty

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
    const searchTerm = document.getElementById('search').value;
    fetchPokemonData(searchTerm);
};