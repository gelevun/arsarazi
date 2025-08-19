// Portfolio page specific JavaScript for Arsarazi
// Handles property listing, filtering, sorting, and search functionality

let filteredProperties = [];
let currentPage = 1;
let itemsPerPage = 12;
let currentView = 'grid';
let currentSort = 'newest';

// Initialize portfolio page
document.addEventListener('DOMContentLoaded', function() {
    initializePortfolioPage();
    setupPortfolioEventListeners();
    loadAndDisplayProperties();
    updateStatistics();
});

// Initialize portfolio page
function initializePortfolioPage() {
    console.log('Portfolio page initializing...');
    
    // Check for search parameters from main page
    const searchParams = localStorage.getItem('arsarazi_search_params');
    if (searchParams) {
        const params = JSON.parse(searchParams);
        applySearchParams(params);
        localStorage.removeItem('arsarazi_search_params'); // Clear after use
    }
    
    // Initialize filtered properties with all properties
    filteredProperties = [...properties];
}

// Apply search parameters from main page
function applySearchParams(params) {
    if (params.location) {
        document.getElementById('searchInput').value = params.location;
    }
    if (params.minArea > 0) {
        document.getElementById('minAreaFilter').value = params.minArea;
    }
    if (params.maxPrice < Infinity) {
        document.getElementById('maxPriceFilter').value = params.maxPrice;
    }
    
    // Apply filters
    applyFilters();
}

// Setup event listeners for portfolio page
function setupPortfolioEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }

    // Filter controls
    const filters = ['typeFilter', 'minAreaFilter', 'maxPriceFilter', 'investmentFilter'];
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) {
            element.addEventListener('change', applyFilters);
        }
    });

    // Clear filters
    const clearFilters = document.getElementById('clearFilters');
    if (clearFilters) {
        clearFilters.addEventListener('click', clearAllFilters);
    }

    // Sort functionality
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }

    // View toggle
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    
    if (gridView) {
        gridView.addEventListener('click', () => switchView('grid'));
    }
    
    if (listView) {
        listView.addEventListener('click', () => switchView('list'));
    }
}

// Handle search functionality
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredProperties = [...properties];
    } else {
        filteredProperties = properties.filter(property => 
            property.title.toLowerCase().includes(searchTerm) ||
            property.location.toLowerCase().includes(searchTerm) ||
            property.description.toLowerCase().includes(searchTerm) ||
            property.features.some(feature => feature.toLowerCase().includes(searchTerm))
        );
    }
    
    applyFilters();
}

// Apply all filters
function applyFilters() {
    let results = filteredProperties.length === 0 ? [...properties] : [...filteredProperties];
    
    // Type filter
    const typeFilter = document.getElementById('typeFilter').value;
    if (typeFilter) {
        results = results.filter(property => property.type === typeFilter);
    }
    
    // Minimum area filter
    const minArea = parseInt(document.getElementById('minAreaFilter').value) || 0;
    if (minArea > 0) {
        results = results.filter(property => property.area >= minArea);
    }
    
    // Maximum price filter
    const maxPrice = parseInt(document.getElementById('maxPriceFilter').value) || Infinity;
    if (maxPrice < Infinity) {
        results = results.filter(property => property.price <= maxPrice);
    }
    
    // Investment potential filter
    const investmentFilter = document.getElementById('investmentFilter').value;
    if (investmentFilter) {
        results = results.filter(property => property.investment_potential === investmentFilter);
    }
    
    filteredProperties = results;
    currentPage = 1; // Reset to first page
    sortProperties();
    displayProperties();
    updateResultsCount();
}

// Clear all filters
function clearAllFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('minAreaFilter').value = '';
    document.getElementById('maxPriceFilter').value = '';
    document.getElementById('investmentFilter').value = '';
    
    filteredProperties = [...properties];
    currentPage = 1;
    sortProperties();
    displayProperties();
    updateResultsCount();
}

// Handle sorting
function handleSort() {
    currentSort = document.getElementById('sortSelect').value;
    sortProperties();
    displayProperties();
}

// Sort properties based on selected criteria
function sortProperties() {
    switch (currentSort) {
        case 'newest':
            filteredProperties.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'price-low':
            filteredProperties.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProperties.sort((a, b) => b.price - a.price);
            break;
        case 'area-large':
            filteredProperties.sort((a, b) => b.area - a.area);
            break;
        case 'area-small':
            filteredProperties.sort((a, b) => a.area - b.area);
            break;
        default:
            break;
    }
}

