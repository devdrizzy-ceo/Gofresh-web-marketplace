/**
 * GoFresh - Central Reactive State Store
 * Handles LocalStorage persistence, cart mutations, product listings, orders & auth simulation
 */

class GoFreshStore {
  constructor() {
    this.subscribers = new Map();
    this.init();
  }

  init() {
    // 1. Session state
    const savedUser = localStorage.getItem('gofresh_session');
    this.currentUser = savedUser ? JSON.parse(savedUser) : {
      role: 'guest', // 'guest' | 'buyer' | 'farmer'
      data: null
    };

    // 2. Custom/persisted farmers
    const savedFarmers = localStorage.getItem('gofresh_farmers');
    this.farmers = savedFarmers ? JSON.parse(savedFarmers) : [...INITIAL_FARMERS];

    // 3. Custom/persisted products
    const savedProducts = localStorage.getItem('gofresh_products');
    this.products = savedProducts ? JSON.parse(savedProducts) : [...INITIAL_PRODUCTS];

    // 4. Cart state
    const savedCart = localStorage.getItem('gofresh_cart');
    this.cart = savedCart ? JSON.parse(savedCart) : [];

    // 5. Orders state
    const savedOrders = localStorage.getItem('gofresh_orders');
    this.orders = savedOrders ? JSON.parse(savedOrders) : [...INITIAL_ORDERS];

    // 6. Active UI filters
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.sortBy = 'featured';
  }

