// Categorized materials list - representative sample from each category
const materials = [
  // Everyday Basics
  {
    id: "INV0017225",
    label: "Rags",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 1
  },
  {
    id: "INV0017337",
    label: "Garbage Bags",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 2
  },
  {
    id: "INV0017226",
    label: "Pair of Gloves",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 3
  },
  
  // Adhesives & Sealants
  {
    id: "INV0000602",
    label: "NP1 Sealant Tube (Black)",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 1
  },
  {
    id: "INV0000599",
    label: "NP1 Sealant Tube (White)",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 2
  },
  {
    id: "INV0000081",
    label: "JM Edge Sealant Bottle",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 3
  },
  
  // Boards & ISO
  {
    id: "INV0001251",
    label: "OSB - 7/16\" x 8ft",
    unit: "per sheet",
    category: "Boards & ISO",
    categoryIndex: 1
  },
  {
    id: "INV0001258",
    label: "OSB - 3/4\" x 8ft",
    unit: "per sheet",
    category: "Boards & ISO",
    categoryIndex: 2
  },
  
  // EPDM Membrane
  {
    id: "INV0016960",
    label: "EPDM R 45MIL [10ft x 100ft]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 1
  },
  {
    id: "INV0016964",
    label: "EPDM NR 45MIL [10ft x 100ft]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 2
  },
  
  // Fasteners
  {
    id: "INV0000459",
    label: "Galvalume-Coated Plate [2\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 1
  },
  {
    id: "INV0000460",
    label: "Galvalume-Coated Plate [3\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 2
  },
  
  // Misc Other
  {
    id: "INV0000666",
    label: "CL MetaLink Sealant Tube (Almond)",
    unit: "each",
    category: "Misc Other",
    categoryIndex: 2
  },
  {
    id: "INV0000683",
    label: "CL MetaLink Sealant Tube (Brandywine)",
    unit: "each",
    category: "Misc Other",
    categoryIndex: 3
  }
];

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