// Switch between grid and list view
function switchView(viewType) {
    currentView = viewType;
    
    const gridViewBtn = document.getElementById('gridView');
    const listViewBtn = document.getElementById('listView');
    
    if (viewType === 'grid') {
        gridViewBtn.classList.add('bg-blue-600', 'text-white');
        gridViewBtn.classList.remove('bg-gray-200', 'text-gray-700');
        listViewBtn.classList.add('bg-gray-200', 'text-gray-700');
        listViewBtn.classList.remove('bg-blue-600', 'text-white');
    } else {
        listViewBtn.classList.add('bg-blue-600', 'text-white');
        listViewBtn.classList.remove('bg-gray-200', 'text-gray-700');
        gridViewBtn.classList.add('bg-gray-200', 'text-gray-700');
        gridViewBtn.classList.remove('bg-blue-600', 'text-white');
    }
    
    displayProperties();
}

// Load and display properties
function loadAndDisplayProperties() {
    filteredProperties = [...properties];
    sortProperties();
    displayProperties();
    updateResultsCount();
}

// Display properties based on current view and pagination
function displayProperties() {
    const container = document.getElementById('propertiesContainer');
    const loadingState = document.getElementById('loadingState');
    const noResults = document.getElementById('noResults');
    
    if (!container) return;
    
    // Show loading state briefly
    loadingState.classList.remove('hidden');
    container.innerHTML = '';
    
    setTimeout(() => {
        loadingState.classList.add('hidden');
        
        if (filteredProperties.length === 0) {
            noResults.classList.remove('hidden');
            container.classList.add('hidden');
            return;
        }
        
        noResults.classList.add('hidden');
        container.classList.remove('hidden');
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedProperties = filteredProperties.slice(startIndex, endIndex);
        
        // Update container classes based on view type
        if (currentView === 'grid') {
            container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
            container.innerHTML = paginatedProperties.map(property => renderPropertyCard(property)).join('');
        } else {
            container.className = 'space-y-6';
            container.innerHTML = paginatedProperties.map(property => renderPropertyListItem(property)).join('');
        }
        
        generatePagination();
    }, 500);
}

// Render property card for grid view
function renderPropertyCard(property) {
    const investmentColor = {
        'Çok Yüksek': 'bg-red-100 text-red-800',
        'Yüksek': 'bg-yellow-100 text-yellow-800',
        'Orta': 'bg-green-100 text-green-800'
    }[property.investment_potential] || 'bg-gray-100 text-gray-800';

    return `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden card-hover">
            <div class="relative">
                <img src="${property.images[0]}" alt="${property.title}" 
                    class="w-full h-48 object-cover">
                <div class="absolute top-4 right-4">
                    <span class="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        ${property.status}
                    </span>
                </div>
                <div class="absolute top-4 left-4">
                    <span class="${investmentColor} px-3 py-1 rounded-full text-sm font-medium">
                        ${property.investment_potential}
                    </span>
                </div>
                <div class="absolute bottom-4 left-4">
                    <span class="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                        ${property.type}
                    </span>
                </div>
                <button onclick="addToFavorites(${property.id})" 
                    class="absolute bottom-4 right-4 bg-white text-gray-700 p-2 rounded-full hover:text-red-500 transition-colors">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-2">${property.title}</h3>
                <p class="text-gray-600 mb-4">
                    <i class="fas fa-map-marker-alt mr-2"></i>${property.location}
                </p>
                
                <div class="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                    <div>
                        <i class="fas fa-expand-arrows-alt mr-2"></i>
                        ${property.area.toLocaleString()} m²
                    </div>
                    <div>
                        <i class="fas fa-calculator mr-2"></i>
                        ${property.pricePerM2.toLocaleString()} ₺/m²
                    </div>
                    <div>
                        <i class="fas fa-building mr-2"></i>
                        ${property.zoning}
                    </div>
                    <div>
                        <i class="fas fa-phone mr-2"></i>
                        ${property.contact_person}
                    </div>
                </div>
                
                <div class="mb-4">
                    <div class="flex flex-wrap gap-2">
                        ${property.features.slice(0, 3).map(feature => 
                            `<span class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">${feature}</span>`
                        ).join('')}
                        ${property.features.length > 3 ? 
                            `<span class="text-blue-600 text-sm">+${property.features.length - 3} daha</span>` : ''}
                    </div>
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="text-2xl font-bold text-blue-600">
                        ${property.price.toLocaleString()} ₺
                    </div>
                    <div class="space-x-2">
                        <button onclick="contactForProperty(${property.id})" 
                            class="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
                            <i class="fas fa-phone mr-1"></i>İletişim
                        </button>
                        <button onclick="viewPropertyDetails(${property.id})" 
                            class="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            Detaylar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render property list item for list view
