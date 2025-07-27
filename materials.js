// Group materials by category and format for the Slack app
const materialCategories = [
  // Your categories and materials here...
];

// Helper function to get human-readable unit labels (plural)
function getHumanLabel(unit) {
  const labels = {
    "ft": "feet",
    "gal": "gallons",
    "each": "each",
    "quart": "quarts",
    "square": "squares",
    "sheet": "sheets",
    "bundle": "bundles",
    "roll": "rolls",
    "box": "boxes",
    "tube": "tubes"
  };
  return labels[unit] || unit;
}

// Helper function to get singular lowercase units for "per [unit]" format
function getSingularLabel(unit) {
  const labels = {
    "ft": "foot",
    "gal": "gallon", 
    "each": "each",
    "quart": "quart",
    "square": "square",
    "sheet": "sheet",
    "bundle": "bundle",
    "roll": "roll",
    "box": "box",
    "tube": "tube"
  };
  return labels[unit] || unit;
}

// New helper function that chooses singular or plural based on quantity
function getQuantityLabel(unit, qty) {
  // Use singular form for quantity of 1, plural for all others
  if (qty === 1) {
    return getSingularLabel(unit);
  } else {
    return getHumanLabel(unit);
  }
}

module.exports = {
  materialCategories,
  getHumanLabel,
  getSingularLabel,
  getQuantityLabel
};