  // Reactive subscription system
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event).push(callback);
    return () => {
      const cbs = this.subscribers.get(event) || [];
      this.subscribers.set(event, cbs.filter(cb => cb !== callback));
    };
  }

  emit(event, payload) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach(cb => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`Error in subscriber for ${event}:`, e);
        }
      });
    }
  }

  // --- Authentication / Role Management ---
  setRole(role, userData = null) {
    this.currentUser = { role, data: userData };
    localStorage.setItem('gofresh_session', JSON.stringify(this.currentUser));
    this.emit('user:change', this.currentUser);
  }

  logout() {
    this.setRole('guest', null);
  }

  registerBuyer(fullName, email) {
    const userData = {
      id: 'buyer-' + Date.now(),
      name: fullName,
      email: email,
      role: 'buyer',
      createdAt: new Date().toISOString()
    };
    this.setRole('buyer', userData);
    return userData;
  }

  registerFarmer(farmerProfile) {
    const newFarmer = {
      id: 'farmer-' + Date.now(),
      name: farmerProfile.name,
      farmName: farmerProfile.farmName || `${farmerProfile.name}'s Farm`,
      location: farmerProfile.location || 'Kaduna, Nigeria',
      state: farmerProfile.state || 'Kaduna',
      avatar: farmerProfile.avatar || 'assets/images/farmer_grace.jpg',
      heroImage: farmerProfile.heroImage || 'assets/images/vegetables.jpg',
      bio: farmerProfile.bio || 'Passionate local grower committed to fresh, sustainable produce delivered directly to kitchens.',
      farmingType: farmerProfile.farmingType || 'Sustainable Agriculture',
      joinedDate: 'Just Now',
      verified: true,
      rating: 5.0,
      reviewsCount: 1,
      totalHarvests: 1,
      acres: farmerProfile.acres || 5,
      phone: farmerProfile.phone || '+234 800 000 0000',
      email: farmerProfile.email,
      isCurrentUser: true
    };

    this.farmers.unshift(newFarmer);
    localStorage.setItem('gofresh_farmers', JSON.stringify(this.farmers));

    this.setRole('farmer', newFarmer);
    this.emit('farmers:change', this.farmers);
    return newFarmer;
  }

  // --- Product Management ---
  addProduct(productData) {
    const newProduct = {
      id: 'prod-' + Date.now(),
      name: productData.name,
      category: productData.category,
      price: Number(productData.price),
      unit: productData.unit,
      image: productData.image || 'assets/images/vegetables.jpg',
      farmerId: productData.farmerId || (this.currentUser.data ? this.currentUser.data.id : 'farmer-1'),
      location: productData.location || (this.currentUser.data ? this.currentUser.data.location : 'Kaduna, Nigeria'),
      availableQty: Number(productData.availableQty || 20),
      availability: 'In Stock · Harvested Fresh',
      badge: 'Farm Direct',
      isFeatured: true,
      description: productData.description || 'Farm-fresh local harvest direct from grower.'
    };

    this.products.unshift(newProduct);
    localStorage.setItem('gofresh_products', JSON.stringify(this.products));
    this.emit('products:change', this.products);
    return newProduct;
  }

  deleteProduct(productId) {
    this.products = this.products.filter(p => p.id !== productId);
    localStorage.setItem('gofresh_products', JSON.stringify(this.products));
    // Also remove from cart if present
    this.removeFromCart(productId);
    this.emit('products:change', this.products);
  }

  toggleProductAvailability(productId) {
    const p = this.products.find(x => x.id === productId);
    if (p) {
      if (p.availability.includes('In Stock')) {
        p.availability = 'Temporarily Out of Stock';
      } else {
        p.availability = 'In Stock · Harvested Daily';
      }
      localStorage.setItem('gofresh_products', JSON.stringify(this.products));
      this.emit('products:change', this.products);
    }
  }

  // --- Cart Operations ---
  addToCart(productId, quantity = 1) {
    const existing = this.cart.find(item => item.productId === productId);
    if (existing) {
      existing.qty += quantity;
    } else {
      this.cart.push({ productId, qty: quantity, addedAt: Date.now() });
    }
    this.saveCart();
    this.emit('cart:change', this.getCartDetails());
    return true;
  }

  updateCartQty(productId, delta) {
    const item = this.cart.find(i => i.productId === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this.saveCart();
    this.emit('cart:change', this.getCartDetails());
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.productId !== productId);
    this.saveCart();
    this.emit('cart:change', this.getCartDetails());
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.emit('cart:change', this.getCartDetails());
  }

  saveCart() {
    localStorage.setItem('gofresh_cart', JSON.stringify(this.cart));
  }

  getCartCount() {
    return this.cart.reduce((total, item) => total + item.qty, 0);
  }

  getCartDetails() {
    let subtotal = 0;
    const items = [];

    this.cart.forEach(cartItem => {
      const product = this.products.find(p => p.id === cartItem.productId);
      if (product) {
        const itemSubtotal = product.price * cartItem.qty;
        subtotal += itemSubtotal;
        const farmer = this.farmers.find(f => f.id === product.farmerId);
        items.push({
          ...cartItem,
          product,
          farmer,
          itemSubtotal
        });
      }
    });

    // Realistic delivery fee calculation
    // Over ₦35,000 is Free Delivery, otherwise ₦1,800
    const deliveryFee = items.length === 0 ? 0 : (subtotal >= 35000 ? 0 : 1800);
    const total = subtotal + deliveryFee;

    return {
      items,
      count: this.getCartCount(),
      subtotal,
      deliveryFee,
      total,
      isFreeDelivery: subtotal >= 35000 && items.length > 0
    };
  }

  // --- Orders ---
  createOrder(checkoutData) {
    const cartDetails = this.getCartDetails();
    if (cartDetails.items.length === 0) return null;

    const newOrder = {
      id: 'GF-' + Math.floor(10000 + Math.random() * 90000),
      customerName: checkoutData.fullName,
      customerEmail: checkoutData.email,
      customerPhone: checkoutData.phone,
      deliveryAddress: checkoutData.address,
      deliveryCity: checkoutData.city || 'Lagos',
      paymentMethod: checkoutData.paymentMethod || 'Bank Transfer',
      deliveryDate: checkoutData.deliveryDate || 'Tomorrow Morning (8am - 12pm)',
      items: cartDetails.items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        qty: item.qty,
        unit: item.product.unit,
        price: item.product.price,
        farmerName: item.farmer ? item.farmer.name : 'Local Grower'
      })),
      subtotal: cartDetails.subtotal,
      deliveryFee: cartDetails.deliveryFee,
      total: cartDetails.total,
      status: 'Confirmed & Farm Dispatched',
      createdAt: new Date().toISOString()
    };

    this.orders.unshift(newOrder);
    localStorage.setItem('gofresh_orders', JSON.stringify(this.orders));
    this.clearCart();
    this.emit('orders:change', this.orders);
    return newOrder;
  }

  // --- Query Helpers ---
  productMatchesQuery(p, query) {
    if (!query || query.trim() === '') return true;
    const terms = query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
    const farmer = this.farmers.find(f => f.id === p.farmerId);
    const farmerName = farmer ? farmer.name.toLowerCase() : '';
    const farmName = farmer && farmer.farmName ? farmer.farmName.toLowerCase() : '';
    const corpus = [
      p.name,
      p.description,
      p.location,
      p.category,
      p.unit,
      p.badge || '',
      farmerName,
      farmName
    ].join(' ').toLowerCase();

    return terms.every(t => corpus.includes(t));
  }

  getFilteredProducts() {
    let result = [...this.products];
    const hasSearch = this.searchQuery && this.searchQuery.trim() !== '';

    // Filter by category with smart search fallback:
    // If a customer searches for a product that isn't in the currently selected category tab,
    // automatically search across all categories so the item is found instead of returning empty.
    if (this.activeCategory && this.activeCategory !== 'all') {
      const inCategory = result.filter(p => p.category.toLowerCase() === this.activeCategory.toLowerCase());
      if (hasSearch) {
        const matchesInCat = inCategory.some(p => this.productMatchesQuery(p, this.searchQuery));
        if (matchesInCat) {
          result = inCategory;
        } else {
          // If no matches in active category, allow search across all goods
        }
      } else {
        result = inCategory;
      }
    }

    // Filter by search query
    if (hasSearch) {
      result = result.filter(p => this.productMatchesQuery(p, this.searchQuery));
    }

    // Sort
    if (this.sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Featured / default: sort featured first, then newest
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }

  getFarmerById(farmerId) {
    return this.farmers.find(f => f.id === farmerId) || this.farmers[0];
  }

  getProductsByFarmer(farmerId) {
    return this.products.filter(p => p.farmerId === farmerId);
  }

  getProductById(productId) {
    return this.products.find(p => p.id === productId);
  }
}

// Global Currency Formatter
function formatNaira(amount) {
  if (amount === undefined || amount === null) return '₦0';
  return '₦' + Number(amount).toLocaleString('en-NG');
}

// Singleton store instance
window.store = new GoFreshStore();
