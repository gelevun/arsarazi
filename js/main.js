// Main JavaScript for Arsarazi Real Estate Website
// Local Storage Based CRM System

// Global variables and initialization
let currentUser = null;
let properties = [];
let customers = [];
let blogPosts = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadSampleData();
    setupEventListeners();
    renderFeaturedProperties();
    renderBlogPosts();
});

// Initialize application
function initializeApp() {
    console.log('Arsarazi Web Application Starting...');
    
    // Check if user is logged in
    const savedUser = localStorage.getItem('arsarazi_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }
    
    // Load data from localStorage
    loadDataFromStorage();
}

// Load data from localStorage
function loadDataFromStorage() {
    const savedProperties = localStorage.getItem('arsarazi_properties');
    const savedCustomers = localStorage.getItem('arsarazi_customers');
    const savedBlogPosts = localStorage.getItem('arsarazi_blog_posts');
    
    if (savedProperties) properties = JSON.parse(savedProperties);
    if (savedCustomers) customers = JSON.parse(savedCustomers);
    if (savedBlogPosts) blogPosts = JSON.parse(savedBlogPosts);
}

// Save data to localStorage
function saveDataToStorage() {
    localStorage.setItem('arsarazi_properties', JSON.stringify(properties));
    localStorage.setItem('arsarazi_customers', JSON.stringify(customers));
    localStorage.setItem('arsarazi_blog_posts', JSON.stringify(blogPosts));
}

// Load sample data if no data exists
function loadSampleData() {
    if (properties.length === 0) {
        properties = [
            {
                id: 1,
                title: "Karesi Merkez Konut Arsası",
                location: "Karesi Merkez, Balıkesir",
                area: 2000,
                price: 450000,
                pricePerM2: 225,
                type: "Konut",
                status: "Satılık",
                description: "Karesi merkez konumunda, imar durumu uygun, yatırım potansiyeli yüksek arsa.",
                features: ["Merkezi Konum", "İmar Uygun", "Ulaşım Kolay", "Yatırım Fırsatı"],
                images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop"],
                zoning: "Konut Alanı",
                investment_potential: "Yüksek",
                created_at: new Date().toISOString(),
                contact_person: "Ahmet Balıkesir",
                phone: "+90 532 123 4567"
            },
            {
                id: 2,
                title: "Paşa Alanı Villa Arsası",
                location: "Paşa Alanı, Karesi",
                area: 1500,
                price: 380000,
                pricePerM2: 253,
                type: "Villa",
                status: "Satılık",
                description: "Villa yapımına uygun, sessiz ve sakin çevrede, doğayla iç içe arsa.",
                features: ["Doğal Çevre", "Villa İmarlı", "Sessiz Lokasyon", "Temiz Hava"],
                images: ["https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop"],
                zoning: "Villa Alanı",
                investment_potential: "Yüksek",
                created_at: new Date().toISOString(),
                contact_person: "Ayşe Karesi",
                phone: "+90 533 234 5678"
            },
            {
                id: 3,
                title: "Balıkesir OSB Sanayi Arsası",
                location: "Organize Sanayi, Balıkesir",
                area: 4000,
                price: 800000,
                pricePerM2: 200,
                type: "Sanayi",
                status: "Satılık",
                description: "Organize sanayi bölgesinde, fabrika kurulumu için ideal, ana yola cepheli.",
                features: ["OSB İçinde", "Sanayi İmarlı", "Elektrik Var", "Su Var"],
                images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop"],
                zoning: "Sanayi Alanı",
                investment_potential: "Çok Yüksek",
                created_at: new Date().toISOString(),
                contact_person: "Mehmet Sanayi",
                phone: "+90 534 345 6789"
            },
            {
                id: 4,
                title: "Kepsut Doğal Yaşam Arsası",
                location: "Kepsut, Balıkesir",
                area: 2500,
                price: 320000,
                pricePerM2: 128,
                type: "Konut",
                status: "Satılık",
                description: "Doğal çevrede, temiz hava, sakin yaşam için ideal arsa.",
                features: ["Doğal Çevre", "Temiz Hava", "Sakin Yaşam", "Yeşil Alan"],
                images: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop"],
                zoning: "Konut Alanı",
                investment_potential: "Orta",
                created_at: new Date().toISOString(),
                contact_person: "Fatma Kepsut",
                phone: "+90 535 456 7890"
            },
            {
                id: 5,
                title: "Gönen Tarım Arsası",
                location: "Gönen, Balıkesir",
                area: 8000,
                price: 400000,
                pricePerM2: 50,
                type: "Tarım",
                status: "Satılık",
                description: "Verimli tarım arazisi, sulama sistemi mevcut, organik tarım için uygun.",
                features: ["Verimli Toprak", "Sulama Sistemi", "Organik Uygun", "Geniş Alan"],
                images: ["https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=600&fit=crop"],
                zoning: "Tarım Alanı",
                investment_potential: "Orta",
                created_at: new Date().toISOString(),
                contact_person: "Ali Gönen",
                phone: "+90 536 567 8901"
            },
            {
                id: 6,
                title: "Karesi Çengel Caddesi Ticari Arsa",
                location: "Çengel Caddesi, Karesi",
                area: 600,
                price: 480000,
                pricePerM2: 800,
                type: "Ticari",
                status: "Satılık",
                description: "Ana cadde üzerinde, ticari faaliyet için ideal lokasyon.",
                features: ["Ana Cadde", "Ticari İmarlı", "Yoğun Geçiş", "Kar Potansiyeli"],
                images: ["https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&h=600&fit=crop"],
                zoning: "Ticari Alanı",
                investment_potential: "Çok Yüksek",
                created_at: new Date().toISOString(),
                contact_person: "Hasan Çengel",
                phone: "+90 537 678 9012"
            }
        ];

        blogPosts = [
            {
                id: 1,
                title: "Balıkesir'de Arsa Yatırımı Rehberi",
                summary: "Balıkesir ve çevresinde arsa yatırımında dikkat edilmesi gereken önemli faktörler.",
                content: "Balıkesir'de arsa yatırımı yaparken dikkat edilecek önemli faktörler...",
                author: "Arsarazi Uzman Ekip",
                date: "2024-01-15",
                category: "Yatırım Rehberi",
                image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
                tags: ["balıkesir", "yatırım", "arsa", "rehber"]
            },
            {
                id: 2,
                title: "Karesi Bölgesi İmar Planları",
                summary: "Karesi bölgesindeki imar planları ve arsa değerlerine etkisi.",
                content: "Karesi bölgesinde imar planları arsa değerini nasıl etkiler...",
                author: "İmar Uzmanı",
                date: "2024-01-10",
                category: "İmar ve Planlama",
                image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=400&fit=crop",
                tags: ["karesi", "imar", "planlama", "değer"]
            },
            {
                id: 3,
                title: "Balıkesir Gayrimenkul Piyasası 2024",
                summary: "2024 yılında Balıkesir gayrimenkul sektöründe beklenen gelişmeler.",
                content: "2024 yılında Balıkesir'de sektörde beklenen değişiklikler...",
                author: "Piyasa Analisti",
                date: "2024-01-08",
                category: "Piyasa Analizi",
                image: "https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=400&fit=crop",
                tags: ["balıkesir", "piyasa", "tahmin", "2024"]
            }
        ];

        customers = [
            {
                id: 1,
                name: "Emre Balıkesir",
                email: "emre@example.com",
                phone: "+90 532 111 2233",
                type: "Alıcı",
                status: "Aktif",
                interests: ["Konut arsası", "Karesi"],
                budget: { min: 300000, max: 600000 },
                notes: "Karesi merkezde konut arsası arıyor",
                created_at: "2024-01-15",
                last_contact: "2024-01-18"
            },
            {
                id: 2,
                name: "Zeynep Gönen",
                email: "zeynep@example.com",
                phone: "+90 533 222 3344",
                type: "Yatırımcı",
                status: "Aktif",
                interests: ["Sanayi arsası", "OSB"],
                budget: { min: 500000, max: 1200000 },
                notes: "OSB'de sanayi arsası arıyor",
                created_at: "2024-01-12",
                last_contact: "2024-01-19"
            },
            {
                id: 3,
                name: "Can Kepsut",
                email: "can@example.com",
                phone: "+90 534 333 4455",
                type: "Satıcı",
                status: "Pasif",
                interests: ["Tarım arsası satışı"],
                budget: { min: 0, max: 0 },
                notes: "Gönen'de 12 dönüm tarım arsası satacak",
                created_at: "2024-01-10",
                last_contact: "2024-01-16"
            }
        ];

        saveDataToStorage();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handlePropertySearch);
    }

    // Login modal
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const loginForm = document.getElementById('loginForm');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            // Check if loginModal exists before using it
            if (loginModal) {
                loginModal.classList.remove('hidden');
            } else {
                // If no modal, redirect to login page
                window.location.href = 'login.html';
            }
        });
    }

    if (closeLoginModal && loginModal) {
        closeLoginModal.addEventListener('click', () => {
            loginModal.classList.add('hidden');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Admin panel button
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            window.location.href = 'admin.html';
        });
    }

    // View all properties button
    const viewAllPropertiesBtn = document.getElementById('viewAllPropertiesBtn');
    if (viewAllPropertiesBtn) {
        viewAllPropertiesBtn.addEventListener('click', () => {
            window.location.href = 'portfolio.html';
        });
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // Show register button
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', showRegistrationForm);
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Handle property search
function handlePropertySearch(e) {
    e.preventDefault();
    
    const location = document.getElementById('searchLocation').value;
    const minArea = document.getElementById('minArea').value;
    const maxPrice = document.getElementById('maxPrice').value;
    
    // Store search parameters
    const searchParams = {
        location: location,
        minArea: parseInt(minArea) || 0,
        maxPrice: parseInt(maxPrice) || Infinity,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('arsarazi_search_params', JSON.stringify(searchParams));
    
    // Redirect to portfolio page with search results
    window.location.href = 'portfolio.html';
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple mock authentication
    if (email && password) {
        const user = {
            id: Date.now(),
            email: email,
            name: email.split('@')[0],
            type: email.includes('admin') ? 'admin' : 'customer',
            login_time: new Date().toISOString()
        };
        
        currentUser = user;
        localStorage.setItem('arsarazi_user', JSON.stringify(user));
        
        updateUIForLoggedInUser();
        document.getElementById('loginModal').classList.add('hidden');
        
        showNotification('Başarıyla giriş yaptınız!', 'success');
        
        // Redirect admin users to admin panel
        if (user.type === 'admin') {
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1500);
        }
    } else {
        showNotification('Lütfen tüm alanları doldurun.', 'error');
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn && currentUser) {
        loginBtn.innerHTML = `<i class="fas fa-user mr-2"></i>${currentUser.name}`;
        loginBtn.onclick = () => {
            // Show user menu or profile
            showUserMenu();
        };
    }
}

// Show user menu
function showUserMenu() {
    // Create user dropdown menu
    const userMenu = document.createElement('div');
    userMenu.className = 'absolute top-full right-0 bg-white shadow-lg rounded-lg p-4 z-50 min-w-48';
    userMenu.innerHTML = `
        <div class="space-y-2">
            <div class="border-b pb-2 mb-2">
                <p class="font-medium text-gray-900">${currentUser.name}</p>
                <p class="text-sm text-gray-600">${currentUser.email}</p>
            </div>
            <button onclick="showUserProfile()" class="w-full text-left px-2 py-1 hover:bg-gray-100 rounded">
                <i class="fas fa-user mr-2"></i>Profil
            </button>
            <button onclick="showUserFavorites()" class="w-full text-left px-2 py-1 hover:bg-gray-100 rounded">
                <i class="fas fa-heart mr-2"></i>Favorilerim
            </button>
            ${currentUser.type === 'admin' ? 
                '<button onclick="window.location.href=\'admin.html\'" class="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"><i class="fas fa-cog mr-2"></i>Admin Panel</button>' 
                : ''}
            <button onclick="handleLogout()" class="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-red-600">
                <i class="fas fa-sign-out-alt mr-2"></i>Çıkış Yap
            </button>
        </div>
    `;
    
    // Remove existing menu if any
    document.querySelector('.user-menu')?.remove();
    userMenu.className += ' user-menu';
    
    // Position relative to login button
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.parentNode.style.position = 'relative';
    loginBtn.parentNode.appendChild(userMenu);
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!userMenu.contains(e.target) && e.target !== loginBtn) {
                userMenu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('arsarazi_user');
    
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.innerHTML = 'Giriş Yap';
        loginBtn.onclick = () => {
            document.getElementById('loginModal').classList.remove('hidden');
        };
    }
    
    showNotification('Başarıyla çıkış yaptınız.', 'success');
    document.querySelector('.user-menu')?.remove();
}

