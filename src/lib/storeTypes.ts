// RetailOS AI — Store Type Definitions
// Each store type has its own categories, default settings, and workflows

export interface StoreType {
  id: string;
  name: string;
  emoji: string;
  description: string;
  categories: string[];
  units: string[];
  defaultGST: number;
  requiresExpiry: boolean;
  requiresBatch: boolean;
  features: string[];
  color: string;
  accentColor: string;
}

export const STORE_TYPES: Record<string, StoreType> = {
  medical: {
    id: 'medical',
    name: 'Medical / Pharmacy',
    emoji: '💊',
    description: 'Medicines, OTC products, surgical items',
    categories: ['Medicines (Prescription)', 'OTC / Over-the-Counter', 'Surgical & Devices', 'Cosmetics & Skincare', 'Baby & Infant Care', 'Vitamins & Supplements', 'Ayurvedic', 'Homeopathic', 'Health Equipment'],
    units: ['Strip', 'Bottle', 'Box', 'Sachet', 'Piece', 'Pack', 'Vial', 'Tube', 'Kg', 'Litre'],
    defaultGST: 12,
    requiresExpiry: true,
    requiresBatch: true,
    features: ['Expiry tracking', 'Batch number', 'Schedule classification', 'Drug interaction check'],
    color: '#059669',
    accentColor: '#d1fae5',
  },

  grocery: {
    id: 'grocery',
    name: 'Grocery / Kirana',
    emoji: '🛒',
    description: 'Grocery, FMCG, daily essentials',
    categories: ['Grains & Pulses', 'Dairy & Eggs', 'Snacks & Namkeen', 'Beverages & Drinks', 'Cleaning Supplies', 'Personal Care', 'Frozen & Chilled', 'Condiments & Spices', 'Oil & Ghee', 'Ready to Cook'],
    units: ['Kg', 'Litre', 'Packet', 'Box', 'Piece', 'Bundle', 'Dozen', 'Gram', 'Ml'],
    defaultGST: 5,
    requiresExpiry: true,
    requiresBatch: false,
    features: ['Expiry tracking', 'Weight-based pricing', 'Loose items support'],
    color: '#d97706',
    accentColor: '#fef3c7',
  },

  electronics: {
    id: 'electronics',
    name: 'Electronics / Mobile',
    emoji: '📱',
    description: 'Electronics, mobiles, accessories, repairs',
    categories: ['Smartphones', 'Mobile Accessories', 'Laptops & Computers', 'Audio & Headphones', 'Tablets', 'Cables & Chargers', 'Smart Devices', 'Batteries & Power Banks', 'Repair Parts', 'Gaming'],
    units: ['Piece', 'Box', 'Set', 'Pair', 'Unit'],
    defaultGST: 18,
    requiresExpiry: false,
    requiresBatch: true,
    features: ['IMEI/Serial tracking', 'Warranty management', 'Repair job cards'],
    color: '#7c3aed',
    accentColor: '#ede9fe',
  },

  clothing: {
    id: 'clothing',
    name: 'Clothing / Textiles',
    emoji: '👕',
    description: 'Garments, fabrics, fashion accessories',
    categories: ['Men\'s Wear', 'Women\'s Wear', 'Kids\' Wear', 'Ethnic / Traditional', 'Footwear', 'Accessories & Bags', 'Fabrics & Sarees', 'Undergarments', 'Sports Wear', 'Seasonal / Festive'],
    units: ['Piece', 'Set', 'Pair', 'Meter', 'Dozen'],
    defaultGST: 5,
    requiresExpiry: false,
    requiresBatch: false,
    features: ['Size & color variants', 'Seasonal stock', 'Alteration tracking'],
    color: '#ec4899',
    accentColor: '#fce7f3',
  },

  hardware: {
    id: 'hardware',
    name: 'Hardware / Tools',
    emoji: '🔧',
    description: 'Construction materials, tools, plumbing, electrical',
    categories: ['Hand Tools', 'Power Tools', 'Plumbing Fittings', 'Electrical Items', 'Paint & Primer', 'Safety Equipment', 'Fasteners & Adhesives', 'Pipes & Fittings', 'Tiles & Flooring', 'Wood & Timber'],
    units: ['Piece', 'Box', 'Kg', 'Litre', 'Meter', 'Set', 'Roll', 'Bundle'],
    defaultGST: 18,
    requiresExpiry: false,
    requiresBatch: false,
    features: ['Brand & specification tracking', 'Bulk/retail pricing', 'Project quotations'],
    color: '#ea580c',
    accentColor: '#ffedd5',
  },

  bakery: {
    id: 'bakery',
    name: 'Bakery / Food',
    emoji: '🍞',
    description: 'Baked goods, sweets, snacks, restaurant',
    categories: ['Breads & Buns', 'Cakes & Pastries', 'Sweets & Mithai', 'Namkeen & Savory', 'Chocolates', 'Dry Fruits', 'Ice Cream', 'Beverages', 'Fresh Produce', 'Ready-to-Eat'],
    units: ['Piece', 'Kg', 'Box', 'Packet', 'Dozen', 'Gram', 'Litre'],
    defaultGST: 5,
    requiresExpiry: true,
    requiresBatch: false,
    features: ['Short expiry tracking', 'Daily production count', 'Wastage management'],
    color: '#b45309',
    accentColor: '#fef3c7',
  },

  stationery: {
    id: 'stationery',
    name: 'Stationery / Books',
    emoji: '📚',
    description: 'Books, stationery, art supplies, school items',
    categories: ['Books & Textbooks', 'Notebooks & Diaries', 'Pens & Pencils', 'Art & Craft', 'Office Supplies', 'Printer & Ink', 'School Bags', 'Educational Toys', 'Exam Materials', 'Gifts & Cards'],
    units: ['Piece', 'Set', 'Box', 'Pack', 'Dozen', 'Bundle'],
    defaultGST: 0,
    requiresExpiry: false,
    requiresBatch: false,
    features: ['Grade & syllabus tracking', 'School/college supply sets', 'Exam season stock'],
    color: '#0284c7',
    accentColor: '#e0f2fe',
  },

  general: {
    id: 'general',
    name: 'General Store',
    emoji: '🏪',
    description: 'Multi-category general merchandise',
    categories: ['Grocery', 'Hygiene', 'Beverages', 'Snacks', 'Cleaning', 'Electronics', 'Clothing', 'Stationery', 'Hardware', 'Other'],
    units: ['Piece', 'Kg', 'Litre', 'Box', 'Packet', 'Set'],
    defaultGST: 5,
    requiresExpiry: false,
    requiresBatch: false,
    features: ['Multi-category support', 'Mixed inventory', 'Flexible pricing'],
    color: '#64748b',
    accentColor: '#f1f5f9',
  },

  wholesale: {
    id: 'wholesale',
    name: 'Wholesale / Distribution',
    emoji: '📦',
    description: 'Wholesale trading, bulk supply, distribution',
    categories: ['FMCG Goods', 'Medicines', 'Electronics', 'Clothing & Textiles', 'Food Products', 'Industrial Goods', 'Agricultural Products', 'Building Materials'],
    units: ['Case', 'Carton', 'Pallet', 'Kg', 'Litre', 'Bundle', 'Dozen'],
    defaultGST: 5,
    requiresExpiry: false,
    requiresBatch: true,
    features: ['Bulk pricing tiers', 'Retailer credit accounts', 'Large order management'],
    color: '#1a56db',
    accentColor: '#e8f0fe',
  },
};

