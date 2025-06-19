# Owner Dashboard - Bella Vista

A real-time dashboard for restaurant owners to monitor and manage incoming orders.

## Features

- **Real-time Order Monitoring**: Live updates via WebSocket connection
- **Order Management**: Accept, decline, and update order status
- **Daily Statistics**: Track orders, revenue, and performance metrics
- **Activity Feed**: Recent order activity and status changes
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Setup Instructions

### 1. Configure API Connection
- Open `script.js`
- Update the server URLs:
  ```javascript
  const API_BASE_URL = 'https://your-server-domain.com';
  const WS_URL = 'wss://your-server-domain.com/ws';
  ```

### 2. Deploy
- Upload all files to your web hosting service
- Ensure your server supports WebSocket connections
- Test the real-time functionality

## API Integration

The dashboard expects these API endpoints:

### Get Dashboard Statistics
```
GET /api/dashboard/stats
```
Returns daily statistics:
```json
{
  "totalOrders": 15,
  "pendingOrders": 3,
  "completedOrders": 10,
  "revenue": 245.67
}
```

### Get Orders by Status
```
GET /api/orders?status=pending
```
Returns array of orders with specified status.

### Get Order Details
```
GET /api/orders/:id
```
Returns detailed order information including items.

### Update Order Status
```
PATCH /api/orders/:id/status
Content-Type: application/json
```
Send status update:
```json
{
  "status": "preparing"
}
```

## WebSocket Integration

The dashboard connects to WebSocket endpoint `/ws` for real-time updates.

### Expected Message Types

#### New Order
```json
{
  "type": "new_order",
  "order": {
    "id": 123,
    "customerName": "John Doe",
    "total": 25.99
  }
}
```

#### Order Status Update
```json
{
  "type": "order_status_update",
  "orderId": 123,
  "status": "preparing"
}
```

## Order Status Flow

1. **pending** - New order awaiting acceptance
2. **preparing** - Order accepted and being prepared
3. **ready** - Order ready for pickup/delivery
4. **completed** - Order fulfilled
5. **cancelled** - Order declined or cancelled

## Customization

### Dashboard Colors
Update colors in the Tailwind config:
```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#your-primary-color',
                pending: '#your-pending-color',
                ready: '#your-ready-color',
                cancelled: '#your-cancelled-color'
            }
        }
    }
}
```

### Notification Settings
Modify notification behavior in `script.js`:
- Auto-removal timeout
- Notification types
- Sound alerts (can be added)

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Files Structure

```
owner-dashboard/
├── index.html          # Main HTML structure
├── script.js           # JavaScript functionality
└── README.md          # Documentation
```

## Features Breakdown

### Real-time Updates
- Automatic connection to WebSocket server
- Live order notifications
- Real-time status changes
- Connection status indicator

### Order Management
- View pending orders with customer details
- Accept/decline orders with one click
- Quick status updates
- Order history tracking

### Analytics
- Daily revenue tracking
- Order count statistics
- Performance metrics
- Export capabilities (can be extended)

## Security Considerations

- Use HTTPS/WSS in production
- Implement authentication for dashboard access
- Validate all status updates server-side
- Rate limit API endpoints

## Performance Tips

- WebSocket auto-reconnection on disconnect
- Efficient DOM updates
- Lazy loading for large order lists
- Caching for frequently accessed data

## Troubleshooting

### WebSocket Connection Issues
- Check server WebSocket endpoint
- Verify firewall settings
- Ensure proper CORS configuration

### API Connection Problems
- Verify server URL configuration
- Check network connectivity
- Review server logs for errors

### Real-time Updates Not Working
- Confirm WebSocket connection status
- Check browser console for errors
- Verify server is broadcasting messages correctly