// Admin Panel JavaScript for Arsarazi CRM
// Handles admin dashboard, property management, customer management, and analytics

let charts = {};
let currentSection = 'dashboard';

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
    setupAdminEventListeners();
    loadDashboardData();
    initializeCharts();
});

// Initialize admin panel
function initializeAdminPanel() {
    console.log('Admin panel initializing...');
    
    // Check if user is admin
    if (!currentUser || currentUser.type !== 'admin') {
        showNotification('Bu sayfaya erişim yetkiniz yok.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    // Update admin name
    const adminName = document.getElementById('adminName');
    if (adminName && currentUser) {
        adminName.textContent = currentUser.name || 'Admin User';
    }
}

// Setup event listeners
function setupAdminEventListeners() {
    // Sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
            sidebarOverlay.style.display = sidebar.classList.contains('-translate-x-full') ? 'none' : 'block';
        });
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.style.display = 'none';
        });
    }

    // Form submissions
    const addPropertyForm = document.getElementById('addPropertyForm');
    const addCustomerForm = document.getElementById('addCustomerForm');
    
    if (addPropertyForm) {
        addPropertyForm.addEventListener('submit', handleAddProperty);
    }
    
    if (addCustomerForm) {
        addCustomerForm.addEventListener('submit', handleAddCustomer);
    }
}

// Show section and update navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Update navigation
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
        item.classList.add('text-gray-700');
    });
    
    const activeItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeItem) {
        activeItem.classList.add('active');
        activeItem.classList.remove('text-gray-700');
    }
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    const titles = {
        dashboard: 'Dashboard',
        properties: 'Portföy Yönetimi',
        customers: 'Müşteri Yönetimi',
        leads: 'Potansiyel Müşteriler',
        analytics: 'Analitik & Raporlar',
        settings: 'Ayarlar'
    };
    
    if (pageTitle) {
        pageTitle.textContent = titles[sectionName] || 'Dashboard';
    }
    
    currentSection = sectionName;
    
    // Load section-specific data
    switch (sectionName) {
        case 'properties':
            loadPropertiesTable();
            break;
        case 'customers':
            loadCustomersTable();
            break;
        case 'leads':
            loadLeadsTable();
            break;
        case 'analytics':
            loadAnalyticsCharts();
            break;
    }
}

// Load dashboard data
function loadDashboardData() {
    // Update stats
    document.getElementById('totalPropertiesCount').textContent = properties.length;
    document.getElementById('activeCustomersCount').textContent = customers.filter(c => c.status === 'Aktif').length;
    document.getElementById('newLeadsCount').textContent = customers.filter(c => c.status === 'Yeni').length;
    document.getElementById('monthlySalesCount').textContent = Math.floor(Math.random() * 10); // Mock data
    
    // Load recent activities
    loadRecentActivities();
    
    // Load upcoming tasks
    loadUpcomingTasks();
}

// Load recent activities
function loadRecentActivities() {
    const container = document.getElementById('recentActivities');
    
    const activities = [
        {
            icon: 'fas fa-user-plus',
            color: 'text-green-600',
            text: 'Yeni müşteri eklendi: Emre Yıldız',
            time: '2 saat önce'
        },
        {
            icon: 'fas fa-home',
            color: 'text-blue-600',
            text: 'Yeni arsa eklendi: Büyükçekmece Sahil',
            time: '4 saat önce'
        },
        {
            icon: 'fas fa-phone',
            color: 'text-purple-600',
            text: 'Müşteri araması: Zeynep Acar',
            time: '6 saat önce'
        },
        {
            icon: 'fas fa-envelope',
            color: 'text-yellow-600',
            text: 'Yeni mesaj alındı',
            time: '8 saat önce'
        }
    ];
    
    container.innerHTML = activities.map(activity => `
        <div class="flex items-center">
            <div class="flex-shrink-0">
                <i class="${activity.icon} ${activity.color} text-lg"></i>
            </div>
            <div class="ml-4 flex-1">
                <p class="text-sm text-gray-900">${activity.text}</p>
                <p class="text-xs text-gray-500">${activity.time}</p>
            </div>
        </div>
    `).join('');
}

// Load upcoming tasks
function loadUpcomingTasks() {
    const container = document.getElementById('upcomingTasks');
    
    const tasks = [
        {
            text: 'Emre Yıldız ile görüşme planla',
            priority: 'high',
            dueDate: 'Bugün'
        },
        {
            text: 'Büyükçekmece arsa fotoğrafları çek',
            priority: 'medium',
            dueDate: 'Yarın'
        },
        {
            text: 'Zeynep Acar\'a teklif hazırla',
            priority: 'high',
            dueDate: '2 gün'
        },
        {
            text: 'Web sitesi güncelle',
            priority: 'low',
            dueDate: '1 hafta'
        }
    ];
    
    const priorityColors = {
        high: 'bg-red-100 text-red-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-green-100 text-green-800'
    };
    
    container.innerHTML = tasks.map(task => `
        <div class="flex items-center justify-between">
            <div class="flex-1">
                <p class="text-sm text-gray-900">${task.text}</p>
                <p class="text-xs text-gray-500">${task.dueDate}</p>
            </div>
            <span class="px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}">
                ${task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
            </span>
        </div>
    `).join('');
}

