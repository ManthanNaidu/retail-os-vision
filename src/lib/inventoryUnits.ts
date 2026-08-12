export const INVENTORY_UNIT_CATEGORIES = {
  Count: ['Piece (pc)', 'Unit (unit)', 'Item', 'Each (ea)'],
  Weight: ['Kilogram (kg)', 'Gram (g)', 'Milligram (mg)', 'Quintal', 'Tonne (t)'],
  Volume: ['Litre (L)', 'Millilitre (mL)', 'Kilolitre (kL)'],
  Length: ['Metre (m)', 'Centimetre (cm)', 'Millimetre (mm)', 'Kilometre (km)', 'Inch', 'Foot'],
  Area: ['Square metre (m²)', 'Square foot (ft²)', 'Square inch'],
  Packaging: ['Pack', 'Packet', 'Box', 'Carton', 'Case', 'Bag', 'Sack', 'Pouch'],
  Containers: ['Bottle', 'Can', 'Jar', 'Tin', 'Tub', 'Container', 'Drum', 'Barrel'],
  Bundles: ['Bundle', 'Bunch', 'Set', 'Kit', 'Pair', 'Dozen'],
  Paper: ['Sheet', 'Ream', 'Roll', 'Pad', 'Book']
};

export const getUnitsForCategory = (category: string): string[] => {
  const c = category.toLowerCase();
  
  let allowedCategories = ['Count', 'Packaging', 'Bundles', 'Containers']; // defaults
  
  if (c.includes('grocer') || c.includes('food')) {
    allowedCategories = ['Weight', 'Volume', 'Count', 'Packaging', 'Containers', 'Bundles'];
  } else if (c.includes('hardware') || c.includes('construction')) {
    allowedCategories = ['Count', 'Length', 'Area', 'Weight', 'Packaging', 'Bundles'];
  } else if (c.includes('pharmacy') || c.includes('medic')) {
    allowedCategories = ['Count', 'Weight', 'Volume', 'Packaging', 'Containers'];
  } else if (c.includes('clothing') || c.includes('garment') || c.includes('apparel')) {
    allowedCategories = ['Count', 'Bundles'];
  } else if (c.includes('electronic')) {
    allowedCategories = ['Count', 'Packaging', 'Bundles'];
  } else if (c.includes('stationery')) {
    allowedCategories = ['Count', 'Paper', 'Packaging', 'Bundles'];
  } else if (c.includes('liquid') || c.includes('beverage')) {
    allowedCategories = ['Volume', 'Containers', 'Bundles', 'Packaging'];
  } else if (c.includes('agri')) {
    allowedCategories = ['Weight', 'Packaging', 'Bundles'];
  } else {
    // Default to all generic ones
    allowedCategories = Object.keys(INVENTORY_UNIT_CATEGORIES);
  }

  const units: string[] = [];
  allowedCategories.forEach(cat => {
    if (INVENTORY_UNIT_CATEGORIES[cat as keyof typeof INVENTORY_UNIT_CATEGORIES]) {
      units.push(...INVENTORY_UNIT_CATEGORIES[cat as keyof typeof INVENTORY_UNIT_CATEGORIES]);
    }
  });

  return Array.from(new Set(units));
};
