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
    name: "ONEA - Eau",
    phone: "80 00 11 11",
    icon: "💧",
    color: "hsl(210, 100%, 35%)",
    subcategories: [
      "Coupure d'eau excessive",
      "Manque de pression d'eau",
      "Qualité de l'eau : trouble, odeur, couleur anormale",
      "Compteur défaillant / cassé",
      "Fuite d'eau sur la voie publique",
      "Fuite d'eau avant compteur",
      "Branchement illégal",
      "Facturation anormale"
    ]
  },
  "SONABEL": {
    name: "SONABEL - Électricité",
    phone: "80 00 11 30",
    icon: "⚡",
    color: "hsl(45, 100%, 50%)",
    subcategories: [
      "Coupure d'électricité excessive",
      "Baisse de tension",
      "Surtension",
      "Câble électrique sectionné au sol",
      "Poteau électrique incliné / tombé / dangereux",
      "Éclairage public éteint la nuit",
      "Poteau électrique en feu / étincelles",
      "Compteur électrique en feu / qui crépite",
      "Transformateur défaillant / bruit anormal",
      "Branchement illégal"
    ]
  },
  "ONASER": {
    name: "ONASER - Routes et Signalisation",
    phone: "25 30 67 10",
    icon: "🚦",
    color: "hsl(140, 60%, 40%)",
    subcategories: [
      "Panneau de signalisation tombé / incliné",
      "Panneau caché par la végétation",
      "Feu tricolore ne s'allume pas",
      "Feu tricolore tombé / incliné",
      "Nids de poule dangereux",
      "Vitesse excessive : besoin de ralentisseur",
      "Marquage au sol effacé / inexistant",
      "Route dégradée / trou béant",
      "Pont / Dalot bouché",
      "Débris sur la chaussée"
    ]
  },
  "ANASUR": {
    name: "UNASER - Environnement",
    phone: "25 31 18 36",
    icon: "🌿",
    color: "hsl(180, 70%, 40%)",
    subcategories: [
      "Abattage illégal d'arbres",
      "Espace vert non entretenu / transformé en dépotoir",
      "Feu de brousse",
      "Pollution de l'air : fumée d'usine / poussière",
      "Dégradation de parc / jardin public",
      "Déversement de produits chimiques dans la nature",
      "Braconnage"
    ]
  },
  "POLICE_MUN": {
    name: "Police Municipale / Police Nationale",
    phone: "80 00 11 03",
    icon: "👮",
    color: "hsl(220, 10%, 25%)",
    subcategories: [
      "Nuisance sonore : bar, maquis, atelier, mosquée, église",
      "Occupation illégale de la voie publique",
      "Occupation illégale du domaine public",
      "Voiture garée empêchant la circulation",
      "Animaux errants dangereux",
      "Jet illégal d'eaux usées dans les quartiers",
      "Vente à la sauvette sur la voie",
      "Trouble à l'ordre public / bagarre",
      "Vente d'alcool aux mineurs"
    ]
  },
  "VOIRIE": {
    name: "Service de Nettoyage / Voirie",
    phone: "25 30 62 00",
    icon: "🧹",
    color: "hsl(25, 90%, 55%)",
    subcategories: [
      "Dépôt d'ordure sauvage",
      "Poubelle publique pleine / déborde",
      "Mauvaise odeur : poubelle non ramassée",
      "Camion de ramassage ne passe pas",
      "Caniveau bouché par les ordures",
      "Balayage des rues non fait",
      "Déchets biomédicaux jetés n'importe où"
    ]
  },
  "LABO_NAT": {
    name: "Laboratoire National / Santé Publique",
    phone: "25 30 71 72",
    icon: "🔬",
    color: "hsl(210, 5%, 50%)",
    subcategories: [
      "Produits de consommation périmés",
      "Produit / nourriture empoisonné / toxique",
      "Vente de médicaments illicites / contrefaits",
      "Restaurant avec conditions d'hygiène douteuses",
      "Eau de forage contaminée",
      "Abattoir avec conditions d'hygiène douteuses"
    ]
  },
  "MAIRIE": {
    name: "Mairie / Arrondissement",
    phone: "N/A",
    icon: "🏛️",
    color: "hsl(25, 30%, 40%)",
    subcategories: [
      "Problème d'acte de naissance / état civil",
      "Marché : mauvaise gestion / insalubrité",
      "Éclairage public dans le quartier défaillant",
      "Autorisation de construction illégale",
      "Terrain occupé illégalement",
      "Écoulement d'eaux usées dans le quartier",
      "Terrain vague non clôturé / dangereux"
    ]
  },
  "SANTE": {
    name: "Service Sanitaire / CSPS / Hôpitaux",
    phone: "N/A",
    icon: "🏥",
    color: "hsl(350, 80%, 50%)",
    subcategories: [
      "Manque de médicaments au CSPS",
      "Personnel de santé absent",
      "Hygiène dans le centre de santé défaillante",
      "Manque d'eau au centre de santé",
      "Cas suspect de maladie : choléra, dengue, rougeole",
      "Matériel médical défaillant"
    ]
  },
  "ARCEP": {
    name: "ARCEP - Télécommunications",
    phone: "N/A",
    icon: "📞",
    color: "hsl(260, 50%, 55%)",
    subcategories: [
      "Réseau téléphonique mauvais / inexistant",
      "Coupure internet fréquente",
      "Antenne relais dangereuse"
    ]
  },
  "MENAPLN": {
    name: "MENAPLN - Éducation",
    phone: "N/A",
    icon: "🎓",
    color: "hsl(210, 100%, 50%)",
    subcategories: [
      "École sans table-banc",
      "Toit de salle de classe arraché",
      "Manque d'eau / latrines à l'école",
      "Enseignant absent"
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
