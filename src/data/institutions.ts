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
    nom: "ONEA",
    options: [
      "Fuite de tuyau",
      "Coupure d'eau",
      "Compteur défaillant",
      "Réclamation facture",
      "Qualité de l'eau"
    ],
    couleur: "#0056b3",
    phone: "80 00 11 11",
    icon: "💧"
  },
  SONABEL: {
    id: "SONABEL",
    nom: "SONABEL",
    options: [
      "Coupure d'électricité",
      "Poteau électrique tombé",
      "Étincelles transformateur",
      "Éclairage public HS",
      "Problème compteur prépayé"
    ],
    couleur: "#ffcc00",
    phone: "80 00 11 30",
    icon: "⚡"
  },
  ONASER: {
    id: "ONASER",
    nom: "ONASER",
    options: [
      "Feu tricolore en panne",
      "Panneau de signalisation manquant",
      "Excès de vitesse zone école",
      "Obstacle sur la chaussée"
    ],
    couleur: "#28a745",
    phone: "25 30 67 10",
    icon: "🚦"
  },
  ANASUR: {
    id: "ANASUR",
    nom: "ANASUR",
    options: [
      "Bac à ordure débordé",
      "Dépôt de déchets sauvage",
      "Animal mort sur la voie",
      "Nettoyage rue nécessaire"
    ],
    couleur: "#17a2b8",
    phone: "25 31 18 36",
    icon: "🌿"
  },
  LABO_NAT: {
    id: "LABO_NAT",
    nom: "Laboratoire National",
    options: [
      "Dégradation bitume (Nid de poule)",
      "Affaissement d'ouvrage",
      "Fissure pont",
      "Contrôle qualité chantier"
    ],
    couleur: "#6c757d",
    phone: "25 30 71 72",
    icon: "🔬"
  },
  POLICE_MUN: {
    id: "POLICE_MUN",
    nom: "Police Municipale",
    options: [
      "Nuisance sonore",
      "Occupation illégale du domaine public",
      "Stationnement gênant",
      "Divagation d'animaux"
    ],
    couleur: "#343a40",
    phone: "80 00 11 03",
    icon: "🚔"
  },
  VOIRIE: {
    id: "VOIRIE",
    nom: "Voirie / Mairie",
    options: [
      "Caniveau bouché",
      "Inondation de voie",
      "Demande d'élagage",
      "Feux de brousse urbain"
    ],
    couleur: "#fd7e14",
    phone: "25 30 62 00",
    icon: "🛣️"
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