// Show registration form
function showRegistrationForm() {
    const loginModal = document.getElementById('loginModal');
    const modalContent = loginModal.querySelector('.bg-white');
    
    modalContent.innerHTML = `
        <div class="text-center mb-6">
            <h3 class="text-2xl font-bold text-gray-900">Kayıt Ol</h3>
            <p class="text-gray-600">Yeni hesap oluşturun</p>
        </div>
        
        <form id="registerForm">
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                <input type="text" id="registerName" required 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                <input type="email" id="registerEmail" required 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                <input type="tel" id="registerPhone" required 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
                <input type="password" id="registerPassword" required 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            
            <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 mb-4">
                Kayıt Ol
            </button>
            
            <div class="text-center">
                <span class="text-gray-600">Zaten hesabınız var mı? </span>
                <button type="button" id="showLoginBtn" class="text-blue-600 hover:underline font-medium">Giriş Yapın</button>
            </div>
        </form>
        
        <button onclick="document.getElementById('loginModal').classList.add('hidden')" 
            class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-xl"></i>
        </button>
    `;
    
    // Add event listeners for new form
    document.getElementById('registerForm').addEventListener('submit', handleRegistration);
    document.getElementById('showLoginBtn').addEventListener('click', () => {
        loginModal.classList.add('hidden');
        setTimeout(() => {
            loginModal.classList.remove('hidden');
        }, 100);
    });
}

