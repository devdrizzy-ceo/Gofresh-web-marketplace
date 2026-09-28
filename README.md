# GoFresh · Direct Agricultural Marketplace

> **"Fresh From The Farm. Straight To Your Table."**
> A contemporary, editorial digital marketplace connecting verified Nigerian farmers directly with local buyers.

---

## 🌾 Overview

**GoFresh** is an editorial, cinematic, image-heavy agricultural marketplace designed to eliminate predatory middlemen, reduce post-harvest food waste, and deliver fresh farm produce directly from the field to consumers' tables within 24 hours of harvest.

Inspired by the visual storytelling, bold typography, and generous whitespace of high-end editorial ecommerce (such as [Andrews Bodega](https://www.andrewsbodega.com/)), GoFresh pairs authentic agricultural documentary imagery with a modern digital product architecture.

---

## ✨ Key Features

### 🚜 For Farmers
- **5-Step Onboarding Wizard**:
  1. Personal Information & Verification
  2. Farm Details & Specialization
  3. Farm & Produce Photo Uploads (with instant image previews via FileReader)
  4. First Produce Listing (Naira pricing, units, quantities)
  5. Review & Instant Publication
- **Farmer Dashboard**:
  - Live listings management (Add, Delete, Edit)
  - Real-time produce stock availability toggle (`In Stock` ↔ `Out of Stock`)
  - Order intelligence, revenue tracking, and inquiry metrics
- **Verified Farmer Profile Pages**:
  - Dedicated public profiles showing farm acreage, customer rating, biography, and available harvests.

### 🛒 For Buyers
- **Asymmetric Editorial Marketplace**:
  - Variable-rhythm product cards with authentic Nigerian photography
  - Category filtering across Grains, Vegetables, Fruits, Tubers, Meat, and Fish
  - Multi-word search with smart category fallback
  - Product Quick-View modal with batch availability and origin details
- **Interactive Slide-Out Cart Drawer**:
  - Real-time subtotal calculation
  - Free farm delivery progress bar (threshold: ₦35,000)
  - Quantity steppers (`+` / `-`) and instant removals
- **Doorstep Checkout & Order Confirmation**:
  - Delivery scheduling (morning/afternoon/harvest day windows)
  - Flexible payment simulation (Direct Bank Transfer, Debit Card, Pay on Delivery)
  - Generated Order ID and fulfillment summary

### 🎨 Brand Identity & Design System
- **Curated Palette**:
  - Olive Green (`#536B2F`)
  - Lemon / Lime Green (`#A8C957`)
  - Vibrant Lime Accent (`#D7E85B`)
  - Deep Forest Green (`#183A2A`)
  - Warm Milky Off-White (`#F5F2E8`)
  - Deep Charcoal Text (`#172019`)
- **Typography**: Clean, minimalist, and professional typography pairing [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) and [Inter](https://fonts.google.com/specimen/Inter) with subtle editorial italics ([Fraunces](https://fonts.google.com/specimen/Fraunces)).
- **Subtle Editorial Grain**: Pure CSS non-asset procedural film grain overlay for cinematic warmth.

---

## 📁 Repository Structure

```
GoFresh/
├── assets/
│   └── images/               # High-resolution documentary & product photography
│       ├── community.jpg
│       ├── farmer_chioma.jpg
│       ├── farmer_grace.jpg
│       ├── farmer_ibrahim.jpg
│       ├── fish.jpg
│       ├── fruits.jpg
│       ├── grains.jpg
│       ├── hero_farmer.jpg
│       ├── meat.jpg
│       ├── tomatoes.jpg
│       ├── tubers.jpg
│       └── vegetables.jpg
├── css/
│   ├── main.css              # Design tokens, typography hierarchy, reset & layout
│   ├── components.css        # Navigation, buttons, modals, cart drawer, toasts
│   └── marketplace.css       # Hero, marquee, category grid, product cards, footer
├── js/
│   ├── data.js               # Mock data for farmers, categories, products & initial orders
│   ├── store.js              # Reactive state store with event pub/sub & localStorage persistence
│   └── app.js                # Modular controllers for UI, cart, onboarding & checkout
├── sketches/                 # Original handwritten conceptual sketches
│   ├── sketch1.jpeg
│   └── sketch2.jpeg
├── index.html                # Semantic HTML5 single-page application
└── README.md
```

---

## 🚀 Getting Started

No build tools, bundlers, or package managers are required.

Simply open `index.html` in any modern web browser:

```bash
# Option 1: Double-click index.html or open via browser
# Option 2: Serve using any static file server
npx serve .
# or
python -m http.server 3000
```

---

## 📄 License
This project is open-source under the MIT License.
