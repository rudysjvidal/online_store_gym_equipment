const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const database = require('../models/Database');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const loginValidation = [
  body('username').notEmpty().trim().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('first').notEmpty().trim().withMessage('First name is required'),
  body('last').notEmpty().trim().withMessage('Last name is required'),
  body('street_address').notEmpty().trim().withMessage('Street address is required')
];

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { username, password } = req.body;
    
    const user = database.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'  
      });
    }

    const token = jwt.sign(
      { 
        username: user.username, 
        role: user.role,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        username: user.username,
        email: user.email,
        first: user.first,
        last: user.last,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during login'
    });
  }
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { username, email, password, first, last, street_address } = req.body;

    // Check if username already exists
    if (database.getUserByUsername(username)) {
      return res.status(400).json({
        error: 'Username already exists',
        message: 'Please choose a different username'
      });
    }

    // Check if email already exists
    if (database.getUserByEmail(email)) {
      return res.status(400).json({
        error: 'Email already exists',
        message: 'Please use a different email address'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      username,
      street_address,
      email,
      password: hashedPassword,
      first,
      last,
      role: 'user' // Default role
    };

    const success = database.addUser(newUser);
    if (!success) {
      return res.status(500).json({
        error: 'Registration failed',
        message: 'Could not create user account'
      });
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        username: newUser.username,
        email: newUser.email,
        first: newUser.first,
        last: newUser.last,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during registration'
    });
  }
};

module.exports = {
  login,
  register,
  loginValidation,
  registerValidation
};