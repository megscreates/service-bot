// Group materials by category and format for the Slack app
const materialCategories = [
  {
    name: "Everyday Basics",
    items: [
      { id: "INV0017225", label: "Rags", unit: "each" },
      { id: "INV0017337", label: "Garbage Bags", unit: "each" },
      { id: "INV0017226", label: "Gloves", unit: "each" },
      { id: "INV0017228", label: "Chip Brush", unit: "each" },
      { id: "INV0017414", label: "Masking Tape", unit: "each" },
      { id: "INV0000612", label: "409 Cleaner", unit: "gal" },
      { id: "INV0017227", label: "MEK Cleaner", unit: "quart" },
      { id: "INV0000685", label: "MH Weathered Mem Cleaner", unit: "quart" },
      { id: "INV0016999", label: "CAR Weathered Mem Cleaner", unit: "gal" },
      { id: "INV0011449", label: "Roller Cover", unit: "each" },
      { id: "INV0011450", label: "Roller Frame", unit: "each" },
      { id: "INV0017372", label: "Spray Foam Can", unit: "each" },
      { id: "INV0017123", label: "Mesh [4\" x 50ft]", unit: "ft" },
      { id: "INV0017121", label: "Mesh [6\" x 50ft]", unit: "ft" },
      { id: "INV0017124", label: "Mesh [6\" x 100ft]", unit: "ft" },
      { id: "INV0017122", label: "Mesh [12\" x 100ft]", unit: "ft" },
      { id: "INV0000777", label: "Clamp [1\"- 3\"]", unit: "each" },
      { id: "INV0000778", label: "Clamp [3\"- 6\"]", unit: "each" },
      { id: "INV0000779", label: "Clamp [6\"- 12\"]", unit: "each" },
      { id: "INV0017373", label: "Reciprocating Saw (Metal)", unit: "each" },
      { id: "INV0017374", label: "Reciprocating Saw (Wood)", unit: "each" },
      { id: "INV0000461", label: "Termination Bar", unit: "each" },
      { id: "INV0017139", label: "Coil Nail", unit: "each" },
      { id: "INV0000781", label: "Metal to Metal Screw", unit: "each" },
      { id: "INV0000782", label: "Metal to Wood Screw", unit: "each" },
      { id: "INV0017002", label: "Seam Plate", unit: "each" },
      { id: "INV0017493", label: "SecurFast Insulation Plate", unit: "each" },
      { id: "INV0000688", label: "Visqueen Plastic Sheeting", unit: "ft" }
    ]
  },
  {
    name: "Adhesives, Sealants, & Coatings",
    items: [
      { id: "INV0000602", label: "NP1 Sealant Tube (Black)", unit: "each" },
      { id: "INV0000599", label: "NP1 Sealant Tube (White)", unit: "each" },
      { id: "INV0000081", label: "JM Edge Sealant Bottle", unit: "each" },
      { id: "INV0016998", label: "Lap Sealant Tube", unit: "each" },
      { id: "INV0000614", label: "MH Lap Caulk Tube", unit: "each" },
      { id: "INV0000079", label: "JM Lap Caulk Tube", unit: "each" },
      { id: "INV0000301", label: "JM Water Cutoff Mastic Tube", unit: "each" },
      { id: "INV0000639", label: "TRMC Water Cutoff Mastic Sausage", unit: "each" },
      { id: "INV0000646", label: "CL Pourable Sealant Pouch (White)", unit: "each" },
      { id: "INV0000645", label: "CL Pourable Sealant Pouch (Black)", unit: "each" },
      { id: "INV0000656", label: "JM Pourable Sealant Pouch (Grey)", unit: "each" },
      { id: "INV0017003", label: "CAR Pourable Sealant [1gal]", unit: "quart" },
      { id: "INV0017022", label: "CAR TPO Pourable Sealant [1gal]", unit: "quart" },
      { id: "INV0000638", label: "TRMC Dymonic 100 Sausage (White)", unit: "each" },
      { id: "INV0000618", label: "TRMC Dymonic 100 Sausage (Precast White)", unit: "each" },
      { id: "INV0000637", label: "TRMC Dymonic 100 Sausage (Black)", unit: "each" },
      { id: "INV0017198", label: "MH Repair Hero (Black)", unit: "gal" },
      { id: "INV0017451", label: "MH Repair Hero (White)", unit: "gal" },
      { id: "INV0000640", label: "Karna-Flex Sealant", unit: "gal" },
      { id: "INV0000686", label: "GacoPatch", unit: "gal" },
      { id: "INV0017133", label: "Uniflex Sealant", unit: "gal" },
      { id: "INV0000074", label: "TPO Adhesive Solvent", unit: "gal" },
      { id: "INV0017150", label: "KARNAK 169 Coating", unit: "gal" },
      { id: "INV0017132", label: "Uniflex Coating", unit: "gal" },
      { id: "INV0017130", label: "ALSAN Flashing", unit: "quart" },
      { id: "INV0000617", label: "ALSAN RS 230 FIELD", unit: "gal" },
      { id: "INV0000082", label: "TPO Primer", unit: "quart" },
      { id: "INV0017004", label: "LVOC Primer", unit: "quart" },
      { id: "INV0000307", label: "Asphalt Primer", unit: "gal" },
      { id: "INV0000127", label: "EPDM Tape Primer", unit: "quart" },
      { id: "INV0000641", label: "Vapor Barrier SA Primer", unit: "gal" },
      { id: "INV0000642", label: "Vapor Barrier SA Primer (LVOC)", unit: "gal" },
      { id: "INV0017096", label: "Uniflex Seam Tape [2\"]", unit: "ft" },
      { id: "INV0017098", label: "Uniflex Seam Tape [4\"]", unit: "ft" },
      { id: "INV0017099", label: "Uniflex Seam Tape [6\"]", unit: "ft" },
      { id: "INV0000655", label: "Butyl Seam Tape", unit: "ft" },
      { id: "INV0000120", label: "EPDM Bonding Cement (LVOC)", unit: "gal" },
      { id: "INV0000119", label: "EPDM Bonding Cement (Water Based)", unit: "gal" },
      { id: "INV0000652", label: "KARNAK 19 (Summer)", unit: "gal" },
      { id: "INV0000653", label: "KARNAK 19 (Winter)", unit: "gal" },
      { id: "INV0017151", label: "KARNAK 19 ULTRA (Summer)", unit: "gal" },
      { id: "INV0000654", label: "KARNAK 19 ULTRA (Winter)", unit: "gal" },
      { id: "INV0017152", label: "KARNAK 19 ULTRA Tube", unit: "each" },
      { id: "INV0000596", label: "RML Lucas 6500 Flashing Cement (Black)", unit: "gal" },
      { id: "INV0000595", label: "RML Lucas 6500 Flashing Cement (White)", unit: "gal" }
    ]
  },
  {
    name: "TPO",
    items: [
      { id: "INV0000010", label: "TPO 60MIL [5ft] (White)", unit: "ft" },
      { id: "INV0000012", label: "TPO 60MIL [5ft] (Grey)", unit: "ft" },
      { id: "INV0000013", label: "TPO 60MIL [5ft] (Tan)", unit: "ft" },
      { id: "INV0000015", label: "TPO 60MIL [10ft] (White)", unit: "ft" },
      { id: "INV0000016", label: "TPO 60MIL [10ft] (Grey)", unit: "ft" },
      { id: "INV0000018", label: "TPO 60MIL [10ft] (Tan)", unit: "ft" },
      { id: "INV0017503", label: "TPO 60MIL [10ft] (Car)", unit: "ft" },
      { id: "INV0000035", label: "TPO 60MIL Detail (White)", unit: "ft" },
      { id: "INV0000036", label: "TPO 60MIL Detail (Grey)", unit: "ft" },
      { id: "INV0000037", label: "TPO 60MIL Detail (Tan)", unit: "ft" },
      { id: "INV0017025", label: "TPO SecurTape [3\"]", unit: "ft" },
      { id: "INV0017019", label: "TPO Cover Strip [9\"]", unit: "ft" },
      { id: "INV0017018", label: "TPO Cover Strip [6\"]", unit: "ft" },
      { id: "INV0000058", label: "TPO T-Joint Patch", unit: "each" },
      { id: "INV0017014", label: "TPO P&S Flashing Uncured [9\"]", unit: "ft" },
      { id: "INV0017013", label: "TPO P&S Flashing Uncured [12\"]", unit: "ft" },
      { id: "INV0016955", label: "TPO Sure-Weld NR Flashing", unit: "ft" },
      { id: "INV0017017", label: "TPO Walkway (CAR)", unit: "ft" },
      { id: "INV0000039", label: "TPO Walkway (JM)", unit: "ft" }
    ]
  },
  {
    name: "PVC",
    items: [
      { id: "INV0000198", label: "PVC 50MIL [3.25ft x 100ft] (Grey)", unit: "ft" },
      { id: "INV0000195", label: "PVC 50MIL [5ft x 100ft] (White)", unit: "ft" },
      { id: "INV0011648", label: "PVC 60MIL [10ft x 100ft] (White)", unit: "ft" },
      { id: "INV0000210", label: "PVC 60MIL [5ft x 100ft]", unit: "ft" },
      { id: "INV0000224", label: "PVC 60MIL [6.33ft x 100ft]", unit: "ft" },
      { id: "INV0017216", label: "PVC Pipe Boot", unit: "each" },
      { id: "INV0000271", label: "PVC Coated Metal (Grey)", unit: "sheet" },
      { id: "INV0000270", label: "PVC Coated Metal (White)", unit: "sheet" },
      { id: "INV0000272", label: "PVC Coated Metal (Sandstone)", unit: "sheet" },
      { id: "INV0000273", label: "PVC Walkway (Grey)", unit: "ft" },
      { id: "INV0000274", label: "PVC Walkway (Sandstone)", unit: "ft" },
      { id: "INV0000275", label: "PVC Walkway (Yellow)", unit: "ft" }
    ]
  },
  {
    name: "EPDM",
    items: [
      { id: "INV0016960", label: "EPDM R 45MIL [10ft x 100ft]", unit: "ft" },
      { id: "INV0016964", label: "EPDM NR 45MIL [10ft x 100ft]", unit: "ft" },
      { id: "INV0016965", label: "EPDM R 60MIL [10ft x 100ft]", unit: "ft" },
      { id: "INV0000091", label: "EPDM NR 60MIL [10ft x 50ft]", unit: "ft" },
      { id: "INV0016966", label: "EPDM NR 60MIL [20ft x 100ft] (CAR)", unit: "ft" },
      { id: "INV0000742", label: "EPDM Cover Strip [6\"] (FIR)", unit: "ft" },
      { id: "INV0016974", label: "EPDM Cover Strip [6\"]", unit: "ft" },
      { id: "INV0016975", label: "EPDM Cover Strip [9\"]", unit: "ft" },
      { id: "INV0016973", label: "EPDM Cover Strip [12\"]", unit: "ft" },
      { id: "INV0000109", label: "EPDM P&S Cover Strip [6\"]", unit: "ft" },
      { id: "INV0000110", label: "EPDM P&S Cover Strip [9\"]", unit: "ft" },
      { id: "INV0000111", label: "EPDM P&S Cover Strip [12\"]", unit: "ft" },
      { id: "INV0000114", label: "EPDM P&S RTS [6\"]", unit: "ft" },
      { id: "INV0000115", label: "EPDM Seam Tape [3\"]", unit: "ft" },
      { id: "INV0000116", label: "EPDM Seam Tape [6\"]", unit: "ft" },
      { id: "INV0017010", label: "EPDM SecurTape [3\"]", unit: "ft" },
      { id: "INV0017011", label: "EPDM SecurTape [6\"]", unit: "ft" },
      { id: "INV0017005", label: "EPDM Sure-Seal RUSS [6\"]", unit: "ft" },
      { id: "INV0017006", label: "EPDM Sure-Seal RUSS [9\"]", unit: "ft" },
      { id: "INV0017029", label: "EPDM P&S Walkway", unit: "each" },
      { id: "INV0000107", label: "EPDM P&S Pipe Boot", unit: "each" },
      { id: "INV0017494", label: "EPDM Pipe Boot", unit: "each" },
      { id: "INV0000726", label: "EPDM Prefab Boot", unit: "each" },
      { id: "INV0000106", label: "EPDM P&S Corner", unit: "each" },
      { id: "INV0000739", label: "EPDM Corner Curb Flashing [18\"]", unit: "ft" },
      { id: "INV0000740", label: "EPDM Corner Curb Flashing [24\"]", unit: "ft" },
      { id: "INV0016957", label: "EPDM Sure-Seal Curb Flashing [20\"]", unit: "ft" },
      { id: "INV0000101", label: "EPDM P&S Flashing [6\" x 100ft] (Cured)", unit: "ft" },
      { id: "INV0016967", label: "EPDM P&S Flashing [6\" x 100ft] (Uncured)", unit: "ft" },
      { id: "INV0000104", label: "EPDM P&S Flashing [9\" x 50ft] (Cured)", unit: "ft" },
      { id: "INV0016968", label: "EPDM P&S Flashing [9\" x 50ft] (Uncured)", unit: "ft" },
      { id: "INV0000105", label: "EPDM P&S Flashing [12\" x 50ft] (Cured)", unit: "ft" },
      { id: "INV0016956", label: "EPDM P&S Flashing [12\" x 50ft] (Uncured)", unit: "ft" }
    ]
  },
  {
    name: "Boards",
    items: [
      { id: "INV0001251", label: "OSB - 7/16\" x 8ft", unit: "sheet" },
      { id: "INV0001258", label: "OSB - 3/4\" x 8ft", unit: "sheet" },
      { id: "INV0001253", label: "Board - 2\" x 4\" x 10ft", unit: "each" },
      { id: "INV0001254", label: "Board - 2\" x 6\" x 10ft", unit: "each" },
      { id: "INV0001255", label: "Board - 2\" x 8\" x 10ft", unit: "each" },
      { id: "INV0017066", label: "Lumber - 2\" x 6\" x 10ft", unit: "each" },
      { id: "INV0001256", label: "Board - 2\" x 10\" x 10ft", unit: "each" },
      { id: "INV0001257", label: "Board - 2\" x 12\" x 10ft", unit: "each" },
      { id: "INV0000689", label: "JM Fiberboard - 1/2\"", unit: "square" },
      { id: "INV0000690", label: "JM Fiberboard - 1/2\" - (Coated)", unit: "square" },
      { id: "INV0017067", label: "Plywood - 1/2\" x 8ft", unit: "square" },
      { id: "INV0017068", label: "Plywood - 3/4\" x 8ft", unit: "square" },
      { id: "INV0000304", label: "JM Invinsa Board - 1/4\" x 8ft", unit: "square" },
      { id: "INV0000714", label: "JM ProtectoR HD Cover Board - 1/4\" x 4ft", unit: "square" },
      { id: "INV0000715", label: "JM ProtectoR HD Cover Board - 1/4\" x 8ft", unit: "square" },
      { id: "INV0000691", label: "Securock Board - 1/4\" x 4ft", unit: "square" },
      { id: "INV0000692", label: "Securock Board - 1/4\" x 8ft", unit: "square" },
      { id: "INV0000696", label: "Securock Board - 1/2\" x 8ft", unit: "square" },
      { id: "INV0000702", label: "DensDeck Prime Board - 1/2\" x 8ft", unit: "square" },
      { id: "INV0000704", label: "DensDeck Prime Board - 5/8\" x 8ft", unit: "square" }
      ]
  },
  {
    name:"ISO",
    items: [
      { id: "INV0017061", label: "JM All-Purpose - 1.5\" x 8ft", unit: "square" },
      { id: "INV0000130", label: "JM ISO ENRGY - 3.5\" x 8ft", unit: "square" },
      { id: "INV0000131", label: "JM ISO ENRGY 3 - 1.0\" x 4ft", unit: "square" },
      { id: "INV0000140", label: "JM ISO ENRGY 3 - 1.5\" x 4ft", unit: "square" },
      { id: "INV0000150", label: "JM ISO ENRGY 3 - 2.0\" x 4ft", unit: "square" },
      { id: "INV0000158", label: "JM ISO ENRGY 3 - 2.5\" x 4ft", unit: "square" },
      { id: "INV0000168", label: "JM ISO ENRGY 3 - 3.0\" x 4ft", unit: "square" },
      { id: "INV0000132", label: "JM ISO ENRGY 3 - 1.0\" x 8ft", unit: "square" },
      { id: "INV0000141", label: "JM ISO ENRGY 3 - 1.5\" x 8ft", unit: "square" },
      { id: "INV0000151", label: "JM ISO ENRGY 3 - 2.0\" x 8ft", unit: "square" },
      { id: "INV0000159", label: "JM ISO ENRGY 3 - 2.5\" x 8ft", unit: "square" },
      { id: "INV0000161", label: "JM ISO ENRGY 3 - 2.6\" x 8ft", unit: "square" },
      { id: "INV0000169", label: "JM ISO ENRGY 3 - 3.0\" x 8ft", unit: "square" },
      { id: "INV0001189", label: "JM ISO ENRGY 3 CGF - 2.0\" x 4ft", unit: "square" },
      { id: "INV0001070", label: "JM ISO Tapered - A  (1/8\")  1.0\"- 1.5\"", unit: "sheet" },
      { id: "INV0001069", label: "JM ISO Tapered - AA (1/8\")  0.5\"- 1.0\"", unit: "sheet" },
      { id: "INV0001071", label: "JM ISO Tapered - B  (1/8\")  1.5\"- 2.0\"", unit: "sheet" },
      { id: "INV0001072", label: "JM ISO Tapered - C  (1/8\")  2.0\"- 2.5\"", unit: "sheet" },
      { id: "INV0001079", label: "JM ISO Tapered - Q  (1/2\")  0.5\"- 1.0\"", unit: "sheet" },
      { id: "INV0001076", label: "JM ISO Tapered - X  (1/4\")  0.5\"- 1.5\"", unit: "sheet" },
      { id: "INV0001077", label: "JM ISO Tapered - Y  (1/4\")  1.5\"- 2.5\"", unit: "sheet" },
      { id: "INV0001234", label: "JM ISO Tapered CGF - A  (1/8\")  1.0\"- 1.5\"", unit: "sheet" },
      { id: "INV0001233", label: "JM ISO Tapered CGF - AA (1/8\")  0.5\"- 1.0\"", unit: "sheet" },
      { id: "INV0001235", label: "JM ISO Tapered CGF - B  (1/8\")  1.5\"- 2.0\"", unit: "sheet" },
      { id: "INV0001236", label: "JM ISO Tapered CGF - C  (1/8\")  2.0\"- 2.5\"", unit: "sheet" },
      { id: "INV0001243", label: "JM ISO Tapered CGF - Q  (1/2\")  0.5\"- 1.0\"", unit: "sheet" },
      { id: "INV0001240", label: "JM ISO Tapered CGF - X  (1/4\")  0.5\"- 1.5\"", unit: "sheet" },
      { id: "INV0001241", label: "JM ISO Tapered CGF - Y  (1/4\")  1.5\"- 2.5\"", unit: "sheet" },      
      { id: "INV0001108", label: "Sarnatherm ISO - 2.0\" x 4ft", unit: "square" },
      { id: "INV0001162", label: "SARNAFIL ISO Tapered - Q  (1/2\")  0.5\"- 1.0\"", unit: "sheet" },
      { id: "INV0001159", label: "SARNAFIL ISO Tapered - X  (1/4\")  0.5\"- 1.5\"", unit: "sheet" }   
    ]
  },
  {
    name: "JM Fasteners",
    items: [
      { id: "INV0000459", label: "Galvalume-Coated Plate [2\"]", unit: "each" },
      { id: "INV0000460", label: "Galvalume-Coated Plate [3\"]", unit: "each" },
      { id: "INV0000465", label: "RhinoBond Plate (PVC)", unit: "each" },
      { id: "INV0000464", label: "RhinoBond Plate (TPO)", unit: "each" },
      { id: "INV0000405", label: "AP #14 Phillips [1.25\"]", unit: "each" },
      { id: "INV0000406", label: "AP #14 Phillips [1.75\"]", unit: "each" },
      { id: "INV0000415", label: "AP #14 Phillips [10\"]", unit: "each" },
      { id: "INV0000416", label: "AP #14 Phillips [11\"]", unit: "each" },
      { id: "INV0000417", label: "AP #14 Phillips [12\"]", unit: "each" },
      { id: "INV0000418", label: "AP #14 Phillips [14\"]", unit: "each" },
      { id: "INV0000419", label: "AP #14 Phillips [16\"]", unit: "each" },
      { id: "INV0000420", label: "AP #14 Phillips [18\"]", unit: "each" },
      { id: "INV0000407", label: "AP #14 Phillips [2\"]", unit: "each" },
      { id: "INV0000421", label: "AP #14 Phillips [20\"]", unit: "each" },
      { id: "INV0000422", label: "AP #14 Phillips [22\"]", unit: "each" },
      { id: "INV0000423", label: "AP #14 Phillips [24\"]", unit: "each" },
      { id: "INV0000408", label: "AP #14 Phillips [3\"]", unit: "each" },
      { id: "INV0000409", label: "AP #14 Phillips [4\"]", unit: "each" },
      { id: "INV0000410", label: "AP #14 Phillips [5\"]", unit: "each" },
      { id: "INV0000411", label: "AP #14 Phillips [6\"]", unit: "each" },
      { id: "INV0000412", label: "AP #14 Phillips [7\"]", unit: "each" },
      { id: "INV0000413", label: "AP #14 Phillips [8\"]", unit: "each" },
      { id: "INV0000414", label: "AP #14 Phillips [9\"]", unit: "each" },
      { id: "INV0000369", label: "HL #15 Phillips [1.25\"]", unit: "each" },
      { id: "INV0000371", label: "HL #15 Phillips [3\"]", unit: "each" },
      { id: "INV0000372", label: "HL #15 Phillips [4\"]", unit: "each" },
      { id: "INV0000373", label: "HL #15 Phillips [5\"]", unit: "each" },
      { id: "INV0000374", label: "HL #15 Phillips [6\"]", unit: "each" },
      { id: "INV0000375", label: "HL #15 Phillips [7\"]", unit: "each" },
      { id: "INV0000376", label: "HL #15 Phillips [8\"]", unit: "each" },
      { id: "INV0000377", label: "HL #15 Phillips [9\"]", unit: "each" },
      { id: "INV0000378", label: "HL #15 Phillips [10\"]", unit: "each" },
      { id: "INV0000379", label: "HL #15 Phillips [11\"]", unit: "each" },
      { id: "INV0000380", label: "HL #15 Phillips [12\"]", unit: "each" },
      { id: "INV0000381", label: "HL #15 Phillips [14\"]", unit: "each" },
      { id: "INV0000382", label: "HL #15 Phillips [16\"]", unit: "each" },
      { id: "INV0000383", label: "HL #15 Phillips [18\"]", unit: "each" },
      { id: "INV0000384", label: "HL #15 Phillips [20\"]", unit: "each" },
      { id: "INV0000395", label: "HL #15 Plate [2.375\"]", unit: "each" },
      { id: "INV0000388", label: "XHL #21 Phillips [5\"]", unit: "each" },
      { id: "INV0000332", label: "UF #12 Fastener [5\"]", unit: "each" },
      { id: "INV0000334", label: "UF #12 Fastener [7\"]", unit: "each" },
      { id: "INV0000346", label: "UF #12 Plate [3\"]", unit: "each" }
    ]
  },
  {
    name: "CAR Fasteners",
    items: [
      { id: "INV0016991", label: "HP-X Fastener [2.375\"]", unit: "each" },
      { id: "INV0016992", label: "HP-X Fastener [4\"]", unit: "each" },
      { id: "INV0016993", label: "HP-X Fastener [5\"]", unit: "each" },
      { id: "INV0016996", label: "HP-X Fastener [8\"]", unit: "each" },
      { id: "INV0016979", label: "HP Fastener [1.25\"]", unit: "each" },
      { id: "INV0016983", label: "HP Fastener [2\"]", unit: "each" },
      { id: "INV0016984", label: "HP Fastener [3\"]", unit: "each" },
      { id: "INV0016985", label: "HP Fastener [4\"]", unit: "each" },
      { id: "INV0016986", label: "HP Fastener [5\"]", unit: "each" },
      { id: "INV0016987", label: "HP Fastener [6\"]", unit: "each" },
      { id: "INV0016988", label: "HP Fastener [7\"]", unit: "each" },
      { id: "INV0016989", label: "HP Fastener [8\"]", unit: "each" },
      { id: "INV0016990", label: "HP Fastener [9\"]", unit: "each" },
      { id: "INV0016980", label: "HP Fastener [10\"]", unit: "each" },
      { id: "INV0016981", label: "HP Fastener [11\"]", unit: "each" },
      { id: "INV0016982", label: "HP Fastener [12\"]", unit: "each" }
    ]
  }
];

// Helper function to get human-readable unit labels (plural)
function getPluralLabel(unit) {
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
    "tube": "tube",
  };
  return labels[unit] || unit;
}

// Helper function that chooses singular or plural based on quantity
function getQuantityLabel(unit, qty) {
  // Use singular form for quantity of 1, plural for all others
  if (qty === 1) {
    return getSingularLabel(unit);
  } else {
    return getPluralLabel(unit);
  }
}

module.exports = {
  materialCategories,
  getPluralLabel,  // Changed from getHumanLabel to getPluralLabel
  getSingularLabel,
  getQuantityLabel
};
