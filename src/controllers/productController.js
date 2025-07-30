const { body, validationResult, query } = require('express-validator');
const database = require('../models/Database');

const productValidation = [
  body('name').notEmpty().trim().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categories').isArray({ min: 1 }).withMessage('Categories must be a non-empty array'),
  body('on_hand').isInt({ min: 0 }).withMessage('On hand quantity must be a non-negative integer'),
  body('description').notEmpty().trim().withMessage('Description is required')
];

const searchValidation = [
  query('q').notEmpty().trim().withMessage('Search query is required')
];

const getAllProducts = (req, res) => {
  try {
    const products = database.getAllProducts();
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not retrieve products'
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, price, categories, on_hand, description } = req.body;
    
    const newProduct = {
      id: database.generateId('products'),
      name,
      price: parseFloat(price),
      categories,
      on_hand: parseInt(on_hand),
      description
    };

    const success = database.addProduct(newProduct);
    if (!success) {
      return res.status(500).json({
        error: 'Creation failed',
        message: 'Could not create product'
      });
    }

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not create product'
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const updates = req.body;

    // Check if product exists
    const existingProduct = database.getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    // Process updates
    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.on_hand) updates.on_hand = parseInt(updates.on_hand);

    const success = database.updateProduct(id, updates);
    if (!success) {
      return res.status(500).json({
        error: 'Update failed',
        message: 'Could not update product'
      });
    }

    const updatedProduct = database.getProductById(id);
    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not update product'
    });
  }
};

const deleteProduct = (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = database.getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    const success = database.deleteProduct(id);
    if (!success) {
      return res.status(500).json({
        error: 'Deletion failed',
        message: 'Could not delete product'
      });
    }

    res.json({
      message: 'Product deleted successfully',
      product: existingProduct
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not delete product'
    });
  }
};

const searchProducts = (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { q } = req.query;
    const results = database.searchProducts(q);

    res.json({
      success: true,
      query: q,
      count: results.length,
      products: results
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not search products'
    });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  productValidation,
  searchValidation
};