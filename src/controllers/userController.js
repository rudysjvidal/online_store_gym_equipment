const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const database = require('../models/Database');

const userUpdateValidation = [
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('first').optional().notEmpty().trim().withMessage('First name cannot be empty'),
  body('last').optional().notEmpty().trim().withMessage('Last name cannot be empty'),
  body('street_address').optional().notEmpty().trim().withMessage('Street address cannot be empty'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const getUserByUsername = (req, res) => {
  try {
    const { username } = req.params;
    
    const user = database.getUserByUsername(username);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not retrieve user information'
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { username } = req.params;
    const updates = req.body;

    const existingUser = database.getUserByUsername(username);
    if (!existingUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Check for email conflicts (excluding current user)
    if (updates.email && updates.email !== existingUser.email) {
      const emailUser = database.getUserByEmail(updates.email);
      if (emailUser) {
        return res.status(400).json({
          error: 'Email already exists',
          message: 'Please use a different email address'
        });
      }
    }

    // Hash password if provided
    if (updates.password) {
      const saltRounds = 10;
      updates.password = await bcrypt.hash(updates.password, saltRounds);
    }

    const success = database.updateUser(username, updates);
    if (!success) {
      return res.status(500).json({
        error: 'Update failed',
        message: 'Could not update user information'
      });
    }

    const updatedUser = database.getUserByUsername(username);
    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
      message: 'User updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not update user information'
    });
  }
};

module.exports = {
  getUserByUsername,
  updateUser,
  userUpdateValidation
};