# RESTful Express Server with JWT Authentication

A comprehensive RESTful API server built with Node.js and Express, featuring JWT authentication, role-based access control, and a flat file JSON database.

## 🚀 Features

- **JWT Authentication** with bcrypt password hashing
- **Role-based access control** (admin/user permissions)
- **Flat file JSON database** with products, users, and orders
- **Product search** with case-insensitive partial matching
- **Mock checkout system** with inventory management
- **Rate limiting** and security middleware
- **Input validation** and comprehensive error handling
- **Request logging** with Morgan

## 📁 Project Structure

```
src/
├── controllers/           # Route handlers
│   ├── authController.js     # Authentication routes
│   ├── productController.js  # Product CRUD operations
│   ├── userController.js     # User management
│   └── orderController.js    # Order processing
├── middleware/
│   └── authMiddleware.js     # JWT and authorization middleware
├── models/
│   ├── Database.js          # Database operations
│   └── database.json        # JSON data store
├── scripts/
│   └── seedDatabase.js      # Database seeding script
└── app.js                   # Main application file
```

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Seed the database with initial data:
```bash
node src/scripts/seedDatabase.js
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## 📝 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/login` | User login | Public |
| POST | `/register` | User registration | Public |

### Products

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/products` | Get all products | Public |
| GET | `/products/search?q=query` | Search products | Public |
| POST | `/products` | Create product | Admin only |
| PATCH | `/products/:id` | Update product | Admin only |
| DELETE | `/products/:id` | Delete product | Admin only |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/users/:username` | Get user details | Owner or Admin |
| PATCH | `/users/:username` | Update user | Owner or Admin |

### Orders

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/orders` | Get all orders | Admin only |
| GET | `/orders/:id` | Get specific order | Owner or Admin |
| POST | `/checkout` | Create new order | Authenticated users |

## 🔑 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Demo Accounts

After seeding the database, you can use these accounts:

- **Admin**: `username: "admin"`, `password: "admin123"`
- **User**: `username: "john_doe"`, `password: "user123"`
- **User**: `username: "jane_smith"`, `password: "user123"`

## 📋 Example Usage

### Login
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Get Products
```bash
curl http://localhost:3000/products
```

### Search Products
```bash
curl "http://localhost:3000/products/search?q=shirt"
```

### Create Product (Admin only)
```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "price": 29.99,
    "categories": ["new", "category"],
    "on_hand": 50,
    "description": "Product description"
  }'
```

### Checkout
```bash
curl -X POST http://localhost:3000/checkout \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {"product_id": "1", "quantity": 2}
    ],
    "ship_address": "123 Main St, City, State 12345"
  }'
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: 24-hour expiration
- **Rate Limiting**: 100 requests per 15 minutes (5 for auth endpoints)
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: express-validator for request validation

## 🗄️ Database Schema

### Products
```json
{
  "id": "string",
  "name": "string",
  "price": "number",
  "categories": ["string"],
  "on_hand": "number",
  "description": "string"
}
```

### Users
```json
{
  "username": "string",
  "street_address": "string",
  "email": "string",
  "password": "hashed_string",
  "first": "string",
  "last": "string",
  "role": "admin|user"
}
```

### Orders
```json
{
  "id": "string",
  "username": "string",
  "order_date": "ISO_8601_timestamp",
  "ship_address": "string",
  "products": [
    {
      "product_id": "string",
      "quantity": "number",
      "price": "number"
    }
  ]
}
```

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 🚀 Health Check

Check server status:
```bash
curl http://localhost:3000/health
```

## 📝 Environment Variables

- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: JWT signing secret (change in production!)
- `NODE_ENV`: Environment (development/production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📄 License

MIT License