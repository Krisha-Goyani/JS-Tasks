let pokemonData = [];
let currentPage = 1;
let itemsPerPage = 5;
let currentMaxPages = 120;

// Fetch Pokemon data from API with pagination and search
async function fetchPokemonData(searchTerm = '', limit = itemsPerPage, offset = 0) {
    try {
        const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (searchTerm) {
            // Filter the current data instead of making a new API call
            const filteredResults = data.results.filter(pokemon => 
                pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            if (filteredResults.length === 0) {
                pokemonData = [];
                renderGallery();
                return;
            }
            
            // Apply pagination to filtered results
            const paginatedResults = filteredResults.slice(offset, offset + limit);
            
            pokemonData = paginatedResults.map((pokemon, index) => {
                const pokemonId = pokemon.url.split('/').slice(-2, -1)[0];
                return {
                    name: pokemon.name,
                    height: Math.floor(Math.random() * 20) + 1,
                    weight: Math.floor(Math.random() * 200) + 1,
                    order: Math.floor(Math.random() * 1000) + 1,
                    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
                };
            });
            
            // Store total filtered count for pagination
            pokemonData.totalCount = filteredResults.length;
        } else {
            // For non-search case, use the regular pagination
            const paginatedResults = data.results.slice(offset, offset + limit);
            
            pokemonData = paginatedResults.map((pokemon, index) => {
                const pokemonId = pokemon.url.split('/').slice(-2, -1)[0];
                return {
                    name: pokemon.name,
                    height: Math.floor(Math.random() * 20) + 1,
                    weight: Math.floor(Math.random() * 200) + 1,
                    order: Math.floor(Math.random() * 1000) + 1,
                    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
                };
            });
            
            pokemonData.totalCount = 1000;
        }

        updateURLParams();
        renderGallery();
    } catch (error) {
        console.error('Error fetching Pokémon data:', error);
        pokemonData = [];
        renderGallery();
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
function calculateTotalPages(totalItems) {
    const maxPossiblePages = Math.ceil(1000 / itemsPerPage);
    return Math.min(maxPossiblePages, currentMaxPages);
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

// Render Pokemon gallery
function renderGallery() {
    const gallery = document.getElementById('pokemonGallery');
    const sortedData = sortPokemonData(pokemonData);
    
    if (sortedData.length === 0) {
        gallery.innerHTML = '<div class="no-results">No Pokémon found</div>';
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    gallery.innerHTML = sortedData.map(pokemon => `
        <div class="card">
            <img src="${pokemon.image}" alt="${pokemon.name}">
            <div class="pokemon-info">
                <h3>${pokemon.name}</h3>
                <p><b>Height:</b> ${pokemon.height}</p>
                <p><b>Weight:</b> ${pokemon.weight}kg</p>
                <p><b>Order:</b> ${pokemon.order}</p>
            </div>
        </div>
    `).join('');

    renderPagination(1000); // Total number of Pokemon
}

// Render pagination
function renderPagination(totalItems) {
    const pagination = document.getElementById('pagination');
    const totalPages = calculateTotalPages(pokemonData.totalCount || totalItems);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

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

    // Last page
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

// Update changePage function to handle search
async function changePage(page) {
    const searchTerm = document.getElementById('search').value;
    const totalPages = calculateTotalPages(pokemonData.totalCount || 1000);
    
    if (page === 'prev') {
        currentPage = Math.max(1, currentPage - 1);
    } else if (page === 'next') {
        currentPage = Math.min(totalPages, currentPage + 1);
    } else {
        currentPage = Math.min(Math.max(1, page), totalPages);
    }
    
    const offset = (currentPage - 1) * itemsPerPage;
    await fetchPokemonData(searchTerm, itemsPerPage, offset);
}

// Change page
async function changePage(page) {
    const totalPages = calculateTotalPages(1000);
    
    if (page === 'prev') {
        currentPage = Math.max(1, currentPage - 1);
    } else if (page === 'next') {
        currentPage = Math.min(totalPages, currentPage + 1);
    } else {
        currentPage = Math.min(Math.max(1, page), totalPages);
    }
    
    const offset = (currentPage - 1) * itemsPerPage;
    await fetchPokemonData('', itemsPerPage, offset);
}

// Debounce function
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
    debounce(async (e) => {
        currentPage = 1; // Reset to first page on new search
        const searchTerm = e.target.value;
        const offset = (currentPage - 1) * itemsPerPage;
        await fetchPokemonData(searchTerm, itemsPerPage, offset);
    }, 300)
);

document.getElementById('sortOrder').addEventListener('change', () => {
    updateURLParams();
    renderGallery();
});

document.getElementById('perPage').addEventListener('change', async (e) => {
    if (e.target.value) {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1;
        const maxPossiblePages = Math.ceil(1000 / itemsPerPage);
        
        if (currentMaxPages > maxPossiblePages) {
            currentMaxPages = maxPossiblePages;
        }
        
        updateTotalPagesDropdown();
        const offset = (currentPage - 1) * itemsPerPage;
        await fetchPokemonData('', itemsPerPage, offset);
    }
});

document.getElementById('totalPages').addEventListener('change', (e) => {
    if (e.target.value) {
        const newMaxPages = parseInt(e.target.value);
        const maxPossiblePages = Math.ceil(1000 / itemsPerPage);
        
        currentMaxPages = Math.min(newMaxPages, maxPossiblePages);
        currentPage = 1;
        
        updateURLParams();
        renderGallery();
    }
});

// Load initial params from URL and initialize
window.onload = async () => {
    loadURLParams();
    await fetchPokemonData('', itemsPerPage, (currentPage - 1) * itemsPerPage);
};

// Load URL parameters
function loadURLParams() {
    const params = new URLSearchParams(window.location.search);
    
    currentPage = parseInt(params.get('page')) || 1;
    itemsPerPage = parseInt(params.get('perPage')) || 5;
    currentMaxPages = parseInt(params.get('maxPages')) || 120;
    
    const sortOrder = params.get('sort');
    if (sortOrder) {
        document.getElementById('sortOrder').value = sortOrder;
    }
    
    const search = params.get('search');
    if (search) {
        document.getElementById('search').value = search;
    }

    if (itemsPerPage) {
        document.getElementById('perPage').value = itemsPerPage;
    }
    
    if (currentMaxPages) {
        document.getElementById('totalPages').value = currentMaxPages;
    }
}

function updateTotalPagesDropdown() {
    const totalPagesSelect = document.getElementById('totalPages');
    const maxPossiblePages = Math.ceil(1000 / itemsPerPage);
    const currentValue = parseInt(totalPagesSelect.value) || maxPossiblePages;
    
    while (totalPagesSelect.options.length > 1) {
        totalPagesSelect.remove(1);
    }
    
    const allOptions = [5, 10, 15, 25, 50, 100, 120];
    
    allOptions.forEach(num => {
        if (num <= maxPossiblePages) {
            const option = document.createElement('option');
            option.value = num;
            option.textContent = num;
            totalPagesSelect.appendChild(option);
        }
    });
    
    if (currentValue > maxPossiblePages) {
        currentMaxPages = maxPossiblePages;
        totalPagesSelect.value = maxPossiblePages;
    } else {
        currentMaxPages = currentValue;
        totalPagesSelect.value = currentValue;
    }
}