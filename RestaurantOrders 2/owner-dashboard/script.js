// Configuration - Update with your server URL
const API_BASE_URL = 'http://localhost:5000'; // Replace with your server URL
const WS_URL = 'ws://localhost:5000/ws'; // Replace with your WebSocket URL

// Application state
let orders = [];
let stats = {
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    revenue: 0
};
let socket = null;
let isConnected = false;

// DOM elements
const connectionStatus = document.getElementById('connection-status');
const connectionText = document.getElementById('connection-text');
const pendingOrdersList = document.getElementById('pending-orders-list');
const activityList = document.getElementById('activity-list');
const notificationsContainer = document.getElementById('notifications');

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    connectWebSocket();
    
    // Refresh data every 30 seconds
    setInterval(loadDashboardData, 30000);
});

// Load dashboard data from API
async function loadDashboardData() {
    try {
        // Load stats
        const statsResponse = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
        if (statsResponse.ok) {
            stats = await statsResponse.json();
            updateStatsUI();
        }
        
        // Load pending orders
        const ordersResponse = await fetch(`${API_BASE_URL}/api/orders?status=pending`);
        if (ordersResponse.ok) {
            const pendingOrders = await ordersResponse.json();
            
            // Get detailed order information
            const detailedOrders = await Promise.all(
                pendingOrders.map(async (order) => {
                    const detailResponse = await fetch(`${API_BASE_URL}/api/orders/${order.id}`);
                    return detailResponse.json();
                })
            );
            
            orders = detailedOrders;
            updateOrdersUI();
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

// WebSocket connection
function connectWebSocket() {
    try {
        socket = new WebSocket(WS_URL);
        
        socket.onopen = function() {
            isConnected = true;
            updateConnectionStatus();
            showNotification('Connected to live orders', 'success');
        };
        
        socket.onclose = function() {
            isConnected = false;
            updateConnectionStatus();
            
            // Attempt to reconnect after 3 seconds
            setTimeout(connectWebSocket, 3000);
        };
        
        socket.onerror = function(error) {
            console.error('WebSocket error:', error);
            isConnected = false;
            updateConnectionStatus();
        };
        
        socket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
        
    } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        isConnected = false;
        updateConnectionStatus();
    }
}

// Handle WebSocket messages
function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'new_order':
            showNotification(`New order #${data.order.id} from ${data.order.customerName}`, 'info');
            addActivity(`New order #${data.order.id} received`);
            loadDashboardData(); // Refresh data
            break;
            
        case 'order_status_update':
            showNotification(`Order #${data.orderId} is now ${data.status}`, 'info');
            addActivity(`Order #${data.orderId} ${data.status}`);
            loadDashboardData(); // Refresh data
            break;
    }
}

// Update connection status UI
function updateConnectionStatus() {
    if (isConnected) {
        connectionStatus.className = 'h-3 w-3 rounded-full bg-secondary-light pulse-dot';
        connectionText.textContent = 'Live Orders';
    } else {
        connectionStatus.className = 'h-3 w-3 rounded-full bg-red-500';
        connectionText.textContent = 'Disconnected';
    }
}

// Update stats UI
function updateStatsUI() {
    document.getElementById('total-orders').textContent = stats.totalOrders;
    document.getElementById('pending-orders').textContent = stats.pendingOrders;
    document.getElementById('completed-orders').textContent = stats.completedOrders;
    document.getElementById('revenue').textContent = stats.revenue.toFixed(2);
    document.getElementById('today-revenue').textContent = stats.revenue.toFixed(2);
    document.getElementById('pending-badge').textContent = stats.pendingOrders;
}

// Update orders UI
function updateOrdersUI() {
    if (orders.length === 0) {
        pendingOrdersList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                </svg>
                <p>No pending orders</p>
            </div>
        `;
    } else {
        pendingOrdersList.innerHTML = orders.map(order => `
            <div class="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h3 class="font-semibold text-gray-900">Order #${order.id}</h3>
                        <p class="text-sm text-gray-600">Customer: ${order.customerName}</p>
                        <p class="text-sm text-gray-500">${formatTime(order.createdAt)}</p>
                    </div>
                    <div class="text-right">
                        <span class="text-lg font-bold text-gray-900">$${order.total.toFixed(2)}</span>
                        <div class="flex space-x-2 mt-2">
                            <button 
                                onclick="updateOrderStatus(${order.id}, 'preparing')" 
                                class="bg-ready hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium"
                            >
                                Accept
                            </button>
                            <button 
                                onclick="updateOrderStatus(${order.id}, 'cancelled')" 
                                class="bg-cancelled hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                </div>
                <div class="border-t pt-2">
                    <p class="text-sm font-medium text-gray-700 mb-1">Items:</p>
                    <ul class="text-sm text-gray-600 space-y-1">
                        ${order.orderItems ? order.orderItems.map(item => `
                            <li>${item.quantity}x ${item.menuItem.name} - $${(item.price * item.quantity).toFixed(2)}</li>
                        `).join('') : ''}
                    </ul>
                </div>
            </div>
        `).join('');
    }
}

// Update order status
async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showNotification(`Order #${orderId} ${status}`, 'success');
            loadDashboardData(); // Refresh data
        } else {
            throw new Error('Failed to update order status');
        }
        
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Failed to update order status', 'error');
    }
}

// Add activity to recent activity list
function addActivity(message) {
    const activityItem = `
        <div class="flex items-center space-x-3">
            <div class="h-2 w-2 bg-blue-500 rounded-full"></div>
            <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">${message}</p>
                <p class="text-xs text-gray-500">Just now</p>
            </div>
        </div>
    `;
    
    // Check if there's a placeholder message
    if (activityList.innerHTML.includes('Real-time activity will appear here')) {
        activityList.innerHTML = '';
    }
    
    // Add new activity at the top
    activityList.insertAdjacentHTML('afterbegin', activityItem);
    
    // Keep only the last 5 activities
    const activities = activityList.querySelectorAll('div.flex');
    if (activities.length > 5) {
        activities[activities.length - 1].remove();
    }
}

// Format time display
function formatTime(dateString) {
    const now = new Date();
    const orderTime = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours} hours ago`;
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `p-4 rounded-lg text-white slide-in ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        type === 'warning' ? 'bg-yellow-500' :
        'bg-blue-500'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="text-sm font-medium">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    `;
    
    notificationsContainer.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Send ping to keep WebSocket alive
setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
    }
}, 30000);