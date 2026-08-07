// Catégories de boutiques de l'annuaire FASO YAAR
export interface BoutiqueCategorie {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const BOUTIQUE_CATEGORIES: BoutiqueCategorie[] = [
  {
    id: 'QUINCAILLERIE',
    name: 'Quincailleries & Matériaux de Construction',
    icon: '🧱',
    description: 'Ciment, fer, outillage et matériaux',
  },
  {
    id: 'ELECTRICITE_SOLAIRE',
    name: 'Électricité & Énergies Solaires',
    icon: '⚡',
    description: 'Câbles, panneaux solaires, batteries',
  },
  {
    id: 'ALIMENTATION',
    name: 'Alimentations & Supermarchés',
    icon: '🛒',
    description: 'Dépôts de boissons, gaz, produits alimentaires',
  },
  {
    id: 'PLOMBERIE',
    name: 'Plomberie & Sanitaires',
    icon: '🚿',
    description: 'Tuyauterie, robinetterie et sanitaires',
  },
  {
    id: 'ELECTROMENAGER',
    name: 'Électroménager & Multimédia',
    icon: '📺',
    description: 'Télévisions, frigos, téléphones et accessoires',
  },
  {
    id: 'PEINTURE',
    name: 'Peinture & Finition',
    icon: '🎨',
    description: 'Peintures, enduits et produits de finition',
  },
  {
    id: 'BOULANGERIE',
    name: 'Boulangeries & Rôtisseries',
    icon: '🥖',
    description: 'Pain, viennoiseries et grillades',
  },
  {
    id: 'MODE',
    name: 'Mode, Couture & Chaussures',
    icon: '👗',
    description: 'Habillement, Faso Dan Fani, cordonnerie',
  },
  {
    id: 'COSMETIQUE',
    name: 'Cosmétiques & Beauté',
    icon: '💄',
    description: 'Produits de beauté, coiffure, esthétique',
  },
  {
    id: 'ARTISANAT',
    name: 'Artisanat & Décoration',
    icon: '🪘',
    description: 'Bronze, bogolan, vannerie, décoration',
  },
  {
    id: 'MECANIQUE',
    name: 'Mécanique & Pièces détachées',
    icon: '🔧',
    description: 'Auto, moto, pièces et accessoires',
  },
  {
    id: 'RESTAURATION',
    name: 'Restauration & Maquis',
    icon: '🍲',
    description: 'Restaurants, maquis, traiteurs',
  },
  {
    id: 'AGRICULTURE',
    name: 'Agriculture & Élevage',
    icon: '🌾',
    description: 'Intrants, semences, produits du terroir',
  },
  {
    id: 'PHARMACIE',
    name: 'Santé & Parapharmacie',
    icon: '💊',
    description: 'Produits de santé et d\'hygiène',
  },
  {
    id: 'AUTRE',
    name: 'Autre corps de métier',
    icon: '🏪',
    description: 'Tout autre secteur d\'activité',
  },
];

export const getBoutiqueCategorie = (id?: string) =>
  BOUTIQUE_CATEGORIES.find((c) => c.id === id);

