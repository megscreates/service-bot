// Basic materials list
const materials = [
  {
    id: "INV0017225",
    label: "Rags",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 1
  },
  {
    id: "INV0000602",
    label: "NP1 Sealant Tube (Black)",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 1
  },
  // Add a few more items to test
];

// Helper function to get materials grouped by category
function getMaterialsByCategory() {
  const categories = {};
  
  materials.forEach(material => {
    if (!categories[material.category]) {
      categories[material.category] = [];
    }
    categories[material.category].push(material);
  });
  
  // Sort within categories
  Object.keys(categories).forEach(category => {
    categories[category].sort((a, b) => a.categoryIndex - b.categoryIndex);
  });
  
  return categories;
}

// Get array of unique category names
function getCategories() {
  return [...new Set(materials.map(m => m.category))];
}

// Get material by ID
function getMaterial(id) {
  return materials.find(m => m.id === id);
}

module.exports = {
  materials,
  getMaterialsByCategory,
  getCategories,
  getMaterial
};
