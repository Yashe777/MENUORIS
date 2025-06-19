// Configuration - Update with your server URL
const API_BASE_URL = 'http://localhost:5000'; // Replace with your server URL

// Sample menu data (fallback if API is not available)
const sampleMenuItems = [
    {
        id: 1,
        name: "Bruschetta Italiana",
        description: "Fresh tomatoes, basil, and garlic on toasted bread with olive oil",
        price: 8.99,
        category: "appetizers",
        image: "https://images.unsplash.com/photo-1572441713132-51c75654db73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    },
    {
        id: 2,
        name: "Antipasto Platter",
        description: "Selection of cured meats, cheeses, olives, and vegetables",
        price: 14.99,
        category: "appetizers",
        image: "https://images.unsplash.com/photo-1544124499-58912cbddaad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    },
    {
        id: 3,
        name: "Fettuccine Alfredo",
        description: "Rich and creamy pasta with parmesan cheese and butter",
        price: 16.99,
        category: "pasta",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    },
    {
        id: 4,
        name: "Spaghetti Carbonara",
        description: "Traditional Roman pasta with eggs, pancetta, and pecorino cheese",
        price: 18.99,
        category: "pasta",
        image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    },
    {
        id: 5,
        name: "Margherita Pizza",
        description: "Classic pizza with fresh mozzarella, tomatoes, and basil",
        price: 15.99,
        category: "pizza",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    },
    {
        id: 6,
        name: "Pepperoni Pizza",
        description: "Classic pepperoni with mozzarella cheese on crispy crust",
        price: 17.99,
        category: "pizza",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    },
    {
        id: 7,
        name: "Tiramisu",
        description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
        price: 7.99,
        category: "desserts",
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    },
    {
        id: 8,
        name: "Cannoli",
        description: "Crispy pastry shells filled with sweet ricotta and chocolate chips",
        price: 6.99,
        category: "desserts",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    }
];

// Application state
let menuItems = [];
let cart = [];
let currentCategory = 'all';

// DOM elements
const menuItemsContainer = document.getElementById('menu-items');
const cartSidebar = document.getElementById('cart-sidebar');
const cartBackdrop = document.getElementById('cart-backdrop');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const orderModal = document.getElementById('order-modal');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadMenuItems();
    setupEventListeners();
});

// Load menu items from API
async function loadMenuItems() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/menu-items`);
        if (response.ok) {
            menuItems = await response.json();
            renderMenuItems(menuItems);
        } else {
            throw new Error('API not available');
        }
    } catch (error) {
        console.log('API not available, using sample data');
        menuItems = sampleMenuItems;
        renderMenuItems(menuItems);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Cart button
    document.getElementById('cart-btn').addEventListener('click', openCart);
    document.getElementById('close-cart').addEventListener('click', closeCart);
    document.getElementById('cart-backdrop').addEventListener('click', closeCart);
    
    // Checkout button
    document.getElementById('checkout-btn').addEventListener('click', openOrderModal);
    
    // Order modal
    document.getElementById('close-modal').addEventListener('click', closeOrderModal);
    document.getElementById('cancel-order').addEventListener('click', closeOrderModal);
    document.getElementById('submit-order').addEventListener('click', submitOrder);
    document.getElementById('continue-shopping').addEventListener('click', closeOrderModal);
}

// Category filtering
function filterCategory(category) {
    currentCategory = category;
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-primary', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
    });
    
    event.target.classList.add('active', 'bg-primary', 'text-white');
    event.target.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
    
    // Filter items
    const filteredItems = category === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === category);
    
    renderMenuItems(filteredItems);
}

// Render menu items
function renderMenuItems(items) {
    menuItemsContainer.innerHTML = items.map(item => `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <img src="${item.image}" alt="${item.name}" class="w-full h-48 object-cover">
            <div class="p-6">
                <h3 class="text-xl font-semibold text-gray-900 mb-2">${item.name}</h3>
                <p class="text-gray-600 mb-4">${item.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-2xl font-bold text-primary">$${item.price.toFixed(2)}</span>
                    <button onclick="addToCart(${item.id})" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 font-medium transition-colors duration-200 rounded-md flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path>
                        </svg>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Cart functions
function addToCart(itemId) {
    const item = menuItems.find(item => item.id === itemId);
    if (!item) return;
    
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1
        });
    }
    
    updateCartUI();
    showNotification(`${item.name} added to cart!`);
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartUI();
}

function updateQuantity(itemId, quantity) {
    if (quantity <= 0) {
        removeFromCart(itemId);
        return;
    }
    
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity = quantity;
        updateCartUI();
    }
}

function updateCartUI() {
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const total = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Update cart count
    if (itemCount > 0) {
        cartCount.textContent = itemCount;
        cartCount.classList.remove('hidden');
    } else {
        cartCount.classList.add('hidden');
    }
    
    // Update cart total
    cartTotal.textContent = `$${total.toFixed(2)}`;
    
    // Update checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.disabled = cart.length === 0;
    
    // Render cart items
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>
                </svg>
                <p>Your cart is empty</p>
                <p class="text-sm">Add some delicious items to get started!</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = `
            <div class="space-y-4">
                ${cart.map(item => `
                    <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg">
                        <div class="flex-1">
                            <h4 class="font-medium text-gray-900">${item.name}</h4>
                            <p class="text-primary font-semibold">$${item.price.toFixed(2)}</p>
                            <div class="flex items-center space-x-2 mt-2">
                                <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" class="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                                    </svg>
                                </button>
                                <span class="text-sm font-medium w-8 text-center">${item.quantity}</span>
                                <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" class="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <button onclick="removeFromCart(${item.id})" class="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"></path>
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                            </svg>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Cart modal functions
function openCart() {
    cartSidebar.classList.remove('translate-x-full');
    cartBackdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartSidebar.classList.add('translate-x-full');
    cartBackdrop.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Order modal functions
function openOrderModal() {
    if (cart.length === 0) return;
    
    closeCart();
    
    // Update order summary
    const orderSummary = document.getElementById('order-summary');
    const orderTotal = document.getElementById('order-total');
    
    const total = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    orderSummary.innerHTML = cart.map(item => `
        <div class="flex justify-between">
            <span>${item.quantity}x ${item.name}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    orderTotal.textContent = `$${total.toFixed(2)}`;
    
    orderModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
    orderModal.classList.add('hidden');
    document.getElementById('order-form').classList.remove('hidden');
    document.getElementById('order-success').classList.add('hidden');
    document.getElementById('customerName').value = '';
    document.body.style.overflow = 'auto';
}

// Submit order
async function submitOrder() {
    const customerName = document.getElementById('customerName').value.trim();
    
    if (!customerName) {
        showNotification('Please enter your name', 'error');
        return;
    }
    
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    const orderData = {
        customerName,
        items: cart.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price
        }))
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to place order');
        }
        
        // Show success message
        document.getElementById('order-form').classList.add('hidden');
        document.getElementById('order-success').classList.remove('hidden');
        
        // Clear cart
        cart = [];
        updateCartUI();
        
        showNotification('Order placed successfully!', 'success');
        
    } catch (error) {
        console.error('Error submitting order:', error);
        showNotification('Failed to place order. Please try again.', 'error');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg text-white slide-in ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize category buttons
document.addEventListener('DOMContentLoaded', function() {
    const firstCategoryBtn = document.querySelector('.category-btn');
    if (firstCategoryBtn) {
        firstCategoryBtn.classList.add('active', 'bg-primary', 'text-white');
    }
});