// Handle registration
function handleRegistration(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    
    if (name && email && phone && password) {
        // Create new customer
        const newCustomer = {
            id: Date.now(),
            name: name,
            email: email,
            phone: phone,
            type: "Potansiyel Alıcı",
            status: "Yeni",
            interests: [],
            budget: { min: 0, max: 0 },
            notes: "Web sitesi üzerinden kayıt oldu",
            created_at: new Date().toISOString(),
            last_contact: new Date().toISOString()
        };
        
        customers.push(newCustomer);
        saveDataToStorage();
        
        // Auto login
        currentUser = {
            id: newCustomer.id,
            email: email,
            name: name,
            type: 'customer',
            login_time: new Date().toISOString()
        };
        
        localStorage.setItem('arsarazi_user', JSON.stringify(currentUser));
        updateUIForLoggedInUser();
        
        document.getElementById('loginModal').classList.add('hidden');
        showNotification('Kayıt başarılı! Hoş geldiniz.', 'success');
    } else {
        showNotification('Lütfen tüm alanları doldurun.', 'error');
    }
}

// Handle contact form submission
function handleContactForm(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const phone = document.getElementById('contactPhone').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;
    
    if (name && phone && email && subject && message) {
        // Create new customer/lead
        const newCustomer = {
            id: Date.now(),
            name: name,
            email: email,
            phone: phone,
            type: "Potansiyel Müşteri",
            status: "Yeni",
            interests: [subject],
            budget: { min: 0, max: 0 },
            notes: `İletişim formu: ${message}`,
            created_at: new Date().toISOString(),
            last_contact: new Date().toISOString(),
            contact_subject: subject
        };
        
        // Check if customer already exists
        const existingCustomer = customers.find(c => c.email === email || c.phone === phone);
        if (existingCustomer) {
            existingCustomer.notes += `\n\nYeni Mesaj (${new Date().toLocaleDateString()}): ${message}`;
            existingCustomer.last_contact = new Date().toISOString();
        } else {
            customers.push(newCustomer);
        }
        
        saveDataToStorage();
        
        // Reset form
        document.getElementById('contactForm').reset();
        
        showNotification('Mesajınız başarıyla gönderildi. En kısa sürede dönüş yapacağız.', 'success');
    } else {
        showNotification('Lütfen tüm alanları doldurun.', 'error');
    }
}

