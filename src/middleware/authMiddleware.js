const jwt = require('jsonwebtoken');
const database = require('../models/Database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Please provide a valid authentication token'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }
    
    // Add user info to request
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin access required',
      message: 'This action requires administrator privileges'
    });
  }
  next();
};

const requireOwnershipOrAdmin = (req, res, next) => {
  const requestedUsername = req.params.username;
  
  if (req.user.role === 'admin' || req.user.username === requestedUsername) {
    next();
  } else {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only access your own data'
    });
  }
};

const requireOrderOwnershipOrAdmin = (req, res, next) => {
  const orderId = req.params.id;
  const order = database.getOrderById(orderId);
  
  if (!order) {
    return res.status(404).json({
      error: 'Order not found',
      message: 'The requested order does not exist'
    });
  }
  
  if (req.user.role === 'admin' || req.user.username === order.username) {
    next();
  } else {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only access your own orders'
    });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin,
  requireOrderOwnershipOrAdmin,
  JWT_SECRET
};