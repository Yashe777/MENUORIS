# Bella Vista - Digital Menu

A modern, responsive digital menu for restaurant customers to browse items and place orders.

## Features

- **Responsive Design**: Works on all devices (desktop, tablet, mobile)
- **Category Filtering**: Browse menu by categories (Appetizers, Pasta, Pizza, Desserts)
- **Shopping Cart**: Add items, adjust quantities, and manage orders
- **Order Placement**: Complete order form with customer details
- **Real-time Updates**: Connect to your restaurant's backend API

## Setup Instructions

### 1. Configure API Connection
- Open `script.js`
- Update `API_BASE_URL` with your server URL:
  ```javascript
  const API_BASE_URL = 'https://your-server-domain.com';
  ```

### 2. Customize Restaurant Information
- Edit restaurant details in `index.html`:
  - Restaurant name and tagline
  - Contact information (phone, email, address)
  - Operating hours
  - Hero image URL

### 3. Deploy
- Upload all files to your web hosting service
- Ensure your server supports CORS for API calls
- Test the connection with your backend

## API Integration

The menu expects these API endpoints:

### Get Menu Items
```
GET /api/menu-items
```
Returns array of menu items:
```json
[
  {
    "id": 1,
    "name": "Item Name",
    "description": "Item description",
    "price": 12.99,
    "category": "appetizers",
    "image": "https://image-url.com/image.jpg"
  }
]
```

### Place Order
```
POST /api/orders
Content-Type: application/json
```
Send order data:
```json
{
  "customerName": "Customer Name",
  "items": [
    {
      "id": 1,
      "quantity": 2,
      "price": 12.99
    }
  ]
}
```

## Customization

### Colors and Branding
Update the Tailwind config in `index.html`:
```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#your-primary-color',
                'primary-dark': '#your-primary-dark-color'
            }
        }
    }
}
```

### Menu Categories
Edit categories in `script.js` and update the category navigation in `index.html`.

### Images
- Replace hero image URL in the hero section
- Ensure menu item images are optimized for web (recommended: 800x600px)

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Files Structure

```
customer-menu/
├── index.html          # Main HTML structure
├── script.js           # JavaScript functionality
└── README.md          # Documentation
```

## Offline Functionality

The app includes sample menu data that will be used if the API is not available, ensuring the menu works even during server downtime.

## Performance Tips

- Optimize images for web delivery
- Use a CDN for better global performance
- Enable gzip compression on your server
- Consider implementing service workers for offline support

## Security Notes

- Always use HTTPS in production
- Validate all user inputs on the server side
- Implement rate limiting for API endpoints
- Sanitize customer names and order data