export function getStoreType(id: string): StoreType {
  return STORE_TYPES[id] || STORE_TYPES.general;
}

export function getStoreTypeList(): StoreType[] {
  return Object.values(STORE_TYPES);
}

// Category presets for quick start
export const STARTER_PRODUCTS: Record<string, Array<{ name: string; category: string; purchasePrice: number; sellingPrice: number; unit: string; stock: number }>> = {
  medical: [
    { name: 'Paracetamol 500mg (10 Tablets)', category: 'Medicines (Prescription)', purchasePrice: 14, sellingPrice: 19, unit: 'Strip', stock: 50 },
    { name: 'Crocin 650mg (15 Tablets)', category: 'OTC / Over-the-Counter', purchasePrice: 34, sellingPrice: 44, unit: 'Strip', stock: 30 },
    { name: 'Dettol Antiseptic Liquid 250ml', category: 'OTC / Over-the-Counter', purchasePrice: 115, sellingPrice: 145, unit: 'Bottle', stock: 20 },
  ],
  grocery: [
    { name: 'Tata Salt 1kg', category: 'Condiments & Spices', purchasePrice: 18, sellingPrice: 22, unit: 'Packet', stock: 50 },
    { name: 'Fortune Sunflower Oil 1L', category: 'Oil & Ghee', purchasePrice: 130, sellingPrice: 160, unit: 'Litre', stock: 30 },
    { name: 'Aashirvaad Atta 5kg', category: 'Grains & Pulses', purchasePrice: 195, sellingPrice: 240, unit: 'Packet', stock: 20 },
  ],
  electronics: [
    { name: 'USB-C Cable 1m (Braided)', category: 'Cables & Chargers', purchasePrice: 85, sellingPrice: 149, unit: 'Piece', stock: 20 },
    { name: 'Screen Protector (Universal 6")', category: 'Mobile Accessories', purchasePrice: 35, sellingPrice: 79, unit: 'Piece', stock: 40 },
    { name: '20W Fast Charger Adapter', category: 'Cables & Chargers', purchasePrice: 180, sellingPrice: 349, unit: 'Piece', stock: 15 },
  ],
  clothing: [
    { name: 'Cotton T-Shirt (Round Neck)', category: 'Men\'s Wear', purchasePrice: 120, sellingPrice: 249, unit: 'Piece', stock: 30 },
    { name: 'Formal Trouser', category: 'Men\'s Wear', purchasePrice: 350, sellingPrice: 699, unit: 'Piece', stock: 20 },
    { name: 'Kurti (Cotton Printed)', category: 'Women\'s Wear', purchasePrice: 280, sellingPrice: 549, unit: 'Piece', stock: 25 },
  ],
};
