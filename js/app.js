/**
 * GoFresh - Main Application Logic & Controllers
 * Handles Category discovery, editorial marketplace rendering, modals, cart drawer,
 * checkout flow, 5-step farmer onboarding wizard, farmer dashboard, and toasts.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Application
  initHeader();
  initCategoryDiscovery();
  initMarketplace();
  initFarmerDashboard();
  initCartDrawer();
  initModals();
  initOnboardingWizard();
  initCheckout();
  initHowItWorksTabs();
  initUserSessionUI();

  // Subscribe to store events
  store.subscribe('cart:change', updateCartUI);
  store.subscribe('products:change', () => {
    renderProductsGrid();
    renderFarmerDashboard();
  });
  store.subscribe('user:change', initUserSessionUI);

  // Initial cart UI update
  updateCartUI(store.getCartDetails());
});

/* ==========================================================================
   1. Header & Navigation Controller
   ========================================================================== */
function initHeader() {
  const header = document.getElementById('site-header');
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileClose = document.getElementById('mobile-drawer-close');
  const drawerLinks = document.querySelectorAll('[data-close-drawer]');

  // Sticky header scroll shadow
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile menu open / close
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    const closeMobileMenu = () => {
      mobileDrawer.classList.remove('open');
      document.body.style.overflow = '';
    };

    if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
    mobileDrawer.addEventListener('click', (e) => {
      if (e.target === mobileDrawer) closeMobileMenu();
    });

    drawerLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // Footer category links
  document.querySelectorAll('.footer-link[data-filter]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = link.getAttribute('data-filter');
      selectCategory(cat);
      const target = document.getElementById('marketplace');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ==========================================================================
   2. User Session & Role UI
   ========================================================================== */
function initUserSessionUI() {
  const roleBtn = document.getElementById('user-role-btn');
  const roleLabel = document.getElementById('user-role-label');
  const avatarMini = document.getElementById('user-avatar-mini');
  const dashboardSection = document.getElementById('farmer-dashboard-section');

  const { role, data } = store.currentUser;

  if (role === 'farmer' && data) {
    roleLabel.textContent = `${data.name.split(' ')[0]} (Farmer)`;
    avatarMini.textContent = '🚜';
    if (dashboardSection) {
      dashboardSection.classList.add('active');
    }
  } else if (role === 'buyer' && data) {
    roleLabel.textContent = `${data.name.split(' ')[0]} (Buyer)`;
    avatarMini.textContent = '🛒';
    if (dashboardSection) {
      dashboardSection.classList.remove('active');
    }
  } else {
    roleLabel.textContent = 'Sign In / Role';
    avatarMini.textContent = '👤';
    if (dashboardSection) {
      dashboardSection.classList.remove('active');
    }
  }

  // Clicking role button toggles auth modal
  if (roleBtn) {
    roleBtn.onclick = () => {
      if (store.currentUser.role !== 'guest') {
        // Quick switch menu / signout
        showRoleSwitchDialog();
      } else {
        openModal('auth-modal');
      }
    };
  }
}

function showRoleSwitchDialog() {
  const current = store.currentUser;
  const isFarmer = current.role === 'farmer';
  
  const action = confirm(
    `You are currently signed in as ${current.data.name} (${current.role.toUpperCase()}).\n\n` +
    (isFarmer ? 'Switch to Buyer Mode, or Log Out?' : 'Switch to Farmer Mode, or Log Out?') +
    '\nClick [OK] to toggle role or [Cancel] to keep current mode.'
  );

  if (action) {
    if (isFarmer) {
      store.registerBuyer(current.data.name, current.data.email);
      showToast('Switched to Buyer Experience 🛒');
    } else {
      // Switch back to farmer
      const farmer = store.farmers[0];
      store.setRole('farmer', farmer);
      showToast('Switched to Farmer Portal 🚜');
      const dash = document.getElementById('farmer-dashboard-section');
      if (dash) dash.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

/* ==========================================================================
   3. Category Discovery Panel Controller ("Check Our Goods")
   ========================================================================== */
function initCategoryDiscovery() {
  const categoryGrid = document.getElementById('category-grid');
  if (!categoryGrid) return;

  categoryGrid.innerHTML = CATEGORIES.map(cat => `
    <div class="category-discovery-card ${store.activeCategory === cat.id ? 'active' : ''}" data-cat-id="${cat.id}">
      <div class="category-card-img-wrap">
        <img src="${cat.image}" alt="${cat.name} produce" loading="lazy">
        <span class="category-card-count">${cat.productCount} Items</span>
      </div>
      <div class="category-card-content">
        <div>
          <h3 class="category-card-name">${cat.name}</h3>
          <p class="category-card-desc">${cat.description}</p>
        </div>
        <span class="category-card-cta">
          <span>Explore ${cat.name}</span>
          <span>→</span>
        </span>
      </div>
    </div>
  `).join('');

  // Click on category cards
  categoryGrid.querySelectorAll('.category-discovery-card').forEach(card => {
    card.addEventListener('click', () => {
      const catId = card.getAttribute('data-cat-id');
      selectCategory(catId);
      const target = document.getElementById('marketplace');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Hero Check Our Goods CTA scroll
  const heroCheckBtn = document.getElementById('hero-check-goods-btn');
  if (heroCheckBtn) {
    heroCheckBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const goodsSec = document.getElementById('goods');
      if (goodsSec) {
        goodsSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Hero Grace Okafor card click opens farmer profile
  const heroFarmerCard = document.getElementById('hero-farmer-card-trigger');
  if (heroFarmerCard) {
    heroFarmerCard.addEventListener('click', () => {
      openFarmerProfileModal('farmer-1');
    });
  }
}

function selectCategory(catId, shouldRender = true) {
  store.activeCategory = catId;
  
  // Highlight category card
  document.querySelectorAll('.category-discovery-card').forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-cat-id') === catId);
  });

  // Highlight pill
  document.querySelectorAll('.filter-pill').forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-filter-id') === catId);
  });

  // Update marketplace heading
  const heading = document.getElementById('marketplace-heading');
  if (heading) {
    if (catId === 'all') {
      heading.textContent = 'Available Local Produce';
    } else {
      const found = CATEGORIES.find(c => c.id === catId);
      heading.textContent = found ? `${found.name} Harvests` : 'Produce';
    }
  }

  if (shouldRender) {
    renderProductsGrid();
  }
}

// Global reset helper for filters & search
window.resetMarketplaceFilters = function() {
  const searchInput = document.getElementById('marketplace-search-input');
  const searchClearBtn = document.getElementById('marketplace-search-clear');
  if (searchInput) {
    searchInput.value = '';
  }
  if (searchClearBtn) {
    searchClearBtn.classList.remove('visible');
  }
  store.searchQuery = '';
  selectCategory('all');
};

/* ==========================================================================
   4. Product Marketplace Controller
   ========================================================================== */
function initMarketplace() {
  const pillsBar = document.getElementById('category-pills-bar');
  const searchForm = document.getElementById('marketplace-search-form');
  const searchInput = document.getElementById('marketplace-search-input');
  const searchBtn = document.getElementById('marketplace-search-btn');
  const searchClearBtn = document.getElementById('marketplace-search-clear');
  const sortSelect = document.getElementById('marketplace-sort-select');
  const headerSearchTrigger = document.getElementById('header-search-trigger');

  // Render category filter pills
  const allCategories = [{ id: 'all', name: 'All Goods' }, ...CATEGORIES];
  if (pillsBar) {
    pillsBar.innerHTML = allCategories.map(cat => `
      <button class="filter-pill ${store.activeCategory === cat.id ? 'active' : ''}" data-filter-id="${cat.id}">
        ${cat.name}
      </button>
    `).join('');

    pillsBar.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const catId = pill.getAttribute('data-filter-id');
        selectCategory(catId);
      });
    });
  }

  // Search execution helper
  function executeSearch(shouldScroll = false) {
    if (!searchInput) return;
    const query = searchInput.value.trim();
    store.searchQuery = query;

    // Toggle clear button
    if (searchClearBtn) {
      searchClearBtn.classList.toggle('visible', query.length > 0);
    }

    // Smart category check: if a query was entered and current category has no matches,
    // automatically switch to 'all' so customer sees matching products!
    if (query.length > 0 && store.activeCategory !== 'all') {
      const inCategoryMatches = store.products.filter(p => 
        p.category.toLowerCase() === store.activeCategory.toLowerCase() &&
        store.productMatchesQuery(p, query)
      );
      if (inCategoryMatches.length === 0) {
        const allMatches = store.products.filter(p => store.productMatchesQuery(p, query));
        if (allMatches.length > 0) {
          selectCategory('all', false);
        }
      }
    }

    renderProductsGrid();

    if (shouldScroll) {
      const marketplaceSec = document.getElementById('marketplace');
      if (marketplaceSec) {
        marketplaceSec.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  // Live input filtering
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      executeSearch(false);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSearch(true);
      }
    });
  }

  // Search Form Submit Handler (Enter key or submit button)
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      executeSearch(true);
    });
  }

  // Dedicated Search Button Click Handler
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      executeSearch(true);
    });
  }

  // Clear Search Button
  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      store.searchQuery = '';
      searchClearBtn.classList.remove('visible');
      renderProductsGrid();
    });
  }

  // Header Search Trigger Button
  if (headerSearchTrigger) {
    headerSearchTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      const marketplaceSec = document.getElementById('marketplace');
      if (marketplaceSec) {
        marketplaceSec.scrollIntoView({ behavior: 'smooth' });
      }
      if (searchInput) {
        setTimeout(() => {
          searchInput.focus();
          const wrap = searchInput.closest('.search-box-wrap');
          if (wrap) {
            wrap.classList.add('pulse-highlight');
            setTimeout(() => wrap.classList.remove('pulse-highlight'), 2400);
          }
        }, 400);
      }
    });
  }

  // Sort dropdown
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      store.sortBy = e.target.value;
      renderProductsGrid();
    });
  }

  // Initial render
  renderProductsGrid();
}

