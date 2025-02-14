let pokemonData = [];
let currentPage = 1;
let itemsPerPage = 5;
let totalPages = 120;

// DOM Elements
const elements = {
    pokemonGallery: document.getElementById('pokemonGallery'),
    pagination: document.getElementById('pagination'),
    search: document.getElementById('search'),
    sortOrder: document.getElementById('sortOrder'),
    perPage: document.getElementById('perPage'),
    totalPages: document.getElementById('totalPages')
};

// Fetch Pokemon data from API
async function fetchPokemonData() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = await response.json();
        
        // Fetch detailed data for each Pokemon
        const detailedData = await Promise.all(
            data.results.map(async (pokemon) => {
                const detailResponse = await fetch(pokemon.url);
                return detailResponse.json();
            })
        );

        pokemonData = detailedData.map(pokemon => ({
            name: pokemon.name,
            height: pokemon.height,
            weight: pokemon.weight,
            order: pokemon.order,
            image: pokemon.sprites.front_default
        }));

        renderGallery();
    } catch (error) {
        console.error('Error fetching Pokemon data:', error);
    }
}

// Update URL parameters
function updateURLParams() {
    const params = new URLSearchParams(window.location.search);
    params.set('page', currentPage);
    params.set('perPage', itemsPerPage);
    params.set('sort', elements.sortOrder.value);
    params.set('search', elements.search.value);
    params.set('totalPages', totalPages);
    
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}

// Sort Pokemon data
function sortPokemonData(data) {
    const sortOrder = elements.sortOrder.value;
    const sortedData = [...data];
    
    const sortingStrategies = {
        'height-high': (a, b) => b.height - a.height,
        'height-low': (a, b) => a.height - b.height,
        'weight-high': (a, b) => b.weight - a.weight,
        'weight-low': (a, b) => a.weight - b.weight,
        'order-high': (a, b) => b.order - a.order,
        'order-low': (a, b) => a.order - b.order
    };

    return sortingStrategies[sortOrder] 
        ? sortedData.sort(sortingStrategies[sortOrder])
        : sortedData;
}

// Filter Pokemon data
function filterPokemonData(data) {
    const searchTerm = elements.search.value.toLowerCase();
    return data.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchTerm)
    );
}

// Generate page numbers
function generatePageNumbers(currentPage, maxPages) {
    const pageNumbers = [];
    
    // Always add first page
    pageNumbers.push(1);
    
    // Calculate range around current page
    let start = Math.max(2, currentPage - 2);
    let end = Math.min(maxPages - 1, currentPage + 2);
    
    // Add ellipsis after 1 if needed
    if (start > 2) {
        pageNumbers.push('...');
    }
    
    // Add pages around current page
    for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (end < maxPages - 1) {
        pageNumbers.push('...');
    }
    
    // Add last page if it's not already included
    if (maxPages > 1) {
        pageNumbers.push(maxPages);
    }
    
    return pageNumbers;
}

// Render Pokemon gallery
function renderGallery() {
    const gallery = elements.pokemonGallery;
    
    gallery.innerHTML = pokemonData.map(pokemon => `
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

// Render pagination
function renderPagination(maxPages) {
    const pagination = elements.pagination;
    const pageNumbers = generatePageNumbers(currentPage, maxPages);
    
    let paginationHTML = `
        <button onclick="changePage('prev')" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
    `;
    
    pageNumbers.forEach(pageNum => {
        if (pageNum === '...') {
            paginationHTML += `<button disabled>...</button>`;
        } else {
            paginationHTML += `
                <button onclick="changePage(${pageNum})" 
                        ${currentPage === pageNum ? 'class="active"' : ''}>${pageNum}</button>
            `;
        }
    });
    
    paginationHTML += `
        <button onclick="changePage('next')" 
                ${currentPage === maxPages ? 'disabled' : ''}>Next</button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    if (page === 'prev') {
        currentPage = Math.max(1, currentPage - 1);
    } else if (page === 'next') {
        currentPage = Math.min(totalPages, currentPage + 1);
    } else {
        currentPage = page;
    }
    
    updateURLParams();
    renderGallery();
}

// Event listeners
elements.search.addEventListener('input', () => {
    currentPage = 1;
    updateURLParams();
    renderGallery();
});

elements.sortOrder.addEventListener('change', () => {
    updateURLParams();
    renderGallery();
});

elements.perPage.addEventListener('change', (e) => {
    if (e.target.value) {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1;
        updateURLParams();
        renderGallery();
    }
});

elements.totalPages.addEventListener('change', (e) => {
    if (e.target.value) {
        totalPages = parseInt(e.target.value);
        currentPage = Math.min(currentPage, totalPages);
        updateURLParams();
        renderGallery();
    }
});

// Load initial params from URL
function loadURLParams() {
    const params = new URLSearchParams(window.location.search);
    
    currentPage = parseInt(params.get('page')) || 1;
    itemsPerPage = parseInt(params.get('perPage')) || 5;
    totalPages = parseInt(params.get('totalPages')) || 120;
    
    const sortOrder = params.get('sort');
    if (sortOrder) {
        elements.sortOrder.value = sortOrder;
    }
    
    const search = params.get('search');
    if (search) {
        elements.search.value = search;
    }

    if (itemsPerPage) {
        elements.perPage.value = itemsPerPage;
    }
    
    if (totalPages) {
        elements.totalPages.value = totalPages;
    }
}

// Initialize
window.onload = () => {
    fetchPokemonData();
};