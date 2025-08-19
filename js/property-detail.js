// Property Detail page JavaScript for Arsarazi
// Handles individual property display, contact forms, and related properties

let currentProperty = null;
let relatedProperties = [];

// Initialize property detail page
document.addEventListener('DOMContentLoaded', function() {
    initializePropertyDetail();
    setupPropertyDetailEventListeners();
    loadPropertyDetail();
});

// Initialize property detail page
function initializePropertyDetail() {
    console.log('Property detail page initializing...');
    
    // Get property ID from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id') || localStorage.getItem('arsarazi_selected_property');
    
    if (propertyId) {
        localStorage.setItem('arsarazi_selected_property', propertyId);
        loadPropertyById(parseInt(propertyId));
    } else {
        showNotFoundState();
    }
}

// Setup event listeners
function setupPropertyDetailEventListeners() {
    // Image modal
    const imageModal = document.getElementById('imageModal');
    const closeImageModal = document.getElementById('closeImageModal');
    
    if (closeImageModal) {
        closeImageModal.addEventListener('click', () => {
            imageModal.classList.add('hidden');
        });
    }
    
    // Click outside to close modal
    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                imageModal.classList.add('hidden');
            }
        });
    }

    // Quick contact form
    const quickContactForm = document.getElementById('quickContactForm');
    if (quickContactForm) {
        quickContactForm.addEventListener('submit', handleQuickContact);
    }

    // Contact buttons
    const callBtn = document.getElementById('callBtn');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const emailBtn = document.getElementById('emailBtn');
    const favoriteBtn = document.getElementById('favoriteBtn');
    const shareBtn = document.getElementById('shareBtn');

    if (callBtn) {
        callBtn.addEventListener('click', () => {
            if (currentProperty) {
                window.location.href = `tel:${currentProperty.phone}`;
            }
        });
    }

    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            if (currentProperty) {
                const message = `Merhaba, ${currentProperty.title} ile ilgili bilgi almak istiyorum.`;
                const whatsappUrl = `https://wa.me/${currentProperty.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            }
        });
    }

    if (emailBtn) {
        emailBtn.addEventListener('click', () => {
            if (currentProperty) {
                const subject = `${currentProperty.title} - Bilgi Talebi`;
                const body = `Merhaba,\n\n${currentProperty.title} ile ilgili detaylı bilgi almak istiyorum.\n\nArsa Linki: ${window.location.href}\n\nİyi günler.`;
                window.location.href = `mailto:info@arsarazi.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }
        });
    }

    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', toggleFavorite);
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', shareProperty);
    }
}

// Load property by ID
function loadPropertyById(propertyId) {
    const property = properties.find(p => p.id === propertyId);
    
    if (property) {
        currentProperty = property;
        displayPropertyDetail(property);
        loadRelatedProperties(property);
        updateFavoriteButton();
    } else {
        showNotFoundState();
    }
}

// Load property detail
function loadPropertyDetail() {
    const loadingState = document.getElementById('loadingState');
    const propertyDetail = document.getElementById('propertyDetail');
    
    // Simulate loading delay
    setTimeout(() => {
        loadingState.classList.add('hidden');
        if (currentProperty) {
            propertyDetail.classList.remove('hidden');
        }
    }, 1000);
}

// Display property detail
function displayPropertyDetail(property) {
    // Update page title
    document.title = `${property.title} - Arsarazi`;
    
    // Update breadcrumb
    const breadcrumbTitle = document.getElementById('breadcrumbTitle');
    if (breadcrumbTitle) {
        breadcrumbTitle.textContent = property.title;
    }

    // Update property information
    document.getElementById('propertyTitle').textContent = property.title;
    document.getElementById('propertyLocation').textContent = property.location;
    document.getElementById('propertyType').textContent = property.type;
    document.getElementById('propertyStatus').textContent = property.status;
    document.getElementById('propertyPrice').textContent = `${property.price.toLocaleString()} ₺`;
    document.getElementById('pricePerM2').textContent = `${property.pricePerM2.toLocaleString()} ₺/m²`;
    document.getElementById('propertyDescription').textContent = property.description;

    // Update investment potential badge
    const investmentBadge = document.getElementById('investmentPotential');
    const investmentColors = {
        'Çok Yüksek': 'bg-red-100 text-red-800',
        'Yüksek': 'bg-yellow-100 text-yellow-800',
        'Orta': 'bg-green-100 text-green-800'
    };
    investmentBadge.textContent = property.investment_potential;
    investmentBadge.className = `px-3 py-1 rounded-full text-sm font-medium ${investmentColors[property.investment_potential] || 'bg-gray-100 text-gray-800'}`;

    // Update contact information
    document.getElementById('contactPerson').textContent = property.contact_person;
    document.getElementById('contactPhone').textContent = property.phone;

    // Display image gallery
    displayImageGallery(property.images);

    // Display features
    displayFeatures(property.features);

    // Display specifications
    displaySpecifications(property);
}