function renderProductsGrid() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const products = store.getFilteredProducts();

  if (products.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🌱</div>
        <h3 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 0.5rem;">No matching farm produce found</h3>
        <p style="color: var(--text-secondary); max-width: 420px; margin: 0 auto 1.5rem;">Try adjusting your search terms or select "All Goods" to see all current regional harvests.</p>
        <button class="btn btn-outline" onclick="resetMarketplaceFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map((prod, index) => {
    const farmer = store.getFarmerById(prod.farmerId);
    // Editorial layout: make the first product or featured products wide cards for visual rhythm
    const isWide = (index === 0 && store.activeCategory === 'all') || prod.isFeatured && index === 3;

    return `
      <article class="product-card ${isWide ? 'featured-wide' : ''}" data-product-id="${prod.id}">
        <div class="product-image-container" onclick="openProductQuickView('${prod.id}')">
          <img src="${prod.image}" alt="${prod.name}" loading="lazy">
          ${prod.badge ? `<span class="product-badge-float">${prod.badge}</span>` : ''}
          <span class="product-availability-tag">${prod.availability}</span>
        </div>

        <div class="product-card-body">
          <div>
            <span class="product-category-tag">${prod.category}</span>
            <h3 class="product-card-title" onclick="openProductQuickView('${prod.id}')">${prod.name}</h3>
            <p class="product-card-desc">${prod.description}</p>
            
            <div class="product-pricing-wrap">
              <span class="product-price">${formatNaira(prod.price)}</span>
              <span class="product-unit">/ ${prod.unit}</span>
            </div>
          </div>

          <!-- Farmer mini-card (Clickable to open profile) -->
          <div class="product-farmer-strip" onclick="openFarmerProfileModal('${farmer.id}')" title="Click to view ${farmer.name}'s profile">
            <div class="product-farmer-mini">
              <img src="${farmer.avatar}" alt="${farmer.name}" class="product-farmer-avatar">
              <div>
                <div class="product-farmer-name">${farmer.name}</div>
                <div class="product-farmer-location">📍 ${prod.location}</div>
              </div>
            </div>
            <span class="product-farmer-link-icon">View →</span>
          </div>

          <!-- Add to Cart CTA -->
          <button class="btn btn-primary btn-block" onclick="handleAddToCart('${prod.id}', 1)">
            <span>Add To Cart</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </article>
    `;
  }).join('');
}

