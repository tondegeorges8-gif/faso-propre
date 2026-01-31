// All provinces of Burkina Faso organized by region
export const BURKINA_FASO_REGIONS = {
  "Boucle du Mouhoun": [
    "Banwa", "Kossi", "Mouhoun", "Nayala", "Sourou", "Balé"
  ],
  "Cascades": [
    "Comoé", "Léraba"
  ],
  "Centre": [
    "Kadiogo"
  ],
  "Centre-Est": [
    "Boulgou", "Koulpélogo", "Kouritenga"
  ],
  "Centre-Nord": [
    "Bam", "Namentenga", "Sanmatenga"
  ],
  "Centre-Ouest": [
    "Boulkiemdé", "Sanguié", "Sissili", "Ziro"
  ],
  "Centre-Sud": [
    "Bazèga", "Nahouri", "Zoundwéogo"
  ],
  "Est": [
    "Gnagna", "Gourma", "Komandjoari", "Kompienga", "Tapoa"
  ],
  "Hauts-Bassins": [
    "Houet", "Kénédougou", "Tuy"
  ],
  "Nord": [
    "Loroum", "Passoré", "Yatenga", "Zondoma"
  ],
  "Plateau-Central": [
    "Ganzourgou", "Kourwéogo", "Oubritenga"
  ],
  "Sahel": [
    "Oudalan", "Séno", "Soum", "Yagha"
  ],
  "Sud-Ouest": [
    "Bougouriba", "Ioba", "Noumbiel", "Poni"
  ]
};

// Flatten all provinces into a single sorted list
export const ALL_PROVINCES = Object.values(BURKINA_FASO_REGIONS)
  .flat()
  .sort((a, b) => a.localeCompare(b, 'fr'));

// Major cities of Burkina Faso
export const MAJOR_CITIES = [
  "Ouagadougou",
  "Bobo-Dioulasso",
  "Koudougou",
  "Ouahigouya",
  "Banfora",
  "Dédougou",
  "Kaya",
  "Tenkodogo",
  "Fada N'Gourma",
  "Dori",
  "Ziniaré",
  "Manga",
  "Gaoua",
  "Djibo",
  "Kongoussi",
  "Réo",
  "Léo",
  "Titao",
  "Yako",
  "Pouytenga"
].sort((a, b) => a.localeCompare(b, 'fr'));

// Common neighborhoods (can be extended)
export const COMMON_NEIGHBORHOODS = [
  "Centre-ville",
  "Zone commerciale",
  "Zone résidentielle",
  "Zone industrielle",
  "Périphérie",
  "Quartier administratif"
];

// Report categories with emergency numbers and subcategories
export const REPORT_CATEGORIES = {
  "ONEA": {
    name: "ONEA (Eaux)",
    phone: "80 00 11 11",
    icon: "💧",
    color: "hsl(200, 80%, 50%)",
    subcategories: [
      "Fuite d'eau",
      "Tuyau percé",
      "Compteur défectueux",
      "Manque de pression",
      "Eau insalubre",
      "Raccordement frauduleux"
    ]
  },
  "SONABEL": {
    name: "SONABEL (Électricité)",
    phone: "80 00 11 30",
    icon: "⚡",
    color: "hsl(45, 100%, 50%)",
    subcategories: [
      "Câble sectionné",
      "Poteau incliné",
      "Transformateur bruyant/fume",
      "Éclairage en panne",
      "Compteur en feu",
      "Coupure localisée"
    ]
  },
  "BRIGADE_VERTE": {
    name: "Brigade Verte (Nettoyage)",
    phone: "25 31 18 36",
    icon: "🌿",
    color: "hsl(120, 60%, 40%)",
    subcategories: [
      "Dépôt sauvage",
      "Poubelle pleine",
      "Brûlage de déchets",
      "Canalisation d'eaux usées sauvage"
    ]
  },
  "POLICE_MUNICIPALE": {
    name: "Police Municipale (Mairie)",
    phone: "80 00 11 03",
    icon: "🚔",
    color: "hsl(220, 70%, 50%)",
    subcategories: [
      "Animaux errants",
      "Occupation illégale de la voie",
      "Nuisance sonore",
      "Mendicité agressive"
    ]
  },
  "VOIRIE": {
    name: "Voirie",
    phone: "N/A",
    icon: "🛣️",
    color: "hsl(30, 60%, 50%)",
    subcategories: [
      "Nids de poule",
      "Caniveau bouché",
      "Feu tricolore en panne",
      "Panneau tombé",
      "Pont endommagé"
    ]
  }
};

// Report statuses
export const REPORT_STATUSES = {
  PENDING: {
    label: "En attente",
    color: "status-pending",
    emoji: "🔵"
  },
  IN_PROGRESS: {
    label: "En cours",
    color: "status-progress",
    emoji: "🟠"
  },
  RESOLVED: {
    label: "Résolu",
    color: "status-resolved",
    emoji: "🟢"
  },
  REJECTED: {
    label: "Rejeté",
    color: "status-rejected",
    emoji: "🔴"
  }
};

export type ReportStatus = keyof typeof REPORT_STATUSES;
export type ReportCategory = keyof typeof REPORT_CATEGORIES;