// Display image gallery
function displayImageGallery(images) {
    const gallery = document.getElementById('imageGallery');
    
    if (images.length === 1) {
        // Single image - full width
        gallery.innerHTML = `
            <div class="w-full">
                <img src="${images[0]}" alt="Arsa Fotoğrafı" 
                    class="w-full h-96 object-cover rounded-lg cursor-pointer"
                    onclick="openImageModal('${images[0]}')">
            </div>
        `;
    } else {
        // Multiple images - grid layout
        gallery.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                ${images.map((image, index) => `
                    <div class="${index === 0 ? 'col-span-2' : ''}">
                        <img src="${image}" alt="Arsa Fotoğrafı ${index + 1}" 
                            class="w-full ${index === 0 ? 'h-96' : 'h-48'} object-cover rounded-lg cursor-pointer"
                            onclick="openImageModal('${image}')">
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Display features
function displayFeatures(features) {
    const featuresContainer = document.getElementById('propertyFeatures');
    
    featuresContainer.innerHTML = features.map(feature => `
        <div class="flex items-center bg-blue-50 p-3 rounded-lg">
            <i class="fas fa-check-circle text-blue-600 mr-3"></i>
            <span class="text-gray-800">${feature}</span>
        </div>
    `).join('');
}

// Display specifications
function displaySpecifications(property) {
    const specsContainer = document.getElementById('propertySpecs');
    
    const specs = [
        { label: 'Toplam Alan', value: `${property.area.toLocaleString()} m²`, icon: 'expand-arrows-alt' },
        { label: 'M² Fiyatı', value: `${property.pricePerM2.toLocaleString()} ₺`, icon: 'calculator' },
        { label: 'İmar Durumu', value: property.zoning, icon: 'building' },
        { label: 'Yatırım Potansiyeli', value: property.investment_potential, icon: 'chart-line' },
        { label: 'Durum', value: property.status, icon: 'info-circle' },
        { label: 'Eklenme Tarihi', value: new Date(property.created_at).toLocaleDateString('tr-TR'), icon: 'calendar' }
    ];
    
    specsContainer.innerHTML = specs.map(spec => `
        <div class="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
            <div class="flex items-center">
                <i class="fas fa-${spec.icon} text-blue-600 w-5 mr-3"></i>
                <span class="text-gray-700">${spec.label}</span>
            </div>
            <span class="font-medium text-gray-900">${spec.value}</span>
        </div>
    `).join('');
}

// Load related properties
function loadRelatedProperties(currentProperty) {
    // Find properties of the same type or in the same location
    relatedProperties = properties.filter(property => 
        property.id !== currentProperty.id && (
            property.type === currentProperty.type ||
            property.location.includes(currentProperty.location.split(',')[0])
        )
    ).slice(0, 3);
    
    displayRelatedProperties();
}

// Display related properties
function displayRelatedProperties() {
    const container = document.getElementById('relatedProperties');
    
    if (relatedProperties.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-search text-2xl mb-2"></i>
                <p>Benzer arsa bulunamadı</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = relatedProperties.map(property => `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onclick="viewPropertyDetails(${property.id})">
            <img src="${property.images[0]}" alt="${property.title}" 
                class="w-full h-32 object-cover rounded-lg mb-3">
            <h4 class="font-medium text-gray-900 mb-2 text-sm">${property.title}</h4>
            <p class="text-xs text-gray-600 mb-2">
                <i class="fas fa-map-marker-alt mr-1"></i>${property.location}
            </p>
            <div class="flex justify-between items-center">
                <span class="text-sm font-bold text-blue-600">
                    ${property.price.toLocaleString()} ₺
                </span>
                <span class="text-xs text-gray-500">
                    ${property.area.toLocaleString()} m²
                </span>
            </div>
        </div>
    `).join('');
}

// Handle quick contact form
function handleQuickContact(e) {
    e.preventDefault();
    
    const name = document.getElementById('quickName').value;
    const phone = document.getElementById('quickPhone').value;
    const message = document.getElementById('quickMessage').value;
    
    if (!currentProperty) return;
    
    // Create new customer/lead
    const newCustomer = {
        id: Date.now(),
        name: name,
        email: '',
        phone: phone,
        type: "Potansiyel Alıcı",
        status: "Yeni",
        interests: [currentProperty.title],
        budget: { min: 0, max: currentProperty.price },
        notes: `Arsa: ${currentProperty.title}\nMesaj: ${message}\nİletişim Sayfası: ${window.location.href}`,
        created_at: new Date().toISOString(),
        last_contact: new Date().toISOString(),
        source: "Arsa Detay Sayfası"
    };
    
    // Add to customers array
    customers.push(newCustomer);
    saveDataToStorage();
    
    // Reset form
    document.getElementById('quickContactForm').reset();
    
    showNotification('Mesajınız alındı! En kısa sürede dönüş yapacağız.', 'success');
    
    // Also send WhatsApp message if possible
    const whatsappMessage = `Yeni İletişim Talebi\n\nAd: ${name}\nTelefon: ${phone}\nArsa: ${currentProperty.title}\nMesaj: ${message}`;
    const whatsappUrl = `https://wa.me/${currentProperty.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Open WhatsApp in new window (optional - for demo purposes)
    // window.open(whatsappUrl, '_blank');
}

// Toggle favorite
function toggleFavorite() {
    if (!currentUser) {
        showNotification('Favorilere eklemek için giriş yapmalısınız.', 'warning');
        document.getElementById('loginModal').classList.remove('hidden');
        return;
    }
    
    if (!currentProperty) return;
    
    let favorites = JSON.parse(localStorage.getItem('arsarazi_favorites') || '[]');
    const isFavorite = favorites.includes(currentProperty.id);
    
    if (isFavorite) {
        favorites = favorites.filter(id => id !== currentProperty.id);
        showNotification('Favorilerden kaldırıldı.', 'info');
    } else {
        favorites.push(currentProperty.id);
        showNotification('Favorilere eklendi.', 'success');
    }
    
    localStorage.setItem('arsarazi_favorites', JSON.stringify(favorites));
    updateFavoriteButton();
}

// Update favorite button
function updateFavoriteButton() {
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (!favoriteBtn || !currentProperty) return;
    
    const favorites = JSON.parse(localStorage.getItem('arsarazi_favorites') || '[]');
    const isFavorite = favorites.includes(currentProperty.id);
    
    if (isFavorite) {
        favoriteBtn.innerHTML = '<i class="fas fa-heart mr-2"></i>Favorilerden Çıkar';
        favoriteBtn.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-red-100', 'hover:text-red-600');
        favoriteBtn.classList.add('bg-red-100', 'text-red-600');
    } else {
        favoriteBtn.innerHTML = '<i class="fas fa-heart mr-2"></i>Favoriye Ekle';
        favoriteBtn.classList.remove('bg-red-100', 'text-red-600');
        favoriteBtn.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-red-100', 'hover:text-red-600');
    }
}

// Share property
function shareProperty() {
    if (!currentProperty) return;
    
    const shareData = {
        title: currentProperty.title,
        text: `${currentProperty.title} - ${currentProperty.price.toLocaleString()} ₺`,
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData).catch(console.error);
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            showNotification('Link kopyalandı!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Link kopyalandı!', 'success');
        });
    }
}

// Open image modal
function openImageModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    modalImage.src = imageSrc;
    modal.classList.remove('hidden');
}

// Show not found state
function showNotFoundState() {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('notFoundState').classList.remove('hidden');
}

// View property details (for related properties)
function viewPropertyDetails(propertyId) {
    localStorage.setItem('arsarazi_selected_property', propertyId);
    window.location.href = `property-detail.html?id=${propertyId}`;
}

// Global functions for HTML onclick handlers
window.openImageModal = openImageModal;
window.viewPropertyDetails = viewPropertyDetails;

console.log('Property Detail JavaScript loaded successfully');