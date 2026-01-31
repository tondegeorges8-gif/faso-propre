// Hierarchical location data for Burkina Faso
// Structure: City > Sector > Neighborhoods

export interface Neighborhood {
  name: string;
}

export interface Sector {
  name: string;
  neighborhoods: string[];
}

export interface City {
  name: string;
  sectors: Sector[];
}

export const BURKINA_LOCATIONS: City[] = [
  {
    name: "Ouagadougou",
    sectors: [
      // Arrondissement 1
      { name: "Secteur 1 (Arr. 1)", neighborhoods: ["Koulouba", "Rood Woko"] },
      { name: "Secteur 2 (Arr. 1)", neighborhoods: ["Zogona"] },
      { name: "Secteur 3 (Arr. 1)", neighborhoods: ["Paspanga"] },
      { name: "Secteur 4 (Arr. 1)", neighborhoods: ["Baskuy"] },
      { name: "Secteur 5 (Arr. 1)", neighborhoods: ["Kadiogo", "Gounghin Nord"] },
      // Arrondissement 2
      { name: "Secteur 8 (Arr. 2)", neighborhoods: ["Dapoya"] },
      { name: "Secteur 9 (Arr. 2)", neighborhoods: ["Nemnin"] },
      { name: "Secteur 10 (Arr. 2)", neighborhoods: ["Larlé"] },
      { name: "Secteur 11 (Arr. 2)", neighborhoods: ["Hamdalaye"] },
      // Arrondissement 3
      { name: "Secteur 12 (Arr. 3)", neighborhoods: ["Tanghin", "Bissighin"] },
      { name: "Secteur 13 (Arr. 3)", neighborhoods: ["Tampouy", "Paul VI"] },
      { name: "Secteur 14 (Arr. 3)", neighborhoods: ["Kilwin Est"] },
      { name: "Secteur 15 (Arr. 3)", neighborhoods: ["Marcoussis"] },
      { name: "Secteur 16 (Arr. 3)", neighborhoods: ["Nonsin"] },
      // Arrondissement 4
      { name: "Secteur 17 (Arr. 4)", neighborhoods: ["Somgandé"] },
      { name: "Secteur 18 (Arr. 4)", neighborhoods: ["Kossodo"] },
      { name: "Secteur 19 (Arr. 4)", neighborhoods: ["Wayalghin Nord"] },
      { name: "Secteur 20 (Arr. 4)", neighborhoods: ["Polsogo"] },
      // Arrondissement 5
      { name: "Secteur 21 (Arr. 5)", neighborhoods: ["Dassasgho", "Zone du Bois"] },
      { name: "Secteur 22 (Arr. 5)", neighborhoods: ["Wayalghin Sud"] },
      { name: "Secteur 23 (Arr. 5)", neighborhoods: ["Wemtenga"] },
      { name: "Secteur 24 (Arr. 5)", neighborhoods: ["Dagnoën"] },
      // Arrondissement 6
      { name: "Secteur 26 (Arr. 6)", neighborhoods: ["Gounghin Sud"] },
      { name: "Secteur 27 (Arr. 6)", neighborhoods: ["Pissy"] },
      { name: "Secteur 28 (Arr. 6)", neighborhoods: ["Cissin"] },
      { name: "Secteur 29 (Arr. 6)", neighborhoods: ["Paglayiri"] },
      // Arrondissement 7
      { name: "Secteur 30 (Arr. 7)", neighborhoods: ["Boulmiougou"] },
      { name: "Secteur 31 (Arr. 7)", neighborhoods: ["Zongo"] },
      { name: "Secteur 32 (Arr. 7)", neighborhoods: ["Sandogo"] },
      { name: "Secteur 33 (Arr. 7)", neighborhoods: ["Boassa"] },
      // Arrondissement 8
      { name: "Secteur 34 (Arr. 8)", neighborhoods: ["Rimkieta"] },
      { name: "Secteur 35 (Arr. 8)", neighborhoods: ["Bassinko"] },
      { name: "Secteur 36 (Arr. 8)", neighborhoods: ["Bissighin Extension"] },
      // Arrondissement 9
      { name: "Secteur 37 (Arr. 9)", neighborhoods: ["Kilwin"] },
      { name: "Secteur 38 (Arr. 9)", neighborhoods: ["Kossoghin", "Silmiyiri", "Émetteur"] },
      { name: "Secteur 39 (Arr. 9)", neighborhoods: ["Kilwin Nord"] },
      { name: "Secteur 40 (Arr. 9)", neighborhoods: ["Kamboinsin", "2iE"] },
      { name: "Secteur 41 (Arr. 9)", neighborhoods: ["Bassinko Cités"] },
      // Arrondissement 10
      { name: "Secteur 42 (Arr. 10)", neighborhoods: ["Dassasgho Ext."] },
      { name: "Secteur 43 (Arr. 10)", neighborhoods: ["Wayalghin"] },
      { name: "Secteur 44 (Arr. 10)", neighborhoods: ["Bendogo"] },
      { name: "Secteur 45 (Arr. 10)", neighborhoods: ["Taabtenga"] },
      // Arrondissement 11
      { name: "Secteur 46 (Arr. 11)", neighborhoods: ["Balkuy"] },
      { name: "Secteur 47 (Arr. 11)", neighborhoods: ["Karpala"] },
      { name: "Secteur 48 (Arr. 11)", neighborhoods: ["Rayongo"] },
      { name: "Secteur 49 (Arr. 11)", neighborhoods: ["Lanoag-Yiri"] },
      { name: "Secteur 50 (Arr. 11)", neighborhoods: ["Yamtenga"] },
      // Arrondissement 12
      { name: "Secteur 52 (Arr. 12)", neighborhoods: ["Ouaga 2000 A", "Kosyam"] },
      { name: "Secteur 53 (Arr. 12)", neighborhoods: ["Ouaga 2000 B", "IAS"] },
      { name: "Secteur 54 (Arr. 12)", neighborhoods: ["Patte d'Oie"] },
      { name: "Secteur 55 (Arr. 12)", neighborhoods: ["Balkuy Entrée"] },
    ]
  },
  {
    name: "Bobo-Dioulasso",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Dioulassoba"] },
      { name: "Secteur 2", neighborhoods: ["Dogona"] },
      { name: "Secteur 3", neighborhoods: ["Tounouma"] },
      { name: "Secteur 4", neighborhoods: ["Koko"] },
      { name: "Secteur 7", neighborhoods: ["Bolomakoté"] },
      { name: "Secteur 8", neighborhoods: ["Ouezzin-ville"] },
      { name: "Secteur 9", neighborhoods: ["Sarfalao"] },
      { name: "Secteur 10", neighborhoods: ["Colma"] },
      { name: "Secteur 11", neighborhoods: ["Lafiabougou"] },
      { name: "Secteur 17", neighborhoods: ["Belle-Ville"] },
      { name: "Secteur 22", neighborhoods: ["Bobo 2000"] },
      { name: "Secteur 25", neighborhoods: ["Dafra"] },
    ]
  },
  {
    name: "Banfora",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Centre"] },
      { name: "Secteur 2", neighborhoods: ["Cité"] },
      { name: "Secteur 3", neighborhoods: ["Diarabakoko"] },
      { name: "Secteur 4", neighborhoods: ["Komoé"] },
      { name: "Secteur 5", neighborhoods: ["Nafona"] },
    ]
  },
  {
    name: "Batié",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Centre"] },
      { name: "Secteur 2", neighborhoods: ["Admin"] },
      { name: "Secteur 3", neighborhoods: ["Batié Haut"] },
      { name: "Secteur 4", neighborhoods: ["Batié Bas"] },
    ]
  },
  {
    name: "Bogandé",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Centre"] },
      { name: "Secteur 2", neighborhoods: ["Marché"] },
      { name: "Secteur 3", neighborhoods: ["Résidentiel"] },
    ]
  },
  {
    name: "Boulsa",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Centre"] },
      { name: "Secteur 2", neighborhoods: ["Admin"] },
      { name: "Secteur 3", neighborhoods: ["Baadongo"] },
    ]
  },
  {
    name: "Dano",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Centre"] },
      { name: "Secteur 2", neighborhoods: ["Admin"] },
      { name: "Secteur 3", neighborhoods: ["Sud"] },
      { name: "Secteur 4", neighborhoods: ["Extension"] },
    ]
  },
  {
    name: "Dédougou",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Bankuy"] },
      { name: "Secteur 2", neighborhoods: ["Centre"] },
      { name: "Secteur 3", neighborhoods: ["Moukuy"] },
      { name: "Secteur 6", neighborhoods: ["Université"] },
    ]
  },
  {
    name: "Diébougou",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Centre"] },
      { name: "Secteur 2", neighborhoods: ["Grottes"] },
      { name: "Secteur 3", neighborhoods: ["Admin"] },
    ]
  },
  {
    name: "Dori",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Centre"] },
      { name: "Secteur 2", neighborhoods: ["Lac"] },
      { name: "Secteur 4", neighborhoods: ["Petit-Paris"] },
      { name: "Secteur 5", neighborhoods: ["Aéroport"] },
    ]
  },
  {
    name: "Fada N'Gourma",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Palais"] },
      { name: "Secteur 2", neighborhoods: ["Banques"] },
      { name: "Secteur 3", neighborhoods: ["Écoles"] },
      { name: "Secteur 4", neighborhoods: ["Admin"] },
    ]
  },
  {
    name: "Kaya",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Centre"] },
      { name: "Secteur 2", neighborhoods: ["Cité"] },
      { name: "Secteur 5", neighborhoods: ["Koulgogo"] },
    ]
  },
  {
    name: "Koudougou",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Centre"] },
      { name: "Secteur 2", neighborhoods: ["Issouka"] },
      { name: "Secteur 3", neighborhoods: ["Université"] },
      { name: "Secteur 4", neighborhoods: ["Burkina"] },
      { name: "Secteur 5", neighborhoods: ["Sogpelcé"] },
    ]
  },
  {
    name: "Koupéla",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Carrefour"] },
      { name: "Secteur 2", neighborhoods: ["Admin"] },
      { name: "Secteur 3", neighborhoods: ["Est"] },
    ]
  },
  {
    name: "Léo",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Centre"] },
      { name: "Secteur 2", neighborhoods: ["Admin"] },
      { name: "Secteur 3", neighborhoods: ["Ouest"] },
    ]
  },
  {
    name: "Manga",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Centre"] },
      { name: "Secteur 2", neighborhoods: ["Gouvernorat"] },
      { name: "Secteur 3", neighborhoods: ["Est"] },
    ]
  },
  {
    name: "Nouna",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Centre"] },
      { name: "Secteur 2", neighborhoods: ["Mission"] },
      { name: "Secteur 3", neighborhoods: ["Admin"] },
    ]
  },
  {
    name: "Orodara",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Gare"] },
      { name: "Secteur 2", neighborhoods: ["Admin"] },
      { name: "Secteur 3", neighborhoods: ["Vergers"] },
    ]
  },
  {
    name: "Ouahigouya",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Palais"] },
      { name: "Secteur 2", neighborhoods: ["Banques"] },
      { name: "Secteur 3", neighborhoods: ["Yadéga"] },
      { name: "Secteur 4", neighborhoods: ["Admin"] },
    ]
  },
  {
    name: "Pô",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Centre"] },
      { name: "Secteur 2", neighborhoods: ["Camp"] },
      { name: "Secteur 3", neighborhoods: ["Ouest"] },
    ]
  },
  {
    name: "Réo",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Centre"] },
      { name: "Secteur 2", neighborhoods: ["Admin"] },
      { name: "Secteur 3", neighborhoods: ["Sud"] },
    ]
  },
  {
    name: "Tenkodogo",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Palais"] },
      { name: "Secteur 2", neighborhoods: ["Banques"] },
      { name: "Secteur 3", neighborhoods: ["Cité"] },
      { name: "Secteur 4", neighborhoods: ["Admin"] },
    ]
  },
  {
    name: "Tougan",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Centre"] },
      { name: "Secteur 2", neighborhoods: ["Admin"] },
      { name: "Secteur 3", neighborhoods: ["Est"] },
    ]
  },
  {
    name: "Yako",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Centre"] },
      { name: "Secteur 2", neighborhoods: ["Admin"] },
      { name: "Secteur 3", neighborhoods: ["Ouest"] },
    ]
  },
  {
    name: "Ziniaré",
    sectors: [
      { name: "Secteur 1", neighborhoods: ["Centre"] },
      { name: "Secteur 2", neighborhoods: ["Gouvernorat"] },
      { name: "Secteur 3", neighborhoods: ["Parc"] },
      { name: "Secteur 4", neighborhoods: ["Est"] },
    ]
  }
];

// Helper function to get sectors for a city
export const getSectorsForCity = (cityName: string): Sector[] => {
  const city = BURKINA_LOCATIONS.find(c => c.name === cityName);
  return city?.sectors || [];
};

// Helper function to get neighborhoods for a sector
export const getNeighborhoodsForSector = (cityName: string, sectorName: string): string[] => {
  const city = BURKINA_LOCATIONS.find(c => c.name === cityName);
  const sector = city?.sectors.find(s => s.name === sectorName);
  return sector?.neighborhoods || [];
};

// Get all city names
export const getAllCities = (): string[] => {
  return BURKINA_LOCATIONS.map(c => c.name);
};
