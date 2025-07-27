const fs = require('fs');
const csv = require('csv-parser');

const results = [];

fs.createReadStream('itemMasterExport.csv')
  .pipe(csv())
  .on('data', (data) => {
    // Convert categoryIndex to a number
    data.categoryIndex = parseInt(data.categoryIndex, 10);
    
    // Add the material to our results
    results.push({
      id: data.inventoryID,
      label: data.itemDescription,
      unit: data.fieldUOM,
      category: data.category,
      categoryIndex: data.categoryIndex
    });
  })
  .on('end', () => {
    // Sort results by category and categoryIndex
    results.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.categoryIndex - b.categoryIndex;
    });
    
    // Generate the JavaScript code
    const jsCode = `// Auto-generated from CSV
const materials = ${JSON.stringify(results, null, 2)};

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
};`;

    // Write the output to materials.js
    fs.writeFileSync('materials.js', jsCode);
    console.log('Generated materials.js with', results.length, 'materials in', new Set(results.map(r => r.category)).size, 'categories');
  });