function renderPropertyListItem(property) {
    const investmentColor = {
        'Çok Yüksek': 'bg-red-100 text-red-800',
        'Yüksek': 'bg-yellow-100 text-yellow-800',
        'Orta': 'bg-green-100 text-green-800'
    }[property.investment_potential] || 'bg-gray-100 text-gray-800';

    return `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden card-hover">
            <div class="flex flex-col md:flex-row">
                <div class="relative md:w-1/3">
                    <img src="${property.images[0]}" alt="${property.title}" 
                        class="w-full h-48 md:h-full object-cover">
                    <div class="absolute top-4 right-4">
                        <span class="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            ${property.status}
                        </span>
                    </div>
                    <div class="absolute top-4 left-4">
                        <span class="${investmentColor} px-3 py-1 rounded-full text-sm font-medium">
                            ${property.investment_potential}
                        </span>
                    </div>
                </div>
                
                <div class="p-6 md:w-2/3">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-2xl font-bold text-gray-900 mb-2">${property.title}</h3>
                            <p class="text-gray-600 mb-2">
                                <i class="fas fa-map-marker-alt mr-2"></i>${property.location}
                            </p>
                            <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                ${property.type} • ${property.zoning}
                            </span>
                        </div>
                        <button onclick="addToFavorites(${property.id})" 
                            class="text-gray-400 hover:text-red-500 transition-colors">
                            <i class="fas fa-heart text-xl"></i>
                        </button>
                    </div>
                    
                    <p class="text-gray-700 mb-4">${property.description}</p>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
                        <div>
                            <i class="fas fa-expand-arrows-alt mr-2"></i>
                            ${property.area.toLocaleString()} m²
                        </div>
                        <div>
                            <i class="fas fa-calculator mr-2"></i>
                            ${property.pricePerM2.toLocaleString()} ₺/m²
                        </div>
                        <div>
                            <i class="fas fa-user mr-2"></i>
                            ${property.contact_person}
                        </div>
                        <div>
                            <i class="fas fa-calendar mr-2"></i>
                            ${new Date(property.created_at).toLocaleDateString('tr-TR')}
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <div class="flex flex-wrap gap-2">
                            ${property.features.map(feature => 
                                `<span class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">${feature}</span>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <div class="text-3xl font-bold text-blue-600">
                            ${property.price.toLocaleString()} ₺
                        </div>
                        <div class="space-x-3">
                            <button onclick="contactForProperty(${property.id})" 
                                class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                <i class="fas fa-phone mr-2"></i>İletişim
                            </button>
                            <button onclick="viewPropertyDetails(${property.id})" 
                                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-eye mr-2"></i>Detayları Görüntüle
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Generate pagination
function generatePagination() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="flex items-center space-x-2">';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `
            <button onclick="changePage(${currentPage - 1})" 
                class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `
            <button onclick="changePage(1)" class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">1</button>
        `;
        if (startPage > 2) {
            paginationHTML += '<span class="px-2">...</span>';
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        paginationHTML += `
            <button onclick="changePage(${i})" 
                class="px-4 py-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'}">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += '<span class="px-2">...</span>';
        }
        paginationHTML += `
            <button onclick="changePage(${totalPages})" class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">${totalPages}</button>
        `;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `
            <button onclick="changePage(${currentPage + 1})" 
                class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }
    
    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    currentPage = page;
    displayProperties();
    
    // Scroll to top of properties section
    document.getElementById('propertiesContainer').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// Update results count
function updateResultsCount() {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `(${filteredProperties.length} arsa)`;
    }
}

// Update statistics
function updateStatistics() {
    const totalProperties = document.getElementById('totalProperties');
    const totalArea = document.getElementById('totalArea');
    const averagePrice = document.getElementById('averagePrice');
    
    if (totalProperties) {
        totalProperties.textContent = properties.length;
    }
    
    if (totalArea) {
        const total = properties.reduce((sum, prop) => sum + prop.area, 0);
        totalArea.textContent = total.toLocaleString();
    }
    
    if (averagePrice) {
        const average = properties.reduce((sum, prop) => sum + prop.price, 0) / properties.length;
        averagePrice.textContent = Math.round(average).toLocaleString();
    }
}

// Add to favorites functionality
function addToFavorites(propertyId) {
    if (!currentUser) {
        showNotification('Favorilere eklemek için giriş yapmalısınız.', 'warning');
        document.getElementById('loginModal').classList.remove('hidden');
        return;
    }
    
    let favorites = JSON.parse(localStorage.getItem('arsarazi_favorites') || '[]');
    
    if (favorites.includes(propertyId)) {
        favorites = favorites.filter(id => id !== propertyId);
        showNotification('Favorilerden kaldırıldı.', 'info');
    } else {
        favorites.push(propertyId);
        showNotification('Favorilere eklendi.', 'success');
    }
    
    localStorage.setItem('arsarazi_favorites', JSON.stringify(favorites));
}

// Contact for property
function contactForProperty(propertyId) {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;
    
    const message = `Merhaba, ${property.title} ile ilgili bilgi almak istiyorum. Arsa linki: ${window.location.origin}/property-detail.html?id=${propertyId}`;
    const whatsappUrl = `https://wa.me/${property.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
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

// Global functions for HTML onclick handlers
window.changePage = changePage;
window.addToFavorites = addToFavorites;
window.contactForProperty = contactForProperty;

console.log('Portfolio JavaScript loaded successfully');