// Initialize charts
function initializeCharts() {
    // Property type distribution chart
    const propertyTypeCtx = document.getElementById('propertyTypeChart');
    if (propertyTypeCtx) {
        const propertyTypes = properties.reduce((acc, property) => {
            acc[property.type] = (acc[property.type] || 0) + 1;
            return acc;
        }, {});
        
        charts.propertyType = new Chart(propertyTypeCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(propertyTypes),
                datasets: [{
                    data: Object.values(propertyTypes),
                    backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Sales trend chart
    const salesTrendCtx = document.getElementById('salesTrendChart');
    if (salesTrendCtx) {
        charts.salesTrend = new Chart(salesTrendCtx, {
            type: 'line',
            data: {
                labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
                datasets: [{
                    label: 'Satış Sayısı',
                    data: [12, 19, 3, 5, 2, 3],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Load analytics charts
function loadAnalyticsCharts() {
    // Customer type distribution
    const customerTypeCtx = document.getElementById('customerTypeChart');
    if (customerTypeCtx) {
        const customerTypes = customers.reduce((acc, customer) => {
            acc[customer.type] = (acc[customer.type] || 0) + 1;
            return acc;
        }, {});
        
        if (charts.customerType) {
            charts.customerType.destroy();
        }
        
        charts.customerType = new Chart(customerTypeCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(customerTypes),
                datasets: [{
                    data: Object.values(customerTypes),
                    backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Customer growth chart
    const customerGrowthCtx = document.getElementById('customerGrowthChart');
    if (customerGrowthCtx) {
        if (charts.customerGrowth) {
            charts.customerGrowth.destroy();
        }
        
        charts.customerGrowth = new Chart(customerGrowthCtx, {
            type: 'bar',
            data: {
                labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
                datasets: [{
                    label: 'Yeni Müşteri',
                    data: [5, 10, 8, 15, 12, 18],
                    backgroundColor: '#10B981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Load properties table
function loadPropertiesTable() {
    const container = document.getElementById('propertiesTable');
    
    if (properties.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-home text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">Henüz arsa eklenmemiş</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arsa</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konum</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alan</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${properties.map(property => `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <img src="${property.images[0]}" alt="${property.title}" class="w-10 h-10 rounded-lg object-cover mr-4">
                                <div>
                                    <div class="text-sm font-medium text-gray-900">${property.title}</div>
                                    <div class="text-sm text-gray-500">${property.type}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${property.location}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${property.area.toLocaleString()} m²</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${property.price.toLocaleString()} ₺</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                ${property.status}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onclick="editProperty(${property.id})" class="text-indigo-600 hover:text-indigo-900 mr-4">Düzenle</button>
                            <button onclick="deleteProperty(${property.id})" class="text-red-600 hover:text-red-900">Sil</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Load customers table
function loadCustomersTable() {
    const container = document.getElementById('customersTable');
    
    if (customers.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-users text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">Henüz müşteri eklenmemiş</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son İletişim</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${customers.map(customer => `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                    <i class="fas fa-user text-blue-600"></i>
                                </div>
                                <div>
                                    <div class="text-sm font-medium text-gray-900">${customer.name}</div>
                                    <div class="text-sm text-gray-500">${customer.email || 'E-posta yok'}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${customer.phone}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${customer.type}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                ${customer.status}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${new Date(customer.last_contact).toLocaleDateString('tr-TR')}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onclick="editCustomer(${customer.id})" class="text-indigo-600 hover:text-indigo-900 mr-4">Düzenle</button>
                            <button onclick="deleteCustomer(${customer.id})" class="text-red-600 hover:text-red-900">Sil</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Load leads table
function loadLeadsTable() {
    const container = document.getElementById('leadsTable');
    const leads = customers.filter(c => c.status === 'Yeni' || c.type.includes('Potansiyel'));
    
    if (leads.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-user-plus text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">Potansiyel müşteri bulunmuyor</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İsim</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İlgi Alanı</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kaynak</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${leads.map(lead => `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                                    <i class="fas fa-user text-yellow-600 text-sm"></i>
                                </div>
                                <div class="text-sm font-medium text-gray-900">${lead.name}</div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">${lead.phone}</div>
                            <div class="text-sm text-gray-500">${lead.email || 'E-posta yok'}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${lead.interests.join(', ') || 'Belirtilmemiş'}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${lead.source || 'Web Sitesi'}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${new Date(lead.created_at).toLocaleDateString('tr-TR')}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onclick="convertLead(${lead.id})" class="text-green-600 hover:text-green-900 mr-4">Müşteriye Çevir</button>
                            <button onclick="deleteLead(${lead.id})" class="text-red-600 hover:text-red-900">Sil</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Show add property modal
function showAddPropertyModal() {
    document.getElementById('addPropertyModal').classList.remove('hidden');
}

// Close add property modal
function closeAddPropertyModal() {
    document.getElementById('addPropertyModal').classList.add('hidden');
    document.getElementById('addPropertyForm').reset();
}

// Handle add property form submission
function handleAddProperty(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const area = parseInt(document.getElementById('propertyArea').value);
    const price = parseInt(document.getElementById('propertyPrice').value);
    
    const newProperty = {
        id: Date.now(),
        title: document.getElementById('propertyTitle').value,
        location: document.getElementById('propertyLocation').value,
        area: area,
        price: price,
        pricePerM2: Math.round(price / area),
        type: document.getElementById('propertyType').value,
        status: "Satılık",
        description: document.getElementById('propertyDescription').value,
        features: ["Yeni Eklendi", "Güncel Fiyat"],
        images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop"],
        zoning: document.getElementById('propertyZoning').value,
        investment_potential: document.getElementById('investmentPotential').value,
        created_at: new Date().toISOString(),
        contact_person: document.getElementById('contactPerson').value,
        phone: document.getElementById('contactPhone').value
    };
    
    properties.push(newProperty);
    saveDataToStorage();
    
    closeAddPropertyModal();
    showNotification('Arsa başarıyla eklendi!', 'success');
    
    if (currentSection === 'properties') {
        loadPropertiesTable();
    }
    
    loadDashboardData();
}

// Show add customer modal
function showAddCustomerModal() {
    document.getElementById('addCustomerModal').classList.remove('hidden');
}

// Close add customer modal
function closeAddCustomerModal() {
    document.getElementById('addCustomerModal').classList.add('hidden');
    document.getElementById('addCustomerForm').reset();
}

// Handle add customer form submission
function handleAddCustomer(e) {
    e.preventDefault();
    
    const newCustomer = {
        id: Date.now(),
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value,
        type: document.getElementById('customerType').value,
        status: "Aktif",
        interests: [],
        budget: {
            min: parseInt(document.getElementById('budgetMin').value) || 0,
            max: parseInt(document.getElementById('budgetMax').value) || 0
        },
        notes: document.getElementById('customerNotes').value,
        created_at: new Date().toISOString(),
        last_contact: new Date().toISOString(),
        source: "Admin Panel"
    };
    
    customers.push(newCustomer);
    saveDataToStorage();
    
    closeAddCustomerModal();
    showNotification('Müşteri başarıyla eklendi!', 'success');
    
    if (currentSection === 'customers') {
        loadCustomersTable();
    }
    
    loadDashboardData();
}

// Edit property
function editProperty(propertyId) {
    showNotification('Düzenleme özelliği geliştirme aşamasında.', 'info');
}

// Delete property
function deleteProperty(propertyId) {
    if (confirm('Bu arsayı silmek istediğinizden emin misiniz?')) {
        const index = properties.findIndex(p => p.id === propertyId);
        if (index > -1) {
            properties.splice(index, 1);
            saveDataToStorage();
            showNotification('Arsa silindi.', 'success');
            
            if (currentSection === 'properties') {
                loadPropertiesTable();
            }
            
            loadDashboardData();
        }
    }
}

// Edit customer
function editCustomer(customerId) {
    showNotification('Düzenleme özelliği geliştirme aşamasında.', 'info');
}

// Delete customer
function deleteCustomer(customerId) {
    if (confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
        const index = customers.findIndex(c => c.id === customerId);
        if (index > -1) {
            customers.splice(index, 1);
            saveDataToStorage();
            showNotification('Müşteri silindi.', 'success');
            
            if (currentSection === 'customers') {
                loadCustomersTable();
            }
            
            loadDashboardData();
        }
    }
}

// Convert lead to customer
function convertLead(leadId) {
    const lead = customers.find(c => c.id === leadId);
    if (lead) {
        lead.status = 'Aktif';
        lead.type = lead.type.replace('Potansiyel ', '');
        saveDataToStorage();
        showNotification('Potansiyel müşteri aktif müşteriye çevrildi!', 'success');
        
        if (currentSection === 'leads') {
            loadLeadsTable();
        }
        
        loadDashboardData();
    }
}

// Delete lead
function deleteLead(leadId) {
    if (confirm('Bu potansiyel müşteriyi silmek istediğinizden emin misiniz?')) {
        const index = customers.findIndex(c => c.id === leadId);
        if (index > -1) {
            customers.splice(index, 1);
            saveDataToStorage();
            showNotification('Potansiyel müşteri silindi.', 'success');
            
            if (currentSection === 'leads') {
                loadLeadsTable();
            }
            
            loadDashboardData();
        }
    }
}

// Global functions for HTML onclick handlers
window.showSection = showSection;
window.showAddPropertyModal = showAddPropertyModal;
window.closeAddPropertyModal = closeAddPropertyModal;
window.showAddCustomerModal = showAddCustomerModal;
window.closeAddCustomerModal = closeAddCustomerModal;
window.editProperty = editProperty;
window.deleteProperty = deleteProperty;
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;
window.convertLead = convertLead;
window.deleteLead = deleteLead;

console.log('Admin Panel JavaScript loaded successfully');