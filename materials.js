const materialsData = require('./materials.json');

// Helper function to get materials grouped by category
function getMaterialsByCategory() {
  const categories = {};
  
  // Group materials by category
  materials.forEach(material => {
    if (!categories[material.category]) {
      categories[material.category] = [];
    }
    categories[material.category].push(material);
  });
  
  // Sort materials within each category by categoryIndex
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