function handleAddToCart(productId, qty = 1) {
  const prod = store.getProductById(productId);
  if (!prod) return;

  store.addToCart(productId, qty);
  showToast(`Added ${prod.name} to cart! 🛒`);

  // Animate cart badge
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.classList.remove('bump');
    void badge.offsetWidth; // trigger reflow
    badge.classList.add('bump');
  }
}

/* ==========================================================================
   5. Farmer Profile Modal Controller
   ========================================================================== */
function openFarmerProfileModal(farmerId) {
  const farmer = store.getFarmerById(farmerId);
  if (!farmer) return;

  const modalBody = document.getElementById('farmer-profile-modal-body');
  if (!modalBody) return;

  const farmerProducts = store.getProductsByFarmer(farmer.id);

  modalBody.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 2rem;">
      
      <!-- Farmer Profile Header -->
      <div style="display: grid; grid-template-columns: 140px 1fr; gap: 1.5rem; align-items: center;">
        <img src="${farmer.avatar}" alt="${farmer.name}" style="width: 140px; height: 140px; border-radius: var(--radius-lg); object-fit: cover; border: 3px solid var(--secondary);">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <h2 style="font-family: var(--font-display); font-size: 1.85rem; font-weight: 800; color: var(--dark-green);">${farmer.name}</h2>
            <span class="sticker-tag" style="font-size: 0.7rem;">✓ Verified Local Grower</span>
          </div>
          <p style="font-weight: 700; color: var(--primary); margin-top: 0.2rem;">${farmer.farmName}</p>
          <p style="color: var(--text-secondary); font-size: 0.875rem;">📍 ${farmer.location} · Member since ${farmer.joinedDate}</p>
          
          <div style="display: flex; gap: 1.5rem; margin-top: 0.75rem; font-size: 0.875rem;">
            <span>⭐ <strong>${farmer.rating}</strong> (${farmer.reviewsCount} reviews)</span>
            <span>🌱 <strong>${farmer.acres} Acres</strong> Cultivated</span>
            <span>📦 <strong>${farmer.totalHarvests}+</strong> Harvests Sold</span>
          </div>
        </div>
      </div>

      <!-- Farmer Biography -->
      <div style="background: var(--surface-card); border: 1px solid var(--border-medium); border-radius: var(--radius-md); padding: 1.5rem;">
        <h4 style="font-family: var(--font-display); font-size: 1rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--primary); margin-bottom: 0.5rem;">Farmer's Story</h4>
        <p style="color: var(--text-secondary); line-height: 1.65; font-size: 0.95rem;">${farmer.bio}</p>
      </div>

      <!-- Available Products by this Farmer -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <h3 style="font-family: var(--font-display); font-size: 1.35rem; font-weight: 800; color: var(--dark-green);">
            Produce Available from ${farmer.name} (${farmerProducts.length})
          </h3>
          <span style="font-size: 0.8125rem; color: var(--text-tertiary);">Direct harvest</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.25rem;">
          ${farmerProducts.map(p => `
            <div style="background: var(--surface-card); border: 1px solid var(--border-medium); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column;">
              <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 160px; object-fit: cover;">
              <div style="padding: 1rem; display: flex; flex-direction: column; flex: 1; justify-content: space-between; gap: 0.75rem;">
                <div>
                  <h4 style="font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--dark-green);">${p.name}</h4>
                  <div style="font-weight: 800; color: var(--primary); margin-top: 0.25rem;">${formatNaira(p.price)} <span style="font-size: 0.75rem; font-weight: 500; color: var(--text-tertiary);">/ ${p.unit}</span></div>
                </div>
                <button class="btn btn-primary btn-sm btn-block" onclick="handleAddToCart('${p.id}', 1); closeModal('farmer-profile-modal');">
                  Add to Cart 🛒
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;

  openModal('farmer-profile-modal');
}

/* ==========================================================================
   6. Product Quick-View Modal Controller
   ========================================================================== */
function openProductQuickView(productId) {
  const prod = store.getProductById(productId);
  if (!prod) return;

  const farmer = store.getFarmerById(prod.farmerId);
  const modalBody = document.getElementById('product-detail-modal-body');
  const badgeEl = document.getElementById('modal-prod-badge');
  if (!modalBody) return;

  if (badgeEl) badgeEl.textContent = prod.badge || 'Fresh Farm Harvest';

  modalBody.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;">
      
      <!-- Product Image -->
      <div style="border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-medium); background: var(--surface-muted);">
        <img src="${prod.image}" alt="${prod.name}" style="width: 100%; height: 360px; object-fit: cover;">
      </div>

      <!-- Details -->
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div>
          <span style="font-family: var(--font-display); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--primary); letter-spacing: 0.08em;">${prod.category}</span>
          <h2 style="font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; color: var(--dark-green); margin-top: 0.25rem;">${prod.name}</h2>
          <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-top: 0.5rem;">
            <span style="font-family: var(--font-display); font-size: 1.85rem; font-weight: 800; color: var(--dark-green);">${formatNaira(prod.price)}</span>
            <span style="color: var(--text-tertiary); font-size: 0.875rem;">/ ${prod.unit}</span>
          </div>
        </div>

        <p style="color: var(--text-secondary); line-height: 1.6; font-size: 0.95rem;">${prod.description}</p>

        <!-- Freshness specs -->
        <div style="background: var(--surface-card); border: 1px solid var(--border-medium); border-radius: var(--radius-md); padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.8125rem;">
          <div>🌿 <strong>Harvest Status:</strong> ${prod.availability}</div>
          <div>📍 <strong>Farmed In:</strong> ${prod.location}</div>
          <div>📦 <strong>Available Units:</strong> ${prod.availableQty} units left in current batch</div>
          <div>🚚 <strong>Delivery:</strong> Chilled 24-hr transit directly to your door</div>
        </div>

        <!-- Farmer strip -->
        <div class="product-farmer-strip" onclick="closeModal('product-detail-modal'); openFarmerProfileModal('${farmer.id}');" style="margin-top: 0;">
          <div class="product-farmer-mini">
            <img src="${farmer.avatar}" alt="${farmer.name}" class="product-farmer-avatar">
            <div>
              <div class="product-farmer-name">${farmer.name}</div>
              <div class="product-farmer-location">📍 ${farmer.location}</div>
            </div>
          </div>
          <span class="product-farmer-link-icon">View Profile →</span>
        </div>

        <!-- Quantity Picker & Add to Cart -->
        <div style="display: flex; gap: 1rem; align-items: center; margin-top: 0.5rem;">
          <div class="qty-stepper" style="height: 44px;">
            <button class="qty-btn" id="modal-qty-minus" style="width: 36px; height: 100%;">-</button>
            <span class="qty-num" id="modal-qty-val" style="padding: 0 1rem; font-size: 1rem;">1</span>
            <button class="qty-btn" id="modal-qty-plus" style="width: 36px; height: 100%;">+</button>
          </div>
          <button class="btn btn-primary btn-block btn-lg" id="modal-add-btn">
            Add to Basket 🛒
          </button>
        </div>

      </div>

    </div>
  `;

  // Stepper logic
  let quantity = 1;
  const valEl = document.getElementById('modal-qty-val');
  const minusBtn = document.getElementById('modal-qty-minus');
  const plusBtn = document.getElementById('modal-qty-plus');
  const addBtn = document.getElementById('modal-add-btn');

  if (minusBtn && plusBtn && valEl) {
    minusBtn.onclick = () => {
      if (quantity > 1) {
        quantity--;
        valEl.textContent = quantity;
      }
    };
    plusBtn.onclick = () => {
      quantity++;
      valEl.textContent = quantity;
    };
  }

  if (addBtn) {
    addBtn.onclick = () => {
      handleAddToCart(prod.id, quantity);
      closeModal('product-detail-modal');
    };
  }

  openModal('product-detail-modal');
}

/* ==========================================================================
   7. Cart Drawer & Calculations
   ========================================================================== */
function initCartDrawer() {
  const trigger = document.getElementById('cart-drawer-trigger');
  const overlay = document.getElementById('cart-drawer-overlay');
  const closeBtn = document.getElementById('cart-drawer-close');
  const checkoutBtn = document.getElementById('cart-checkout-btn');

  const openDrawer = () => {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (trigger) trigger.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeDrawer();
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const details = store.getCartDetails();
      if (details.items.length === 0) {
        showToast('Your cart is empty! Add some fresh produce first.');
        return;
      }
      closeDrawer();
      openModal('checkout-modal');
      const coTotalEl = document.getElementById('co-modal-total');
      if (coTotalEl) coTotalEl.textContent = formatNaira(details.total);
    });
  }
}

