// Unit types
const UNIT_TYPES = {
  EACH: "each",
  BOX: "box",
  ROLL: "roll",
  SQUARE: "square",
  BUNDLE: "bundle",
  GALLON: "gallon"
};

// Human-readable labels for units
function getHumanLabel(unitType) {
  const labels = {
    [UNIT_TYPES.EACH]: "Each",
    [UNIT_TYPES.BOX]: "Box",
    [UNIT_TYPES.ROLL]: "Roll",
    [UNIT_TYPES.SQUARE]: "Square",
    [UNIT_TYPES.BUNDLE]: "Bundle",
    [UNIT_TYPES.GALLON]: "Gallon"
  };
  return labels[unitType] || unitType;
}

// Material categories with items
const materialCategories = [
  {
    id: "cat_roofing",
    label: "Roofing",
    items: [
      { id: "mat_shingles_3tab", label: "3-Tab Shingles", unit: UNIT_TYPES.BUNDLE },
      { id: "mat_shingles_arch", label: "Architectural Shingles", unit: UNIT_TYPES.BUNDLE },
      { id: "mat_shingles_designer", label: "Designer Shingles", unit: UNIT_TYPES.BUNDLE },
      { id: "mat_felt_15lb", label: "15# Felt", unit: UNIT_TYPES.ROLL },
      { id: "mat_felt_30lb", label: "30# Felt", unit: UNIT_TYPES.ROLL },
      { id: "mat_synthetic", label: "Synthetic Underlayment", unit: UNIT_TYPES.ROLL },
      { id: "mat_starter", label: "Starter Strip", unit: UNIT_TYPES.BUNDLE },
      { id: "mat_ridge_cap", label: "Ridge Cap", unit: UNIT_TYPES.BUNDLE }
    ]
  },
  {
    id: "cat_flashing",
    label: "Flashing",
    items: [
      { id: "mat_drip_edge", label: "Drip Edge", unit: UNIT_TYPES.EACH },
      { id: "mat_step_flashing", label: "Step Flashing", unit: UNIT_TYPES.EACH },
      { id: "mat_valley_flashing", label: "Valley Flashing", unit: UNIT_TYPES.EACH },
      { id: "mat_pipe_boot", label: "Pipe Boot", unit: UNIT_TYPES.EACH },
      { id: "mat_wall_flashing", label: "Wall Flashing", unit: UNIT_TYPES.EACH }
    ]
  },
  {
    id: "cat_ventilation",
    label: "Ventilation",
    items: [
      { id: "mat_ridge_vent", label: "Ridge Vent", unit: UNIT_TYPES.ROLL },
      { id: "mat_box_vent", label: "Box Vent", unit: UNIT_TYPES.EACH },
      { id: "mat_power_vent", label: "Power Vent", unit: UNIT_TYPES.EACH },
      { id: "mat_soffit_vent", label: "Soffit Vent", unit: UNIT_TYPES.EACH },
      { id: "mat_intake_vent", label: "Intake Vent", unit: UNIT_TYPES.EACH }
    ]
  },
  {
    id: "cat_fasteners",
    label: "Fasteners",
    items: [
      { id: "mat_nails_roofing", label: "Roofing Nails", unit: UNIT_TYPES.BOX },
      { id: "mat_nails_galvanized", label: "Galvanized Nails", unit: UNIT_TYPES.BOX },
      { id: "mat_screws", label: "Screws", unit: UNIT_TYPES.BOX }
    ]
  },
  {
    id: "cat_adhesives",
    label: "Adhesives & Sealants",
    items: [
      { id: "mat_caulk_roof", label: "Roof Caulk", unit: UNIT_TYPES.EACH },
      { id: "mat_cement_plastic", label: "Plastic Cement", unit: UNIT_TYPES.GALLON },
      { id: "mat_cement_wet", label: "Wet Patch Cement", unit: UNIT_TYPES.GALLON }
    ]
  },
  {
    id: "cat_insulation",
    label: "Insulation",
    items: [
      { id: "mat_insulation_batt", label: "Batt Insulation", unit: UNIT_TYPES.EACH },
      { id: "mat_insulation_foam", label: "Foam Board Insulation", unit: UNIT_TYPES.EACH },
      { id: "mat_insulation_blown", label: "Blown-in Insulation", unit: UNIT_TYPES.EACH }
    ]
  }
];

module.exports = {
  materialCategories,
  UNIT_TYPES,
  getHumanLabel
};
