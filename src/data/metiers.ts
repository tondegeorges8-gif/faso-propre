// Corps de métier de l'annuaire des prestataires
export interface Metier {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const METIERS: Metier[] = [
  { id: 'ELECTRICIEN', name: 'Électriciens', icon: '💡', description: 'Installation et dépannage électrique' },
  { id: 'MECANICIEN', name: 'Mécaniciens / Garagistes', icon: '🔧', description: 'Réparation auto et moto' },
  { id: 'PLOMBIER', name: 'Plombiers', icon: '🚿', description: 'Plomberie et sanitaires' },
  { id: 'MENUISIER', name: 'Menuisiers', icon: '🪚', description: 'Bois, meubles et aluminium' },
  { id: 'SOUDEUR', name: 'Soudeurs', icon: '🔥', description: 'Soudure métallique et ferronnerie' },
  { id: 'PEINTRE', name: 'Peintres', icon: '🎨', description: 'Peinture bâtiment et décoration' },
  { id: 'CARRELEUR', name: 'Carreleurs', icon: '🧱', description: 'Pose de carreaux et faïence' },
  { id: 'INGENIEUR_BATIMENT', name: 'Ingénieurs en bâtiment', icon: '🏗️', description: 'Études, suivi et contrôle de chantier' },
  { id: 'VULCANISATEUR', name: 'Vulcanisateurs', icon: '🛞', description: 'Pneus, chambres à air et gonflage' },
];

export const getMetier = (id: string) => METIERS.find((m) => m.id === id);
export const getMetierName = (id: string) => getMetier(id)?.name ?? id;
export const getMetierIcon = (id: string) => getMetier(id)?.icon ?? '🛠️';
