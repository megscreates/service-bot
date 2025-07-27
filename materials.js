// Complete categorized materials list from CSV
const materials = [
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
  {
    id: "INV0016998",
    label: "Lap Sealant Tube",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 4
  },
  {
    id: "INV0000614",
    label: "MH Lap Caulk Tube",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 5
  },
  {
    id: "INV0000079",
    label: "JM Lap Caulk Tube",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 6
  },
  {
    id: "INV0000301",
    label: "JM Water Cutoff Mastic Tube",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 7
  },
  {
    id: "INV0000639",
    label: "TRMC Water Cutoff Mastic Sausage",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 8
  },
  {
    id: "INV0000646",
    label: "CL Pourable Sealant Pouch (White)",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 9
  },
  {
    id: "INV0000645",
    label: "CL Pourable Sealant Pouch (Black)",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 10
  },
  {
    id: "INV0000656",
    label: "JM Pourable Sealant Pouch (Grey)",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 11
  },
  {
    id: "INV0017003",
    label: "CAR Pourable Sealant [1gal]",
    unit: "per quart",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 12
  },
  {
    id: "INV0017022",
    label: "CAR TPO Pourable Sealant [1gal]",
    unit: "per quart",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 13
  },
  {
    id: "INV0000638",
    label: "TRMC Dymonic 100 Sausage (White)",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 14
  },
  {
    id: "INV0000618",
    label: "TRMC Dymonic 100 Sausage (Precast White)",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 15
  },
  {
    id: "INV0000637",
    label: "TRMC Dymonic 100 Sausage (Black)",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 16
  },
  {
    id: "INV0017198",
    label: "MH Repair Hero (Black)",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 17
  },
  {
    id: "INV0017451",
    label: "MH Repair Hero (White)",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 18
  },
  {
    id: "INV0000640",
    label: "Karna-Flex Sealant",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 19
  },
  {
    id: "INV0000686",
    label: "GacoPatch",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 20
  },
  {
    id: "INV0017133",
    label: "Uniflex Sealant",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 21
  },
  {
    id: "INV0000074",
    label: "TPO Adhesive Solvent",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 22
  },
  {
    id: "INV0017150",
    label: "KARNAK 169 Coating",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 23
  },
  {
    id: "INV0017132",
    label: "Uniflex Coating",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 24
  },
  {
    id: "INV0017130",
    label: "ALSAN Flashing",
    unit: "per quart",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 25
  },
  {
    id: "INV0000617",
    label: "ALSAN RS 230 FIELD",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 26
  },
  {
    id: "INV0000082",
    label: "TPO Primer",
    unit: "per quart",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 27
  },
  {
    id: "INV0017004",
    label: "LVOC Primer",
    unit: "per quart",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 28
  },
  {
    id: "INV0000307",
    label: "Asphalt Primer",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 29
  },
  {
    id: "INV0000127",
    label: "EPDM Tape Primer",
    unit: "per quart",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 30
  },
  {
    id: "INV0000641",
    label: "Vapor Barrier SA Primer",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 31
  },
  {
    id: "INV0000642",
    label: "Vapor Barrier SA Primer (LVOC)",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 32
  },
  {
    id: "INV0017096",
    label: "Uniflex Seam Tape [2\"]",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 33
  },
  {
    id: "INV0017098",
    label: "Uniflex Seam Tape [4\"]",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 34
  },
  {
    id: "INV0017099",
    label: "Uniflex Seam Tape [6\"]",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 35
  },
  {
    id: "INV0000655",
    label: "Butyl Seam Tape",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 36
  },
  {
    id: "INV0000120",
    label: "EPDM Bonding Cement (LVOC)",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 37
  },
  {
    id: "INV0000119",
    label: "EPDM Bonding Cement (Water Based)",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 38
  },
  {
    id: "INV0000652",
    label: "KARNAK 19 (Summer)",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 39
  },
  {
    id: "INV0000653",
    label: "KARNAK 19 (Winter)",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 40
  },
  {
    id: "INV0017151",
    label: "KARNAK 19 ULTRA (Summer)",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 41
  },
  {
    id: "INV0000654",
    label: "KARNAK 19 ULTRA (Winter)",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 42
  },
  {
    id: "INV0017152",
    label: "KARNAK 19 ULTRA Tube",
    unit: "each",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 43
  },
  {
    id: "INV0000596",
    label: "RML Lucas 6500 Flashing Cement (Black)",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 44
  },
  {
    id: "INV0000595",
    label: "RML Lucas 6500 Flashing Cement (White)",
    unit: "per gal",
    category: "Adhesives, Sealants, Coatings, & Solvents",
    categoryIndex: 45
  },
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
  {
    id: "INV0017066",
    label: "Lumber - 2\" x 6\" x 10ft",
    unit: "each",
    category: "Boards & ISO",
    categoryIndex: 6
  },
  {
    id: "INV0001253",
    label: "Board - 2\" x 4\" x 10ft",
    unit: "each",
    category: "Boards & ISO",
    categoryIndex: 3
  },
  {
    id: "INV0001254",
    label: "Board - 2\" x 6\" x 10ft",
    unit: "each",
    category: "Boards & ISO",
    categoryIndex: 4
  },
  {
    id: "INV0001255",
    label: "Board - 2\" x 8\" x 10ft",
    unit: "each",
    category: "Boards & ISO",
    categoryIndex: 5
  },
  {
    id: "INV0001256",
    label: "Board - 2\" x 10\" x 10ft",
    unit: "each",
    category: "Boards & ISO",
    categoryIndex: 7
  },
  {
    id: "INV0001257",
    label: "Board - 2\" x 12\" x 10ft",
    unit: "each",
    category: "Boards & ISO",
    categoryIndex: 8
  },
  {
    id: "INV0000689",
    label: "JM Fiberboard - 1/2\"",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 9
  },
  {
    id: "INV0000690",
    label: "JM Fiberboard - 1/2\" - (Coated)",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 10
  },
  {
    id: "INV0017067",
    label: "Plywood - 1/2\" x 8ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 11
  },
  {
    id: "INV0017068",
    label: "Plywood - 3/4\" x 8ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 12
  },
  {
    id: "INV0000304",
    label: "JM Invinsa Board - 1/4\" x 8ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 13
  },
  {
    id: "INV0000714",
    label: "JM ProtectoR HD Cover Board - 1/4\" x 4ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 14
  },
  {
    id: "INV0000715",
    label: "JM ProtectoR HD Cover Board - 1/4\" x 8ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 15
  },
  {
    id: "INV0000691",
    label: "Securock Board - 1/4\" x 4ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 16
  },
  {
    id: "INV0000692",
    label: "Securock Board - 1/4\" x 8ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 17
  },
  {
    id: "INV0000696",
    label: "Securock Board - 1/2\" x 8ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 18
  },
  {
    id: "INV0000702",
    label: "DensDeck Prime Board - 1/2\" x 8ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 19
  },
  {
    id: "INV0000704",
    label: "DensDeck Prime Board - 5/8\" x 8ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 20
  },
  {
    id: "INV0017061",
    label: "JM All-Purpose - 1.5\" x 8ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 21
  },
  {
    id: "INV0000130",
    label: "JM ISO ENRGY - 3.5\" x 8ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 22
  },
  {
    id: "INV0000131",
    label: "JM ISO ENRGY 3 - 1.0\" x 4ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 23
  },
  {
    id: "INV0000140",
    label: "JM ISO ENRGY 3 - 1.5\" x 4ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 24
  },
  {
    id: "INV0000150",
    label: "JM ISO ENRGY 3 - 2.0\" x 4ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 25
  },
  {
    id: "INV0000158",
    label: "JM ISO ENRGY 3 - 2.5\" x 4ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 26
  },
  {
    id: "INV0000168",
    label: "JM ISO ENRGY 3 - 3.0\" x 4ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 27
  },
  {
    id: "INV0000132",
    label: "JM ISO ENRGY 3 - 1.0\" x 8ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 28
  },
  {
    id: "INV0000141",
    label: "JM ISO ENRGY 3 - 1.5\" x 8ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 29
  },
  {
    id: "INV0000151",
    label: "JM ISO ENRGY 3 - 2.0\" x 8ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 30
  },
  {
    id: "INV0000159",
    label: "JM ISO ENRGY 3 - 2.5\" x 8ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 31
  },
  {
    id: "INV0000161",
    label: "JM ISO ENRGY 3 - 2.6\" x 8ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 32
  },
  {
    id: "INV0000169",
    label: "JM ISO ENRGY 3 - 3.0\" x 8ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 33
  },
  {
    id: "INV0001189",
    label: "JM ISO ENRGY 3 CGF - 2.0\" x 4ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 34
  },
  {
    id: "INV0001070",
    label: "JM ISO Tapered - A  (1/8\")  1.0\"- 1.5\"",
    unit: "per sheet",
    category: "Boards & ISO",
    categoryIndex: 35
  },
  {
    id: "INV0001069",
    label: "JM ISO Tapered - AA (1/8\")  0.5\"- 1.0\"",
    unit: "per sheet",
    category: "Boards & ISO",
    categoryIndex: 36
  },
  {
    id: "INV0001071",
    label: "JM ISO Tapered - B  (1/8\")  1.5\"- 2.0\"",
    unit: "per sheet",
    category: "Boards & ISO",
    categoryIndex: 37
  },
  {
    id: "INV0001072",
    label: "JM ISO Tapered - C  (1/8\")  2.0\"- 2.5\"",
    unit: "per sheet",
    category: "Boards & ISO",
    categoryIndex: 38
  },
  {
    id: "INV0001079",
    label: "JM ISO Tapered - Q  (1/2\")  0.5\"- 1.0\"",
    unit: "per sheet",
    category: "Boards & ISO",
    categoryIndex: 39
  },
  {
    id: "INV0001076",
    label: "JM ISO Tapered - X  (1/4\")  0.5\"- 1.5\"",
    unit: "per sheet",
    category: "Boards & ISO",
    categoryIndex: 40
  },
  {
    id: "INV0001077",
    label: "JM ISO Tapered - Y  (1/4\")  1.5\"- 2.5\"",
    unit: "per sheet",
    category: "Boards & ISO",
    categoryIndex: 41
  },
  {
    id: "INV0001234",
    label: "JM ISO Tapered CGF - A  (1/8\")  1.0\"- 1.5\"",
    unit: "per sheet",
    category: "Boards & ISO",
    categoryIndex: 42
  },
  {
    id: "INV0001233",
    label: "JM ISO Tapered CGF - AA (1/8\")  0.5\"- 1.0\"",
    unit: "per sheet",
    category: "Boards & ISO",
    categoryIndex: 43
  },
  {
    id: "INV0001235",
    label: "JM ISO Tapered CGF - B  (1/8\")  1.5\"- 2.0\"",
    unit: "per sheet",
    category: "Boards & ISO",
    categoryIndex: 44
  },
  {
    id: "INV0001236",
    label: "JM ISO Tapered CGF - C  (1/8\")  2.0\"- 2.5\"",
    unit: "per sheet",
    category: "Boards & ISO",
    categoryIndex: 45
  },
  {
    id: "INV0001243",
    label: "JM ISO Tapered CGF - Q  (1/2\")  0.5\"- 1.0\"",
    unit: "per sheet",
    category: "Boards & ISO",
    categoryIndex: 46
  },
  {
    id: "INV0001240",
    label: "JM ISO Tapered CGF - X  (1/4\")  0.5\"- 1.5\"",
    unit: "per sheet",
    category: "Boards & ISO",
    categoryIndex: 47
  },
  {
    id: "INV0001241",
    label: "JM ISO Tapered CGF - Y  (1/4\")  1.5\"- 2.5\"",
    unit: "per sheet",
    category: "Boards & ISO",
    categoryIndex: 48
  },
  {
    id: "INV0001108",
    label: "Sarnatherm ISO - 2.0\" x 4ft",
    unit: "per square",
    category: "Boards & ISO",
    categoryIndex: 49
  },
  {
    id: "INV0001162",
    label: "SARNAFIL ISO Tapered - Q  (1/2\")  0.5\"- 1.0\"",
    unit: "per sheet",
    category: "Boards & ISO",
    categoryIndex: 50
  },
  {
    id: "INV0001159",
    label: "SARNAFIL ISO Tapered - X  (1/4\")  0.5\"- 1.5\"",
    unit: "per sheet",
    category: "Boards & ISO",
    categoryIndex: 51
  },
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
  {
    id: "INV0016965",
    label: "EPDM R 60MIL [10ft x 100ft]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 3
  },
  {
    id: "INV0000091",
    label: "EPDM NR 60MIL [10ft x 50ft]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 4
  },
  {
    id: "INV0016966",
    label: "EPDM NR 60MIL [20ft x 100ft] (CAR)",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 5
  },
  {
    id: "INV0000742",
    label: "EPDM Cover Strip [6\"] (FIR)",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 6
  },
  {
    id: "INV0016974",
    label: "EPDM Cover Strip [6\"]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 7
  },
  {
    id: "INV0016975",
    label: "EPDM Cover Strip [9\"]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 8
  },
  {
    id: "INV0016973",
    label: "EPDM Cover Strip [12\"]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 9
  },
  {
    id: "INV0000109",
    label: "EPDM P&S Cover Strip [6\"]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 10
  },
  {
    id: "INV0000110",
    label: "EPDM P&S Cover Strip [9\"]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 11
  },
  {
    id: "INV0000111",
    label: "EPDM P&S Cover Strip [12\"]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 12
  },
  {
    id: "INV0000114",
    label: "EPDM P&S RTS [6\"]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 13
  },
  {
    id: "INV0000115",
    label: "EPDM Seam Tape [3\"]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 14
  },
  {
    id: "INV0000116",
    label: "EPDM Seam Tape [6\"]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 15
  },
  {
    id: "INV0017010",
    label: "EPDM SecurTape [3\"]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 16
  },
  {
    id: "INV0017011",
    label: "EPDM SecurTape [6\"]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 17
  },
  {
    id: "INV0017005",
    label: "EPDM Sure-Seal RUSS [6\"]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 18
  },
  {
    id: "INV0017006",
    label: "EPDM Sure-Seal RUSS [9\"]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 19
  },
  {
    id: "INV0017029",
    label: "EPDM P&S Walkway",
    unit: "each",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 20
  },
  {
    id: "INV0000107",
    label: "EPDM P&S Pipe Boot",
    unit: "each",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 21
  },
  {
    id: "INV0017494",
    label: "EPDM Pipe Boot",
    unit: "each",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 22
  },
  {
    id: "INV0000726",
    label: "EPDM Prefab Boot",
    unit: "each",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 23
  },
  {
    id: "INV0000106",
    label: "EPDM P&S Corner",
    unit: "each",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 24
  },
  {
    id: "INV0000739",
    label: "EPDM Corner Curb Flashing [18\"]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 25
  },
  {
    id: "INV0000740",
    label: "EPDM Corner Curb Flashing [24\"]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 26
  },
  {
    id: "INV0016957",
    label: "EPDM Sure-Seal Curb Flashing [20\"]",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 27
  },
  {
    id: "INV0000101",
    label: "EPDM P&S Flashing [6\" x 100ft] (Cured)",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 28
  },
  {
    id: "INV0016967",
    label: "EPDM P&S Flashing [6\" x 100ft] (Uncured)",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 29
  },
  {
    id: "INV0000104",
    label: "EPDM P&S Flashing [9\" x 50ft] (Cured)",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 30
  },
  {
    id: "INV0016968",
    label: "EPDM P&S Flashing [9\" x 50ft] (Uncured)",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 31
  },
  {
    id: "INV0000105",
    label: "EPDM P&S Flashing [12\" x 50ft] (Cured)",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 32
  },
  {
    id: "INV0016956",
    label: "EPDM P&S Flashing [12\" x 50ft] (Uncured)",
    unit: "per linear ft",
    category: "EPDM Membrane, Tape, & Flashing Details",
    categoryIndex: 33
  },
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
  {
    id: "INV0000465",
    label: "RhinoBond Plate (PVC)",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 3
  },
  {
    id: "INV0000464",
    label: "RhinoBond Plate (TPO)",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 4
  },
  {
    id: "INV0000405",
    label: "AP #14 Phillips [1.25\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 5
  },
  {
    id: "INV0000406",
    label: "AP #14 Phillips [1.75\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 6
  },
  {
    id: "INV0000415",
    label: "AP #14 Phillips [10\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 7
  },
  {
    id: "INV0000416",
    label: "AP #14 Phillips [11\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 8
  },
  {
    id: "INV0000417",
    label: "AP #14 Phillips [12\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 9
  },
  {
    id: "INV0000418",
    label: "AP #14 Phillips [14\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 10
  },
  {
    id: "INV0000419",
    label: "AP #14 Phillips [16\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 11
  },
  {
    id: "INV0000420",
    label: "AP #14 Phillips [18\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 12
  },
  {
    id: "INV0000407",
    label: "AP #14 Phillips [2\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 13
  },
  {
    id: "INV0000421",
    label: "AP #14 Phillips [20\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 14
  },
  {
    id: "INV0000422",
    label: "AP #14 Phillips [22\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 15
  },
  {
    id: "INV0000423",
    label: "AP #14 Phillips [24\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 16
  },
  {
    id: "INV0000408",
    label: "AP #14 Phillips [3\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 17
  },
  {
    id: "INV0000409",
    label: "AP #14 Phillips [4\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 18
  },
  {
    id: "INV0000410",
    label: "AP #14 Phillips [5\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 19
  },
  {
    id: "INV0000411",
    label: "AP #14 Phillips [6\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 20
  },
  {
    id: "INV0000412",
    label: "AP #14 Phillips [7\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 21
  },
  {
    id: "INV0000413",
    label: "AP #14 Phillips [8\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 22
  },
  {
    id: "INV0000414",
    label: "AP #14 Phillips [9\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 23
  },
  {
    id: "INV0000369",
    label: "HL #15 Phillips [1.25\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 24
  },
  {
    id: "INV0000378",
    label: "HL #15 Phillips [10\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 25
  },
  {
    id: "INV0000379",
    label: "HL #15 Phillips [11\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 26
  },
  {
    id: "INV0000380",
    label: "HL #15 Phillips [12\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 27
  },
  {
    id: "INV0000381",
    label: "HL #15 Phillips [14\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 28
  },
  {
    id: "INV0000382",
    label: "HL #15 Phillips [16\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 29
  },
  {
    id: "INV0000383",
    label: "HL #15 Phillips [18\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 30
  },
  {
    id: "INV0000384",
    label: "HL #15 Phillips [20\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 31
  },
  {
    id: "INV0000371",
    label: "HL #15 Phillips [3\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 32
  },
  {
    id: "INV0000372",
    label: "HL #15 Phillips [4\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 33
  },
  {
    id: "INV0000373",
    label: "HL #15 Phillips [5\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 34
  },
  {
    id: "INV0000374",
    label: "HL #15 Phillips [6\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 35
  },
  {
    id: "INV0000375",
    label: "HL #15 Phillips [7\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 36
  },
  {
    id: "INV0000376",
    label: "HL #15 Phillips [8\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 37
  },
  {
    id: "INV0000377",
    label: "HL #15 Phillips [9\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 38
  },
  {
    id: "INV0000395",
    label: "HL #15 Plate [2.375\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 39
  },
  {
    id: "INV0000388",
    label: "XHL #21 Phillips [5\" Fastener]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 40
  },
  {
    id: "INV0000396",
    label: "XHL #21 Plate [3\" Fastener]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 41
  },
  {
    id: "INV0000346",
    label: "UF #12 [3\" Plate]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 45
  },
  {
    id: "INV0000332",
    label: "UF #12 [5\" Fastener]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 46
  },
  {
    id: "INV0000334",
    label: "UF #12 [7\" Fastener]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 47
  },
  {
    id: "INV0016991",
    label: "HP-X Fastener [2.375\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 48
  },
  {
    id: "INV0016992",
    label: "HP-X Fastener [4\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 49
  },
  {
    id: "INV0016993",
    label: "HP-X Fastener [5\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 50
  },
  {
    id: "INV0016996",
    label: "HP-X Fastener [8\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 51
  },
  {
    id: "INV0016979",
    label: "HP Fastener [1.25\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 52
  },
  {
    id: "INV0016980",
    label: "HP Fastener [10\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 53
  },
  {
    id: "INV0016981",
    label: "HP Fastener [11\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 54
  },
  {
    id: "INV0016982",
    label: "HP Fastener [12\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 55
  },
  {
    id: "INV0016983",
    label: "HP Fastener [2\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 56
  },
  {
    id: "INV0016984",
    label: "HP Fastener [3\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 57
  },
  {
    id: "INV0016985",
    label: "HP Fastener [4\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 58
  },
  {
    id: "INV0016986",
    label: "HP Fastener [5\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 59
  },
  {
    id: "INV0016987",
    label: "HP Fastener [6\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 60
  },
  {
    id: "INV0016988",
    label: "HP Fastener [7\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 61
  },
  {
    id: "INV0016989",
    label: "HP Fastener [8\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 62
  },
  {
    id: "INV0016990",
    label: "HP Fastener [9\"]",
    unit: "each",
    category: "Fasteners",
    categoryIndex: 63
  },
  {
    id: "INV0000612",
    label: "409 Cleaner",
    unit: "per gal",
    category: "Everyday Basics",
    categoryIndex: 6
  },
  {
    id: "INV0016999",
    label: "CAR Weathered Mem Cleaner",
    unit: "per gal",
    category: "Everyday Basics",
    categoryIndex: 9
  },
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
  {
    id: "INV0017228",
    label: "Chip Brush",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 4
  },
  {
    id: "INV0017414",
    label: "Masking Tape",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 5
  },
  {
    id: "INV0011449",
    label: "Roller Cover",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 10
  },
  {
    id: "INV0011450",
    label: "Roller Frame",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 11
  },
  {
    id: "INV0017372",
    label: "Spray Foam Can",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 12
  },
  {
    id: "INV0017123",
    label: "Mesh [4\" x 50ft]",
    unit: "per linear ft",
    category: "Everyday Basics",
    categoryIndex: 13
  },
  {
    id: "INV0017121",
    label: "Mesh [6\" x 50ft]",
    unit: "per linear ft",
    category: "Everyday Basics",
    categoryIndex: 14
  },
  {
    id: "INV0017124",
    label: "Mesh [6\" x 100ft]",
    unit: "per linear ft",
    category: "Everyday Basics",
    categoryIndex: 15
  },
  {
    id: "INV0017122",
    label: "Mesh [12\" x 100ft]",
    unit: "per linear ft",
    category: "Everyday Basics",
    categoryIndex: 16
  },
  {
    id: "INV0000777",
    label: "Clamp [1\"- 3\"]",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 17
  },
  {
    id: "INV0000778",
    label: "Clamp [3\"- 6\"]",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 18
  },
  {
    id: "INV0000779",
    label: "Clamp [6\"- 12\"]",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 19
  },
  {
    id: "INV0017373",
    label: "Reciprocating Saw (Metal)",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 20
  },
  {
    id: "INV0017374",
    label: "Reciprocating Saw (Wood)",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 21
  },
  {
    id: "INV0000461",
    label: "Termination Bar",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 22
  },
  {
    id: "INV0017139",
    label: "Coil Nail",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 23
  },
  {
    id: "INV0000781",
    label: "Metal to Metal Screw",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 24
  },
  {
    id: "INV0000782",
    label: "Metal to Wood Screw",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 25
  },
  {
    id: "INV0017002",
    label: "Seam Plate",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 26
  },
  {
    id: "INV0017493",
    label: "SecurFast Insulation Plate",
    unit: "each",
    category: "Everyday Basics",
    categoryIndex: 27
  },
  {
    id: "INV0000688",
    label: "Visqueen Plastic Sheeting",
    unit: "per linear ft",
    category: "Everyday Basics",
    categoryIndex: 28
  },
  {
    id: "INV0017227",
    label: "MEK Cleaner",
    unit: "per quart",
    category: "Everyday Basics",
    categoryIndex: 7
  },
  {
    id: "INV0000685",
    label: "MH Weathered Mem Cleaner",
    unit: "per quart",
    category: "Everyday Basics",
    categoryIndex: 8
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
