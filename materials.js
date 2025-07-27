// Group materials by category and format for the Slack app
const materialCategories = [
  {
    name: "TPO Membrane, Tape, & Flashing Details",
    items: [
      { id: "INV0000010", label: "TPO 60MIL [5ft] (White)", unit: "ft" },
      { id: "INV0000012", label: "TPO 60MIL [5ft] (Grey)", unit: "ft" },
      { id: "INV0000013", label: "TPO 60MIL [5ft] (Tan)", unit: "ft" },
      { id: "INV0000015", label: "TPO 60MIL [10ft] (White)", unit: "ft" },
      { id: "INV0000016", label: "TPO 60MIL [10ft] (Grey)", unit: "ft" },
      { id: "INV0000018", label: "TPO 60MIL [10ft] (Tan)", unit: "ft" },
      { id: "INV0000035", label: "TPO 60MIL Detail (White)", unit: "ft" },
      { id: "INV0000036", label: "TPO 60MIL Detail (Grey)", unit: "ft" },
      { id: "INV0000037", label: "TPO 60MIL Detail (Tan)", unit: "ft" },
      { id: "INV0000039", label: "TPO Walkway (JM)", unit: "ft" },
      { id: "INV0000058", label: "TPO T-Joint Patch", unit: "each" },
      { id: "INV0017013", label: "TPO P&S Flashing Uncured [12\"]", unit: "ft" },
      { id: "INV0017014", label: "TPO P&S Flashing Uncured [9\"]", unit: "ft" },
      { id: "INV0017017", label: "TPO Walkway (CAR)", unit: "ft" },
      { id: "INV0017018", label: "TPO Cover Strip [6\"]", unit: "ft" },
      { id: "INV0017019", label: "TPO Cover Strip [9\"]", unit: "ft" },
      { id: "INV0017025", label: "TPO SecurTape [3\"]", unit: "ft" },
      { id: "INV0017503", label: "TPO 60MIL [10ft] (Car)", unit: "ft" }
    ]
  },
  {
    name: "EPDM Membrane, Tape, & Flashing Details",
    items: [
      { id: "INV0000091", label: "EPDM NR 60MIL [10ft x 50ft]", unit: "ft" },
      { id: "INV0000101", label: "EPDM P&S Flashing [6\" x 100ft] (Cured)", unit: "ft" },
      { id: "INV0000104", label: "EPDM P&S Flashing [9\" x 50ft] (Cured)", unit: "ft" },
      { id: "INV0000105", label: "EPDM P&S Flashing [12\" x 50ft] (Cured)", unit: "ft" },
      { id: "INV0000106", label: "EPDM P&S Corner", unit: "each" },
      { id: "INV0000107", label: "EPDM P&S Pipe Boot", unit: "each" },
      { id: "INV0000109", label: "EPDM P&S Cover Strip [6\"]", unit: "ft" },
      { id: "INV0000110", label: "EPDM P&S Cover Strip [9\"]", unit: "ft" },
      { id: "INV0000111", label: "EPDM P&S Cover Strip [12\"]", unit: "ft" },
      { id: "INV0000114", label: "EPDM P&S RTS [6\"]", unit: "ft" },
      { id: "INV0000115", label: "EPDM Seam Tape [3\"]", unit: "ft" },
      { id: "INV0016960", label: "EPDM R 45MIL [10ft x 100ft]", unit: "ft" }
    ]
  },
  {
    name: "PVC Membrane, Tape, & Flashing Details",
    items: [
      { id: "INV0000195", label: "PVC 50MIL [5ft x 100ft] (White)", unit: "ft" },
      { id: "INV0000198", label: "PVC 50MIL [3.25ft x 100ft] (Grey)", unit: "ft" },
      { id: "INV0000210", label: "PVC 60MIL [5ft x 100ft]", unit: "ft" },
      { id: "INV0000224", label: "PVC 60MIL [6.33ft x 100ft]", unit: "ft" },
      { id: "INV0000270", label: "PVC Coated Metal (White)", unit: "sheet" },
      { id: "INV0000271", label: "PVC Coated Metal (Grey)", unit: "sheet" },
      { id: "INV0000272", label: "PVC Coated Metal (Sandstone)", unit: "sheet" },
      { id: "INV0000273", label: "PVC Walkway (Grey)", unit: "ft" },
      { id: "INV0000274", label: "PVC Walkway (Sandstone)", unit: "ft" },
      { id: "INV0000275", label: "PVC Walkway (Yellow)", unit: "ft" },
      { id: "INV0017216", label: "PVC Pipe Boot", unit: "each" },
      { id: "INV0011648", label: "PVC 60MIL [10ft x 100ft] (White)", unit: "ft" }
    ]
  },
  {
    name: "Adhesives, Sealants, Coatings, & Solvents",
    items: [
      { id: "INV0000074", label: "TPO Adhesive Solvent", unit: "gal" },
      { id: "INV0000079", label: "JM Lap Caulk Tube", unit: "each" },
      { id: "INV0000081", label: "JM Edge Sealant Bottle", unit: "each" },
      { id: "INV0000082", label: "TPO Primer", unit: "quart" },
      { id: "INV0000119", label: "EPDM Bonding Cement (Water Based)", unit: "gal" },
      { id: "INV0000120", label: "EPDM Bonding Cement (LVOC)", unit: "gal" },
      { id: "INV0000127", label: "EPDM Tape Primer", unit: "quart" },
      { id: "INV0000602", label: "NP1 Sealant Tube (Black)", unit: "each" },
      { id: "INV0000640", label: "Karna-Flex Sealant", unit: "gal" }
    ]
  },
  {
    name: "Boards & ISO",
    items: [
      { id: "INV0000130", label: "JM ISO ENRGY - 3.5\" x 8ft", unit: "square" },
      { id: "INV0000131", label: "JM ISO ENRGY 3 - 1.0\" x 4ft", unit: "square" },
      { id: "INV0000132", label: "JM ISO ENRGY 3 - 1.0\" x 8ft", unit: "square" },
      { id: "INV0000140", label: "JM ISO ENRGY 3 - 1.5\" x 4ft", unit: "square" },
      { id: "INV0000150", label: "JM ISO ENRGY 3 - 2.0\" x 4ft", unit: "square" },
      { id: "INV0000159", label: "JM ISO ENRGY 3 - 2.5\" x 8ft", unit: "square" },
      { id: "INV0000689", label: "JM Fiberboard - 1/2\"", unit: "square" },
      { id: "INV0000691", label: "Securock Board - 1/4\" x 4ft", unit: "square" },
      { id: "INV0000696", label: "Securock Board - 1/2\" x 8ft", unit: "square" },
      { id: "INV0001251", label: "OSB - 7/16\" x 8ft", unit: "sheet" }
    ]
  },
  {
    name: "Fasteners",
    items: [
      { id: "INV0000332", label: "UF #12 [5\" Fastener]", unit: "each" },
      { id: "INV0000334", label: "UF #12 [7\" Fastener]", unit: "each" },
      { id: "INV0000346", label: "UF #12 [3\" Plate]", unit: "each" },
      { id: "INV0000369", label: "HL #15 Phillips [1.25\"]", unit: "each" },
      { id: "INV0000371", label: "HL #15 Phillips [3\"]", unit: "each" },
      { id: "INV0000372", label: "HL #15 Phillips [4\"]", unit: "each" },
      { id: "INV0000373", label: "HL #15 Phillips [5\"]", unit: "each" },
      { id: "INV0000375", label: "HL #15 Phillips [7\"]", unit: "each" },
      { id: "INV0000380", label: "HL #15 Phillips [12\"]", unit: "each" },
      { id: "INV0000459", label: "Galvalume-Coated Plate [2\"]", unit: "each" }
    ]
  },
  {
    name: "Everyday Basics",
    items: [
      { id: "INV0000461", label: "Termination Bar", unit: "each" },
      { id: "INV0000612", label: "409 Cleaner", unit: "gal" },
      { id: "INV0000688", label: "Visqueen Plastic Sheeting", unit: "ft" },
      { id: "INV0000777", label: "Clamp [1\"- 3\"]", unit: "each" },
      { id: "INV0000778", label: "Clamp [3\"- 6\"]", unit: "each" },
      { id: "INV0000779", label: "Clamp [6\"- 12\"]", unit: "each" },
      { id: "INV0000781", label: "Metal to Metal Screw", unit: "each" },
      { id: "INV0000782", label: "Metal to Wood Screw", unit: "each" },
      { id: "INV0011449", label: "Roller Cover", unit: "each" },
      { id: "INV0011450", label: "Roller Frame", unit: "each" }
    ]
  }
];

// Helper function to get human-readable unit labels
function getHumanLabel(unit) {
  const labels = {
    "ft": "Feet",
    "gal": "Gallons",
    "each": "Each",
    "quart": "Quarts",
    "square": "Squares",
    "sheet": "Sheets",
    "bundle": "Bundles",
    "roll": "Rolls",
    "box": "Boxes",
    "tube": "Tubes"
  };
  return labels[unit] || unit;
}

module.exports = {
  materialCategories,
  getHumanLabel
};
