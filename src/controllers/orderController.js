const { body, validationResult } = require('express-validator');
const database = require('../models/Database');

const checkoutValidation = [
  body('products').isArray({ min: 1 }).withMessage('Products array is required and must not be empty'),
  body('products.*.product_id').notEmpty().withMessage('Product ID is required for each product'),
  body('products.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('ship_address').notEmpty().trim().withMessage('Shipping address is required')
];

const getAllOrders = (req, res) => {
  try {
    const orders = database.getAllOrders();
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not retrieve orders'
    });
  }
};

const getOrderById = (req, res) => {
  try {
    const { id } = req.params;
    
    const order = database.getOrderById(id);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'The requested order does not exist'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not retrieve order'
    });
  }
};

const checkout = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { products, ship_address } = req.body;
    const username = req.user.username;

    // Validate products and check availability
    const orderProducts = [];
    let totalAmount = 0;

    for (const item of products) {
      const product = database.getProductById(item.product_id);
      
      if (!product) {
        return res.status(400).json({
          error: 'Invalid product',
          message: `Product with ID ${item.product_id} not found`
        });
      }

      if (product.on_hand < item.quantity) {
        return res.status(400).json({
          error: 'Insufficient inventory',
          message: `Only ${product.on_hand} units of ${product.name} available`
        });
      }

      orderProducts.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.price
      });

      totalAmount += product.price * item.quantity;
    }

    // Mock payment processing
    const paymentSuccess = await mockPaymentProcess(totalAmount);
    if (!paymentSuccess) {
      return res.status(402).json({
        error: 'Payment failed',
        message: 'Could not process payment'
      });
    }

    // Create order
    const newOrder = {
      id: database.generateId('orders'),
      username,
      order_date: new Date().toISOString(),
      ship_address,
      products: orderProducts
    };

    const orderCreated = database.addOrder(newOrder);
    if (!orderCreated) {
      return res.status(500).json({
        error: 'Order creation failed',
        message: 'Could not create order'
      });
    }

    // Update inventory
    for (const item of products) {
      const product = database.getProductById(item.product_id);
      const updatedQuantity = product.on_hand - item.quantity;
      database.updateProduct(item.product_id, { on_hand: updatedQuantity });
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order: newOrder,
      total_amount: totalAmount.toFixed(2)
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not process checkout'
    });
  }
};

// Mock payment processing function
const mockPaymentProcess = async (amount) => {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Mock payment success (90% success rate)
  return Math.random() > 0.1;
};

module.exports = {
  getAllOrders,
  getOrderById,
  checkout,
  checkoutValidation
};