const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import controllers
const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const userController = require('./controllers/userController');
const orderController = require('./controllers/orderController');

// Import middleware
const { 
  authenticateToken, 
  requireAdmin, 
  requireOwnershipOrAdmin,
  requireOrderOwnershipOrAdmin 
} = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  }
});
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again later'
  }
});

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Authentication routes
app.post('/login', authLimiter, authController.loginValidation, authController.login);
app.post('/register', authLimiter, authController.registerValidation, authController.register);

// Product routes
app.get('/products', productController.getAllProducts);
app.get('/products/search', productController.searchValidation, productController.searchProducts);
app.post('/products', authenticateToken, requireAdmin, productController.productValidation, productController.createProduct);
app.patch('/products/:id', authenticateToken, requireAdmin, productController.productValidation, productController.updateProduct);
app.delete('/products/:id', authenticateToken, requireAdmin, productController.deleteProduct);

// User routes
app.get('/users/:username', authenticateToken, requireOwnershipOrAdmin, userController.getUserByUsername);
app.patch('/users/:username', authenticateToken, requireOwnershipOrAdmin, userController.userUpdateValidation, userController.updateUser);

// Order routes
app.get('/orders', authenticateToken, requireAdmin, orderController.getAllOrders);
app.get('/orders/:id', authenticateToken, requireOrderOwnershipOrAdmin, orderController.getOrderById);
app.post('/checkout', authenticateToken, orderController.checkoutValidation, orderController.checkout);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;