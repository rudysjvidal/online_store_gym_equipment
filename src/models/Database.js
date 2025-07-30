const fs = require('fs');
const path = require('path');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, 'database.json');
    this.data = this.loadData();
  }

  loadData() {
    try {
      const rawData = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(rawData);
    } catch (error) {
      console.error('Error loading database:', error);
      return { products: [], users: [], orders: [] };
    }
  }

  saveData() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving database:', error);
      return false;
    }
  }

  // Products methods
  getAllProducts() {
    return this.data.products;
  }

  getProductById(id) {
    return this.data.products.find(product => product.id === id);
  }

  addProduct(product) {
    this.data.products.push(product);
    return this.saveData();
  }

  updateProduct(id, updates) {
    const index = this.data.products.findIndex(product => product.id === id);
    if (index !== -1) {
      this.data.products[index] = { ...this.data.products[index], ...updates };
      return this.saveData();
    }
    return false;
  }

  deleteProduct(id) {
    const index = this.data.products.findIndex(product => product.id === id);
    if (index !== -1) {
      this.data.products.splice(index, 1);
      return this.saveData();
    }
    return false;
  }

  searchProducts(query) {
    const searchTerm = query.toLowerCase();
    return this.data.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.categories.some(category => 
        category.toLowerCase().includes(searchTerm)
      )
    );
  }

  // Users methods
  getAllUsers() {
    return this.data.users;
  }

  getUserByUsername(username) {
    return this.data.users.find(user => user.username === username);
  }

  getUserByEmail(email) {
    return this.data.users.find(user => user.email === email);
  }

  addUser(user) {
    this.data.users.push(user);
    return this.saveData();
  }

  updateUser(username, updates) {
    const index = this.data.users.findIndex(user => user.username === username);
    if (index !== -1) {
      this.data.users[index] = { ...this.data.users[index], ...updates };
      return this.saveData();
    }
    return false;
  }

  // Orders methods
  getAllOrders() {
    return this.data.orders;
  }

  getOrderById(id) {
    return this.data.orders.find(order => order.id === id);
  }

  getOrdersByUsername(username) {
    return this.data.orders.filter(order => order.username === username);
  }

  addOrder(order) {
    this.data.orders.push(order);
    return this.saveData();
  }

  generateId(collection) {
    const items = this.data[collection];
    if (items.length === 0) return '1';
    const maxId = Math.max(...items.map(item => parseInt(item.id) || 0));
    return (maxId + 1).toString();
  }
}

module.exports = new Database();