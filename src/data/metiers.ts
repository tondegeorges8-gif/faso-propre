// Corps de métier de l'annuaire des prestataires
export interface Metier {
  id: string;
  name: string;
  icon: string;
  description: string;
  categorie: string;
}

export interface MetierCategorie {
  id: string;
  name: string;
  icon: string;
}

export const CATEGORIES_METIERS: MetierCategorie[] = [
  { id: 'BATIMENT', name: 'Bâtiment & artisanat', icon: '🏗️' },
  { id: 'DOMICILE', name: 'Services à domicile', icon: '🏠' },
  { id: 'TECH_ENERGIE', name: 'Technologie, équipements & énergie solaire', icon: '⚡' },
  { id: 'LOGISTIQUE', name: 'Logistique, transport & déménagement', icon: '🚚' },
];

export const METIERS: Metier[] = [
  // Bâtiment & artisanat
  { id: 'ELECTRICIEN', name: 'Électriciens', icon: '💡', description: 'Installation et dépannage électrique', categorie: 'BATIMENT' },
  { id: 'MECANICIEN', name: 'Mécaniciens / Garagistes', icon: '🔧', description: 'Réparation auto et moto', categorie: 'BATIMENT' },
  { id: 'PLOMBIER', name: 'Plombiers', icon: '🚿', description: 'Plomberie et sanitaires', categorie: 'BATIMENT' },
  { id: 'MENUISIER', name: 'Menuisiers', icon: '🪚', description: 'Bois, meubles et aluminium', categorie: 'BATIMENT' },
  { id: 'SOUDEUR', name: 'Soudeurs', icon: '🔥', description: 'Soudure métallique et ferronnerie', categorie: 'BATIMENT' },
  { id: 'PEINTRE', name: 'Peintres', icon: '🎨', description: 'Peinture bâtiment et décoration', categorie: 'BATIMENT' },
  { id: 'CARRELEUR', name: 'Carreleurs', icon: '🧱', description: 'Pose de carreaux et faïence', categorie: 'BATIMENT' },
  { id: 'INGENIEUR_BATIMENT', name: 'Ingénieurs en bâtiment', icon: '🏗️', description: 'Études, suivi et contrôle de chantier', categorie: 'BATIMENT' },
  { id: 'VULCANISATEUR', name: 'Vulcanisateurs', icon: '🛞', description: 'Pneus, chambres à air et gonflage', categorie: 'BATIMENT' },

  // Services à domicile
  { id: 'CLIMATICIEN', name: 'Climaticiens / Frigoristes', icon: '❄️', description: 'Climatisation, froid et réfrigération', categorie: 'DOMICILE' },
  { id: 'NETTOYAGE', name: 'Techniciens de surface / Nettoyage', icon: '🧽', description: 'Entreprises et agents de nettoyage', categorie: 'DOMICILE' },
  { id: 'JARDINIER', name: 'Jardiniers / Paysagistes', icon: '🌳', description: 'Entretien de jardins et aménagement paysager', categorie: 'DOMICILE' },
  { id: 'DESINFECTEUR', name: 'Désinfecteurs / Dératisation', icon: '🦟', description: 'Désinfection, désinsectisation et traitement', categorie: 'DOMICILE' },
  { id: 'BUANDIER', name: 'Buandiers / Pressing à domicile', icon: '👕', description: 'Blanchisserie et repassage à domicile', categorie: 'DOMICILE' },

  // Technologie, équipements & énergie solaire
  { id: 'SOLAIRE', name: 'Installateurs / Maintenanciers solaires', icon: '☀️', description: 'Panneaux solaires, batteries et onduleurs', categorie: 'TECH_ENERGIE' },
  { id: 'ELECTRONICIEN', name: 'Électroniciens / Électroménager', icon: '📺', description: 'Réparation d’appareils électroniques et électroménagers', categorie: 'TECH_ENERGIE' },
  { id: 'INFORMATICIEN', name: 'Informaticiens / Techniciens réseaux', icon: '💻', description: 'Dépannage informatique, internet et réseaux', categorie: 'TECH_ENERGIE' },

  // Logistique, transport & déménagement
  { id: 'DEMENAGEUR', name: 'Déménageurs professionnels', icon: '📦', description: 'Déménagement avec ou sans camion', categorie: 'LOGISTIQUE' },
  { id: 'LIVREUR', name: 'Livreurs / Coursiers express', icon: '🛵', description: 'Livraison rapide et courses en ville', categorie: 'LOGISTIQUE' },
];

export const getMetier = (id: string) => METIERS.find((m) => m.id === id);
export const getMetierName = (id: string) => getMetier(id)?.name ?? id;
export const getMetierIcon = (id: string) => getMetier(id)?.icon ?? '🛠️';
export const getMetiersByCategorie = (categorieId: string) =>
  METIERS.filter((m) => m.categorie === categorieId);