// Render featured properties
function renderFeaturedProperties() {
    const container = document.getElementById('featuredProperties');
    if (!container) return;
    
    const featuredProperties = properties.slice(0, 6); // Show first 6 properties
    
    container.innerHTML = featuredProperties.map(property => `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden card-hover">
            <div class="relative">
                <img src="${property.images[0]}" alt="${property.title}" 
                    class="w-full h-48 object-cover">
                <div class="absolute top-4 right-4">
                    <span class="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        ${property.status}
                    </span>
                </div>
                <div class="absolute bottom-4 left-4">
                    <span class="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                        ${property.type}
                    </span>
                </div>
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
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="text-2xl font-bold text-blue-600">
                        ${property.price.toLocaleString()} ₺
                    </div>
                    <button onclick="viewPropertyDetails(${property.id})" 
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Detaylar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Render blog posts
function renderBlogPosts() {
    const container = document.getElementById('blogPosts');
    if (!container) return;
    
    container.innerHTML = blogPosts.map(post => `
        <article class="bg-white rounded-xl shadow-lg overflow-hidden card-hover">
            <img src="${post.image}" alt="${post.title}" class="w-full h-48 object-cover">
            
            <div class="p-6">
                <div class="flex items-center mb-4 text-sm text-gray-600">
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-3">${post.category}</span>
                    <span>${new Date(post.date).toLocaleDateString('tr-TR')}</span>
                </div>
                
                <h3 class="text-xl font-bold text-gray-900 mb-2">${post.title}</h3>
                <p class="text-gray-600 mb-4">${post.summary}</p>
                
                <div class="flex items-center justify-between">
                    <div class="text-sm text-gray-600">
                        <i class="fas fa-user mr-1"></i>${post.author}
                    </div>
                    <button onclick="readBlogPost(${post.id})" 
                        class="text-blue-600 hover:text-blue-800 font-medium">
                        Devamını Oku →
                    </button>
                </div>
            </div>
        </article>
    `).join('');
}

// View property details
function viewPropertyDetails(propertyId) {
    localStorage.setItem('arsarazi_selected_property', propertyId);
    window.location.href = 'property-detail.html';
}

// Read blog post
function readBlogPost(postId) {
    localStorage.setItem('arsarazi_selected_post', postId);
    window.location.href = 'blog-detail.html';
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
    
    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    }[type] || 'bg-blue-500';
    
    notification.className += ` ${bgColor} text-white`;
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentNode.parentNode.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0
    }).format(price);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Global functions for HTML onclick handlers
window.viewPropertyDetails = viewPropertyDetails;
window.readBlogPost = readBlogPost;
window.handleLogout = handleLogout;
window.showUserProfile = function() {
    showNotification('Profil sayfası geliştirme aşamasında.', 'info');
};
window.showUserFavorites = function() {
    showNotification('Favoriler sayfası geliştirme aşamasında.', 'info');
};

console.log('Arsarazi Main JavaScript Loaded Successfully');