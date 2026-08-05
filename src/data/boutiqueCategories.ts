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
];

export const getBoutiqueCategorie = (id?: string) =>
  BOUTIQUE_CATEGORIES.find((c) => c.id === id);