function updateCartUI(cartDetails) {
  // Update header badge
  const badge = document.getElementById('cart-badge');
  if (badge) badge.textContent = cartDetails.count;

  // Update drawer count tag
  const drawerCount = document.getElementById('drawer-item-count');
  if (drawerCount) drawerCount.textContent = `${cartDetails.count} items`;

  // Update summary totals
  const subtotalEl = document.getElementById('cart-subtotal-val');
  const deliveryEl = document.getElementById('cart-delivery-val');
  const totalEl = document.getElementById('cart-total-val');
  if (subtotalEl) subtotalEl.textContent = formatNaira(cartDetails.subtotal);
  if (deliveryEl) deliveryEl.textContent = cartDetails.deliveryFee === 0 ? 'FREE' : formatNaira(cartDetails.deliveryFee);
  if (totalEl) totalEl.textContent = formatNaira(cartDetails.total);

  // Delivery progress
  const targetThreshold = 35000;
  const percent = Math.min(100, Math.round((cartDetails.subtotal / targetThreshold) * 100));
  const fillEl = document.getElementById('delivery-fill');
  const textEl = document.getElementById('delivery-text-msg');
  const valEl = document.getElementById('delivery-percent-val');

  if (fillEl) fillEl.style.width = `${percent}%`;
  if (valEl) valEl.textContent = `${percent}%`;
  if (textEl) {
    if (cartDetails.subtotal >= targetThreshold && cartDetails.items.length > 0) {
      textEl.textContent = '🎉 You unlocked FREE Farm Delivery!';
    } else {
      const remaining = targetThreshold - cartDetails.subtotal;
      textEl.textContent = `Add ${formatNaira(remaining)} more for FREE Delivery`;
    }
  }

  // Render items in drawer
  const container = document.getElementById('cart-items-container');
  if (!container) return;

  if (cartDetails.items.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state">
        <div class="cart-empty-icon">🧺</div>
        <h4 class="cart-empty-title">Your Basket is Empty</h4>
        <p class="cart-empty-desc">Discover sweet yams, fresh Kaduna tomatoes, and crisp seasonal fruits directly from local growers.</p>
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('cart-drawer-close').click(); document.getElementById('goods').scrollIntoView({ behavior: 'smooth' });">
          Explore Produce →
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = cartDetails.items.map(item => `
    <div class="cart-item">
      <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-img">
      <div class="cart-item-details">
        <h4 class="cart-item-name">${item.product.name}</h4>
        <span class="cart-item-farmer">By ${item.farmer ? item.farmer.name : 'Local Grower'}</span>
        <span class="cart-item-price">${formatNaira(item.product.price)} <small style="font-weight: 400; color: var(--text-tertiary);">/ ${item.product.unit}</small></span>
      </div>
      <div class="cart-item-actions">
        <div class="qty-stepper">
          <button class="qty-btn" onclick="store.updateCartQty('${item.product.id}', -1)" aria-label="Decrease quantity">-</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="store.updateCartQty('${item.product.id}', 1)" aria-label="Increase quantity">+</button>
        </div>
        <button class="cart-item-remove" onclick="store.removeFromCart('${item.product.id}')">Remove</button>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   8. Checkout Controller
   ========================================================================== */
function initCheckout() {
  const form = document.getElementById('checkout-form');
  const continueBtn = document.getElementById('order-continue-shopping-btn');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = document.getElementById('co-name').value.trim();
      const phone = document.getElementById('co-phone').value.trim();
      const address = document.getElementById('co-address').value.trim();
      const city = document.getElementById('co-city').value.trim();
      const deliveryWindow = document.getElementById('co-delivery-window').value;
      const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'Bank Transfer';

      const order = store.createOrder({
        fullName,
        phone,
        address,
        city,
        deliveryDate: deliveryWindow,
        paymentMethod
      });

      if (!order) return;

      closeModal('checkout-modal');

      // Populate order confirmation modal
      const summaryEl = document.getElementById('order-confirmed-summary');
      if (summaryEl) {
        summaryEl.innerHTML = `
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
            <span><strong>Order ID:</strong> #${order.id}</span>
            <span style="color: var(--primary); font-weight: 700;">${order.status}</span>
          </div>
          <div style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5;">
            <div><strong>Deliver to:</strong> ${order.customerName}</div>
            <div><strong>Address:</strong> ${order.deliveryAddress}, ${order.deliveryCity}</div>
            <div><strong>Scheduled Window:</strong> ${order.deliveryDate}</div>
            <div><strong>Payment Mode:</strong> ${order.paymentMethod}</div>
          </div>
          <div style="margin-top: 1rem; border-top: 1px dashed var(--border-light); padding-top: 0.75rem; display: flex; justify-content: space-between; font-weight: 800; font-size: 1.1rem; color: var(--dark-green);">
            <span>Amount Paid / Payable:</span>
            <span>${formatNaira(order.total)}</span>
          </div>
        `;
      }

      openModal('order-confirmed-modal');
      showToast('Order confirmed! Farmers notified 🚚');
    });
  }

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      closeModal('order-confirmed-modal');
      const goods = document.getElementById('goods');
      if (goods) goods.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/* ==========================================================================
   9. Farmer Onboarding 5-Step Wizard Controller
   ========================================================================== */
let wizardCurrentStep = 1;
let uploadedFarmImages = [
  'assets/images/vegetables.jpg',
  'assets/images/tomatoes.jpg'
];

function initOnboardingWizard() {
  const nextBtn = document.getElementById('wizard-next-btn');
  const prevBtn = document.getElementById('wizard-prev-btn');
  const submitBtn = document.getElementById('wizard-submit-btn');
  const uploadBox = document.getElementById('ob-upload-box');
  const fileInput = document.getElementById('ob-file-input');
  const previewGrid = document.getElementById('ob-preview-grid');

  // Trigger from hero button & mobile menu
  const heroJoinFarmer = document.getElementById('hero-join-farmer-btn');
  const mobileJoinFarmer = document.getElementById('mobile-join-farmer-btn');

  const openOnboarding = () => {
    wizardCurrentStep = 1;
    showWizardStep(1);
    openModal('farmer-onboarding-modal');
  };

  if (heroJoinFarmer) heroJoinFarmer.addEventListener('click', openOnboarding);
  if (mobileJoinFarmer) mobileJoinFarmer.addEventListener('click', openOnboarding);

  // File upload simulation with FileReader
  if (uploadBox && fileInput) {
    uploadBox.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          uploadedFarmImages.push(event.target.result);
          renderUploadPreviews();
        };
        reader.readAsDataURL(file);
      });
      showToast(`Selected ${files.length} farm photo(s)`);
    });
  }

  renderUploadPreviews();

  // Wizard Step Navigation
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      // Step validations
      if (wizardCurrentStep === 1) {
        const name = document.getElementById('ob-farmer-name').value.trim();
        const email = document.getElementById('ob-farmer-email').value.trim();
        const phone = document.getElementById('ob-farmer-phone').value.trim();
        const loc = document.getElementById('ob-farmer-location').value.trim();
        if (!name || !email || !phone || !loc) {
          showToast('Please fill in your name, email, phone, and location');
          return;
        }
      } else if (wizardCurrentStep === 4) {
        const prodName = document.getElementById('ob-prod-name').value.trim();
        const price = document.getElementById('ob-prod-price').value;
        const unit = document.getElementById('ob-prod-unit').value.trim();
        if (!prodName || !price || !unit) {
          showToast('Please specify product name, price in Naira, and unit');
          return;
        }
        buildReviewSummary();
      }

      if (wizardCurrentStep < 5) {
        wizardCurrentStep++;
        showWizardStep(wizardCurrentStep);
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (wizardCurrentStep > 1) {
        wizardCurrentStep--;
        showWizardStep(wizardCurrentStep);
      }
    });
  }

  // Final Publish Button
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const name = document.getElementById('ob-farmer-name').value.trim();
      const email = document.getElementById('ob-farmer-email').value.trim();
      const phone = document.getElementById('ob-farmer-phone').value.trim();
      const location = document.getElementById('ob-farmer-location').value.trim();
      const farmName = document.getElementById('ob-farm-name').value.trim() || `${name}'s Farm`;
      const farmingType = document.getElementById('ob-farming-type').value;
      const bio = document.getElementById('ob-farm-bio').value.trim();

      const prodName = document.getElementById('ob-prod-name').value.trim();
      const prodCategory = document.getElementById('ob-prod-category').value;
      const prodPrice = document.getElementById('ob-prod-price').value;
      const prodUnit = document.getElementById('ob-prod-unit').value.trim();
      const prodQty = document.getElementById('ob-prod-qty').value;
      const prodDesc = document.getElementById('ob-prod-desc').value.trim();

      // 1. Register Farmer
      const farmer = store.registerFarmer({
        name,
        email,
        phone,
        location,
        farmName,
        farmingType,
        bio,
        avatar: uploadedFarmImages[0] || 'assets/images/farmer_grace.jpg',
        heroImage: uploadedFarmImages[1] || 'assets/images/vegetables.jpg'
      });

      // 2. Add Listed Product
      store.addProduct({
        name: prodName,
        category: prodCategory,
        price: Number(prodPrice),
        unit: prodUnit,
        availableQty: Number(prodQty || 20),
        description: prodDesc,
        image: uploadedFarmImages[0] || 'assets/images/vegetables.jpg',
        farmerId: farmer.id,
        location: location
      });

      closeModal('farmer-onboarding-modal');
      showToast(`Congratulations, ${name}! Your farm & produce are live! 🚀`);

      // Switch view & scroll to farmer dashboard
      const dash = document.getElementById('farmer-dashboard-section');
      if (dash) {
        dash.classList.add('active');
        dash.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

function showWizardStep(stepNum) {
  // Update step track nodes
  for (let i = 1; i <= 5; i++) {
    const node = document.getElementById(`step-node-${i}`);
    const panel = document.getElementById(`wizard-panel-${i}`);
    if (node) {
      node.classList.remove('active', 'completed');
      if (i === stepNum) node.classList.add('active');
      else if (i < stepNum) node.classList.add('completed');
    }
    if (panel) {
      panel.style.display = i === stepNum ? 'block' : 'none';
    }
  }

  // Buttons visibility
  const prevBtn = document.getElementById('wizard-prev-btn');
  const nextBtn = document.getElementById('wizard-next-btn');
  const submitBtn = document.getElementById('wizard-submit-btn');

  if (prevBtn) prevBtn.style.display = stepNum > 1 ? 'inline-flex' : 'none';
  if (nextBtn) nextBtn.style.display = stepNum < 5 ? 'inline-flex' : 'none';
  if (submitBtn) submitBtn.style.display = stepNum === 5 ? 'inline-flex' : 'none';
}

function renderUploadPreviews() {
  const grid = document.getElementById('ob-preview-grid');
  if (!grid) return;
  grid.innerHTML = uploadedFarmImages.map(src => `
    <img src="${src}" class="preview-thumb" alt="Farm photo preview">
  `).join('');
}

function buildReviewSummary() {
  const reviewCard = document.getElementById('ob-review-card');
  if (!reviewCard) return;

  const name = document.getElementById('ob-farmer-name').value.trim();
  const farmName = document.getElementById('ob-farm-name').value.trim() || `${name}'s Farm`;
  const location = document.getElementById('ob-farmer-location').value.trim();
  const prodName = document.getElementById('ob-prod-name').value.trim();
  const prodPrice = document.getElementById('ob-prod-price').value;
  const prodUnit = document.getElementById('ob-prod-unit').value.trim();
  const category = document.getElementById('ob-prod-category').value;

  reviewCard.innerHTML = `
    <div style="display: flex; gap: 1rem; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
      <img src="${uploadedFarmImages[0] || 'assets/images/farmer_grace.jpg'}" style="width: 54px; height: 54px; border-radius: 50%; object-fit: cover; border: 2px solid var(--secondary);">
      <div>
        <h4 style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 800; color: var(--dark-green);">${name}</h4>
        <div style="font-size: 0.8125rem; color: var(--text-secondary);">${farmName} · 📍 ${location}</div>
      </div>
    </div>
    
    <div style="font-size: 0.875rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.4rem;">
      <div><strong>Harvest to List:</strong> ${prodName} (${category.toUpperCase()})</div>
      <div><strong>Pricing:</strong> ${formatNaira(prodPrice)} per ${prodUnit}</div>
      <div><strong>Photos Ready:</strong> ${uploadedFarmImages.length} images prepared</div>
      <div style="color: var(--primary); font-weight: 700; margin-top: 0.5rem;">✓ Ready for instant publication on the GoFresh public marketplace</div>
    </div>
  `;
}

/* ==========================================================================
   10. Farmer Dashboard Controller
   ========================================================================== */
function initFarmerDashboard() {
  const addHarvestBtn = document.getElementById('dash-add-product-btn');
  const viewPublicBtn = document.getElementById('dash-view-public-btn');

  if (addHarvestBtn) {
    addHarvestBtn.addEventListener('click', () => {
      // Open add product prompt or onboarding step 4 directly
      wizardCurrentStep = 4;
      showWizardStep(4);
      openModal('farmer-onboarding-modal');
    });
  }

  if (viewPublicBtn) {
    viewPublicBtn.addEventListener('click', () => {
      const goods = document.getElementById('goods');
      if (goods) goods.scrollIntoView({ behavior: 'smooth' });
    });
  }

  renderFarmerDashboard();
}

function renderFarmerDashboard() {
  const dashSection = document.getElementById('farmer-dashboard-section');
  if (!dashSection) return;

  const current = store.currentUser;
  const farmer = current.data || store.farmers[0];

  const farmerNameEl = document.getElementById('dash-farmer-name');
  const farmNameEl = document.getElementById('dash-farm-name');
  const tbody = document.getElementById('dash-products-tbody');
  const statProducts = document.getElementById('dash-stat-products');

  if (farmerNameEl) farmerNameEl.textContent = `Welcome, ${farmer.name}`;
  if (farmNameEl) farmNameEl.textContent = `📍 ${farmer.farmName || "Grace's Organic Farm"} · ${farmer.location}`;

  const products = store.getProductsByFarmer(farmer.id);
  if (statProducts) statProducts.textContent = products.length;

  if (tbody) {
    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">No harvests listed yet. Click "+ Add New Harvest" to list your produce!</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(prod => `
      <tr>
        <td style="display: flex; align-items: center; gap: 0.75rem;">
          <img src="${prod.image}" alt="${prod.name}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">
          <span style="font-weight: 700; color: var(--dark-green);">${prod.name}</span>
        </td>
        <td style="text-transform: capitalize;">${prod.category}</td>
        <td style="font-weight: 800; color: var(--primary);">${formatNaira(prod.price)}</td>
        <td>${prod.unit}</td>
        <td>
          <button class="sticker-tag ${prod.availability.includes('In Stock') ? 'secondary' : 'outline'}" onclick="store.toggleProductAvailability('${prod.id}')" title="Click to toggle availability">
            ${prod.availability.includes('In Stock') ? '● In Stock' : '○ Out of Stock'}
          </button>
        </td>
        <td>
          <button style="color: #C0392B; font-weight: 700; font-size: 0.8125rem;" onclick="if(confirm('Remove this harvest from marketplace?')) store.deleteProduct('${prod.id}')">
            Delete
          </button>
        </td>
      </tr>
    `).join('');
  }
}

/* ==========================================================================
   11. Modals & Auth Flow Controllers
   ========================================================================== */
function initModals() {
  // Modal close triggers
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) closeModal(modal.id);
    });
  });

  // Close modal when clicking backdrop
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });

  // Escape key closes modals and cart drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(modal => {
        closeModal(modal.id);
      });
      const drawer = document.getElementById('cart-drawer-overlay');
      if (drawer && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });

  // Join as Buyer triggers
  const heroJoinBuyer = document.getElementById('hero-join-buyer-btn');
  const mobileJoinBuyer = document.getElementById('mobile-join-buyer-btn');
  const authTabBuyer = document.getElementById('auth-tab-buyer');
  const authTabFarmer = document.getElementById('auth-tab-farmer');
  const authForm = document.getElementById('auth-form');

  const openBuyerAuth = () => {
    openModal('auth-modal');
    if (authTabBuyer) authTabBuyer.click();
  };

  if (heroJoinBuyer) heroJoinBuyer.addEventListener('click', openBuyerAuth);
  if (mobileJoinBuyer) mobileJoinBuyer.addEventListener('click', openBuyerAuth);

  if (authTabBuyer && authTabFarmer) {
    authTabBuyer.addEventListener('click', () => {
      authTabBuyer.style.background = 'var(--dark-green)';
      authTabBuyer.style.color = '#fff';
      authTabFarmer.style.background = 'transparent';
      authTabFarmer.style.color = 'var(--text-primary)';
      document.getElementById('auth-modal-title').textContent = 'Join GoFresh as Buyer';
      document.getElementById('auth-submit-btn').textContent = 'Create Buyer Account & Shop →';
    });

    authTabFarmer.addEventListener('click', () => {
      closeModal('auth-modal');
      openModal('farmer-onboarding-modal');
      showWizardStep(1);
    });
  }

  // Handle Auth submission
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('auth-name').value.trim();
      const email = document.getElementById('auth-email').value.trim();

      store.registerBuyer(name, email);
      closeModal('auth-modal');
      showToast(`Welcome to GoFresh, ${name}! 🌾 Happy shopping.`);

      const goods = document.getElementById('goods');
      if (goods) goods.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   12. How It Works Dual-Track Tabs
   ========================================================================== */
function initHowItWorksTabs() {
  const tabBuyer = document.getElementById('tab-buyer-flow');
  const tabFarmer = document.getElementById('tab-farmer-flow');
  const buyerTrack = document.getElementById('steps-buyer-container');
  const farmerTrack = document.getElementById('steps-farmer-container');

  if (tabBuyer && tabFarmer && buyerTrack && farmerTrack) {
    tabBuyer.addEventListener('click', () => {
      tabBuyer.classList.add('active');
      tabBuyer.setAttribute('aria-selected', 'true');
      tabFarmer.classList.remove('active');
      tabFarmer.setAttribute('aria-selected', 'false');
      buyerTrack.style.display = 'grid';
      farmerTrack.style.display = 'none';
    });

    tabFarmer.addEventListener('click', () => {
      tabFarmer.classList.add('active');
      tabFarmer.setAttribute('aria-selected', 'true');
      tabBuyer.classList.remove('active');
      tabBuyer.setAttribute('aria-selected', 'false');
      farmerTrack.style.display = 'grid';
      buyerTrack.style.display = 'none';
    });
  }
}

/* ==========================================================================
   13. Toast Notification Helper
   ========================================================================== */
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span style="font-size: 1.25rem;">🌱</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}
