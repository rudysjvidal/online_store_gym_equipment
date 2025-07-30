const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
  console.log('🌱 Seeding database with initial data...');

  try {
    // Hash passwords for demo users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const initialData = {
      "products": [
        {
          "id": "1",
          "name": "Classic T-Shirt",
          "price": 19.99,
          "categories": ["clothing", "casual", "cotton"],
          "on_hand": 50,
          "description": "Comfortable cotton t-shirt available in multiple colors"
        },
        {
          "id": "2",
          "name": "Wireless Headphones",
          "price": 99.99,
          "categories": ["electronics", "audio", "wireless"],
          "on_hand": 25,
          "description": "High-quality wireless headphones with noise cancellation"
        },
        {
          "id": "3",
          "name": "Running Shoes",
          "price": 89.99,
          "categories": ["footwear", "sports", "running"],
          "on_hand": 30,
          "description": "Lightweight running shoes with excellent cushioning"
        },
        {
          "id": "4",
          "name": "Coffee Mug",
          "price": 12.99,
          "categories": ["kitchenware", "ceramic", "drink"],
          "on_hand": 100,
          "description": "Ceramic coffee mug perfect for your morning brew"
        },
        {
          "id": "5",
          "name": "Bluetooth Speaker",
          "price": 59.99,
          "categories": ["electronics", "audio", "portable"],
          "on_hand": 15,
          "description": "Portable Bluetooth speaker with excellent sound quality"
        }
      ],
      "users": [
        {
          "username": "admin",
          "street_address": "123 Admin Street, Admin City, AC 12345",
          "email": "admin@example.com",
          "password": adminPassword,
          "first": "Admin",
          "last": "User",
          "role": "admin"
        },
        {
          "username": "john_doe",
          "street_address": "456 User Avenue, User City, UC 67890",
          "email": "john@example.com",
          "password": userPassword,
          "first": "John",
          "last": "Doe",
          "role": "user"
        },
        {
          "username": "jane_smith",
          "street_address": "789 Customer Lane, Customer City, CC 11111",
          "email": "jane@example.com",
          "password": userPassword,
          "first": "Jane",
          "last": "Smith",
          "role": "user"
        }
      ],
      "orders": [
        {
          "id": "1",
          "username": "john_doe",
          "order_date": "2025-01-08T10:30:00Z",
          "ship_address": "456 User Avenue, User City, UC 67890",
          "products": [
            {
              "product_id": "1",
              "quantity": 2,
              "price": 19.99
            },
            {
              "product_id": "4",
              "quantity": 1,
              "price": 12.99
            }
          ]
        }
      ]
    };

    const dbPath = path.join(__dirname, '../models/database.json');
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('   Admin: username="admin", password="admin123"');
    console.log('   User:  username="john_doe", password="user123"');
    console.log('   User:  username="jane_smith", password="user123"');
    console.log('\n🚀 You can now start the server with: npm start');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;