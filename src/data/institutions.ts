// Institutions et options de signalement pour le Burkina Faso

export interface Institution {
  id: string;
  nom: string;
  options: string[];
  couleur: string;
  phone: string;
  icon: string;
}

export const INSTITUTIONS: Record<string, Institution> = {
  ONEA: {
    id: "ONEA",
    nom: "ONEA - Eau",
    options: [
      "Coupure d'eau excessive",
      "Manque de pression d'eau",
      "Qualité de l'eau : trouble, odeur, couleur anormale",
      "Compteur défaillant / cassé",
      "Fuite d'eau sur la voie publique",
      "Fuite d'eau avant compteur",
      "Branchement illégal",
      "Facturation anormale"
    ],
    couleur: "#0056b3",
    phone: "80 00 11 11",
    icon: "💧"
  },
  SONABEL: {
    id: "SONABEL",
    nom: "SONABEL - Électricité",
    options: [
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
    ],
    couleur: "#ffcc00",
    phone: "80 00 11 30",
    icon: "⚡"
  },
  ONASER: {
    id: "ONASER",
    nom: "ONASER - Routes et Signalisation",
    options: [
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
    ],
    couleur: "#28a745",
    phone: "25 30 67 10",
    icon: "🚦"
  },
  ANASUR: {
    id: "ANASUR",
    nom: "UNASER - Environnement",
    options: [
      "Abattage illégal d'arbres",
      "Espace vert non entretenu / transformé en dépotoir",
      "Feu de brousse",
      "Pollution de l'air : fumée d'usine / poussière",
      "Dégradation de parc / jardin public",
      "Déversement de produits chimiques dans la nature",
      "Braconnage"
    ],
    couleur: "#17a2b8",
    phone: "25 31 18 36",
    icon: "🌿"
  },
  POLICE_MUN: {
    id: "POLICE_MUN",
    nom: "Police Municipale / Police Nationale",
    options: [
      "Nuisance sonore : bar, maquis, atelier, mosquée, église",
      "Occupation illégale de la voie publique",
      "Occupation illégale du domaine public",
      "Voiture garée empêchant la circulation",
      "Animaux errants dangereux",
      "Jet illégal d'eaux usées dans les quartiers",
      "Vente à la sauvette sur la voie",
      "Trouble à l'ordre public / bagarre",
      "Vente d'alcool aux mineurs"
    ],
    couleur: "#343a40",
    phone: "80 00 11 03",
    icon: "👮"
  },
  VOIRIE: {
    id: "VOIRIE",
    nom: "Service de Nettoyage / Voirie",
    options: [
      "Dépôt d'ordure sauvage",
      "Poubelle publique pleine / déborde",
      "Mauvaise odeur : poubelle non ramassée",
      "Camion de ramassage ne passe pas",
      "Caniveau bouché par les ordures",
      "Balayage des rues non fait",
      "Déchets biomédicaux jetés n'importe où"
    ],
    couleur: "#fd7e14",
    phone: "25 30 62 00",
    icon: "🧹"
  },
  LABO_NAT: {
    id: "LABO_NAT",
    nom: "Laboratoire National / Santé Publique",
    options: [
      "Produits de consommation périmés",
      "Produit / nourriture empoisonné / toxique",
      "Vente de médicaments illicites / contrefaits",
      "Restaurant avec conditions d'hygiène douteuses",
      "Eau de forage contaminée",
      "Abattoir avec conditions d'hygiène douteuses"
    ],
    couleur: "#6c757d",
    phone: "25 30 71 72",
    icon: "🔬"
  },
  MAIRIE: {
    id: "MAIRIE",
    nom: "Mairie / Arrondissement",
    options: [
      "Problème d'acte de naissance / état civil",
      "Marché : mauvaise gestion / insalubrité",
      "Éclairage public dans le quartier défaillant",
      "Autorisation de construction illégale",
      "Terrain occupé illégalement",
      "Écoulement d'eaux usées dans le quartier",
      "Terrain vague non clôturé / dangereux"
    ],
    couleur: "#795548",
    phone: "N/A",
    icon: "🏛️"
  },
  SANTE: {
    id: "SANTE",
    nom: "Service Sanitaire / CSPS / Hôpitaux",
    options: [
      "Manque de médicaments au CSPS",
      "Personnel de santé absent",
      "Hygiène dans le centre de santé défaillante",
      "Manque d'eau au centre de santé",
      "Cas suspect de maladie : choléra, dengue, rougeole",
      "Matériel médical défaillant"
    ],
    couleur: "#dc3545",
    phone: "N/A",
    icon: "🏥"
  },
  ARCEP: {
    id: "ARCEP",
    nom: "ARCEP - Télécommunications",
    options: [
      "Réseau téléphonique mauvais / inexistant",
      "Coupure internet fréquente",
      "Antenne relais dangereuse"
    ],
    couleur: "#6f42c1",
    phone: "N/A",
    icon: "📞"
  },
  MENAPLN: {
    id: "MENAPLN",
    nom: "MENAPLN - Éducation",
    options: [
      "École sans table-banc",
      "Toit de salle de classe arraché",
      "Manque d'eau / latrines à l'école",
      "Enseignant absent"
    ],
    couleur: "#007bff",
    phone: "N/A",
    icon: "🎓"
  }
};

// Export as array for iteration
export const INSTITUTIONS_LIST = Object.values(INSTITUTIONS);

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
export type InstitutionId = keyof typeof INSTITUTIONS;
