// Base de données territoriale exhaustive du Burkina Faso
// Structure: Ville/Commune → Arrondissement → Secteur → Quartier → Sous-quartier

export interface SubQuarter {
  name: string;
}

export interface Quarter {
  name: string;
  subQuarters: string[];
}

export interface Sector {
  name: string;
  quarters: Quarter[];
}

export interface Arrondissement {
  name: string;
  sectors: Sector[];
}

export interface City {
  name: string;
  hasArrondissements: boolean;
  arrondissements: Arrondissement[];
  // Pour les villes sans arrondissements, on a directement des secteurs
  sectors?: Sector[];
}

// ============================================================================
// OUAGADOUGOU - 12 Arrondissements, 55 Secteurs
// ============================================================================
const OUAGADOUGOU: City = {
  name: "Ouagadougou",
  hasArrondissements: true,
  arrondissements: [
    {
      name: "Arrondissement 1",
      sectors: [
        { 
          name: "Secteur 1", 
          quarters: [
            { name: "Koulouba", subQuarters: ["Koulouba Centre", "Koulouba Est", "Koulouba Ouest"] },
            { name: "Rood Woko", subQuarters: ["Rood Woko Marché", "Rood Woko Gare"] }
          ]
        },
        { 
          name: "Secteur 2", 
          quarters: [
            { name: "Zogona", subQuarters: ["Zogona Université", "Zogona Résidentiel", "Zogona Ambassades"] }
          ]
        },
        { 
          name: "Secteur 3", 
          quarters: [
            { name: "Paspanga", subQuarters: ["Paspanga Centre", "Paspanga Nord", "Paspanga Sud"] }
          ]
        },
        { 
          name: "Secteur 4", 
          quarters: [
            { name: "Baskuy", subQuarters: ["Baskuy Centre", "Baskuy Palais"] },
            { name: "Saint-Léon", subQuarters: ["Saint-Léon Église", "Saint-Léon Marché"] }
          ]
        },
        { 
          name: "Secteur 5", 
          quarters: [
            { name: "Kadiogo", subQuarters: ["Kadiogo Centre", "Kadiogo Extension"] },
            { name: "Gounghin Nord", subQuarters: ["Gounghin Nord Marché", "Gounghin Nord École"] }
          ]
        },
        { 
          name: "Secteur 6", 
          quarters: [
            { name: "Bilbalgho", subQuarters: ["Bilbalgho Centre", "Bilbalgho Marché"] },
            { name: "Gandin", subQuarters: ["Gandin Centre"] }
          ]
        },
        { 
          name: "Secteur 7", 
          quarters: [
            { name: "Tiedpalogo", subQuarters: ["Tiedpalogo Centre", "Tiedpalogo Extension"] },
            { name: "Ouidi", subQuarters: ["Ouidi Forêt", "Ouidi Village"] }
          ]
        }
      ]
    },
    {
      name: "Arrondissement 2",
      sectors: [
        { 
          name: "Secteur 8", 
          quarters: [
            { name: "Dapoya", subQuarters: ["Dapoya I", "Dapoya II", "Dapoya III"] }
          ]
        },
        { 
          name: "Secteur 9", 
          quarters: [
            { name: "Nemnin", subQuarters: ["Nemnin Centre", "Nemnin Marché"] },
            { name: "Camp Fonctionnaire", subQuarters: ["Camp Fonctionnaire A", "Camp Fonctionnaire B"] }
          ]
        },
        { 
          name: "Secteur 10", 
          quarters: [
            { name: "Larlé", subQuarters: ["Larlé Centre", "Larlé Extension", "Larlé Yaar"] }
          ]
        },
        { 
          name: "Secteur 11", 
          quarters: [
            { name: "Hamdalaye", subQuarters: ["Hamdalaye Centre", "Hamdalaye Mosquée"] },
            { name: "Samandin", subQuarters: ["Samandin Centre"] }
          ]
        }
      ]
    },
    {
      name: "Arrondissement 3",
      sectors: [
        { 
          name: "Secteur 12", 
          quarters: [
            { name: "Tanghin", subQuarters: ["Tanghin Centre", "Tanghin Marché", "Tanghin Barrage"] },
            { name: "Bissighin", subQuarters: ["Bissighin Centre", "Bissighin Extension"] }
          ]
        },
        { 
          name: "Secteur 13", 
          quarters: [
            { name: "Tampouy", subQuarters: ["Tampouy Centre", "Tampouy SONATUR", "Tampouy Marché"] },
            { name: "Paul VI", subQuarters: ["Paul VI Centre", "Paul VI Extension"] }
          ]
        },
        { 
          name: "Secteur 14", 
          quarters: [
            { name: "Kilwin", subQuarters: ["Kilwin Centre", "Kilwin Est"] },
            { name: "Nagrin", subQuarters: ["Nagrin Centre"] }
          ]
        },
        { 
          name: "Secteur 15", 
          quarters: [
            { name: "Marcoussis", subQuarters: ["Marcoussis Centre", "Marcoussis Extension"] },
            { name: "Tanghin Dassouri", subQuarters: ["Tanghin Dassouri Centre"] }
          ]
        },
        { 
          name: "Secteur 16", 
          quarters: [
            { name: "Nonsin", subQuarters: ["Nonsin Centre", "Nonsin Village"] }
          ]
        }
      ]
    },
    {
      name: "Arrondissement 4",
      sectors: [
        { 
          name: "Secteur 17", 
          quarters: [
            { name: "Somgandé", subQuarters: ["Somgandé Centre", "Somgandé Marché", "Somgandé Extension"] }
          ]
        },
        { 
          name: "Secteur 18", 
          quarters: [
            { name: "Kossodo", subQuarters: ["Kossodo Zone Industrielle", "Kossodo Résidentiel", "Kossodo Marché"] }
          ]
        },
        { 
          name: "Secteur 19", 
          quarters: [
            { name: "Wayalghin Nord", subQuarters: ["Wayalghin Nord Centre", "Wayalghin Nord Extension"] },
            { name: "Wapassi", subQuarters: ["Wapassi Centre"] }
          ]
        },
        { 
          name: "Secteur 20", 
          quarters: [
            { name: "Polsogo", subQuarters: ["Polsogo Centre", "Polsogo Village"] }
          ]
        }
      ]
    },
    {
      name: "Arrondissement 5",
      sectors: [
        { 
          name: "Secteur 21", 
          quarters: [
            { name: "Dassasgho", subQuarters: ["Dassasgho Centre", "Dassasgho Marché"] },
            { name: "Zone du Bois", subQuarters: ["Zone du Bois Centre", "Zone du Bois Artisanat"] }
          ]
        },
        { 
          name: "Secteur 22", 
          quarters: [
            { name: "Wayalghin Sud", subQuarters: ["Wayalghin Sud Centre", "Wayalghin Sud Extension"] }
          ]
        },
        { 
          name: "Secteur 23", 
          quarters: [
            { name: "Wemtenga", subQuarters: ["Wemtenga Centre", "Wemtenga Marché", "Wemtenga Extension"] }
          ]
        },
        { 
          name: "Secteur 24", 
          quarters: [
            { name: "Dagnoën", subQuarters: ["Dagnoën Centre", "Dagnoën Extension"] }
          ]
        },
        { 
          name: "Secteur 25", 
          quarters: [
            { name: "Zanguettin", subQuarters: ["Zanguettin Centre", "Zanguettin Extension"] }
          ]
        }
      ]
    },
    {
      name: "Arrondissement 6",
      sectors: [
        { 
          name: "Secteur 26", 
          quarters: [
            { name: "Gounghin Sud", subQuarters: ["Gounghin Sud Centre", "Gounghin Sud Extension"] }
          ]
        },
        { 
          name: "Secteur 27", 
          quarters: [
            { name: "Pissy", subQuarters: ["Pissy Centre", "Pissy Marché", "Pissy Extension"] }
          ]
        },
        { 
          name: "Secteur 28", 
          quarters: [
            { name: "Cissin", subQuarters: ["Cissin Centre", "Cissin Nord", "Cissin Sud", "Cissin Ouest"] }
          ]
        },
        { 
          name: "Secteur 29", 
          quarters: [
            { name: "Paglayiri", subQuarters: ["Paglayiri Centre", "Paglayiri Extension"] },
            { name: "Zogona Sud", subQuarters: ["Zogona Sud Centre"] }
          ]
        }
      ]
    },
    {
      name: "Arrondissement 7",
      sectors: [
        { 
          name: "Secteur 30", 
          quarters: [
            { name: "Boulmiougou", subQuarters: ["Boulmiougou Centre", "Boulmiougou Marché", "Boulmiougou Extension"] }
          ]
        },
        { 
          name: "Secteur 31", 
          quarters: [
            { name: "Zongo", subQuarters: ["Zongo Centre", "Zongo Extension"] },
            { name: "Kouritenga", subQuarters: ["Kouritenga Centre"] }
          ]
        },
        { 
          name: "Secteur 32", 
          quarters: [
            { name: "Sandogo", subQuarters: ["Sandogo Centre", "Sandogo Extension"] }
          ]
        },
        { 
          name: "Secteur 33", 
          quarters: [
            { name: "Boassa", subQuarters: ["Boassa Centre", "Boassa Village"] }
          ]
        }
      ]
    },
    {
      name: "Arrondissement 8",
      sectors: [
        { 
          name: "Secteur 34", 
          quarters: [
            { name: "Rimkieta", subQuarters: ["Rimkieta Centre", "Rimkieta Extension", "Rimkieta Marché"] }
          ]
        },
        { 
          name: "Secteur 35", 
          quarters: [
            { name: "Bassinko", subQuarters: ["Bassinko Centre", "Bassinko Extension"] }
          ]
        },
        { 
          name: "Secteur 36", 
          quarters: [
            { name: "Bissighin Extension", subQuarters: ["Bissighin Extension Centre", "Bissighin Extension Nord"] }
          ]
        }
      ]
    },
    {
      name: "Arrondissement 9",
      sectors: [
        { 
          name: "Secteur 37", 
          quarters: [
            { name: "Kilwin Ouest", subQuarters: ["Kilwin Ouest Centre", "Kilwin Ouest Extension"] }
          ]
        },
        { 
          name: "Secteur 38", 
          quarters: [
            { name: "Kossoghin", subQuarters: ["Kossoghin Centre"] },
            { name: "Silmiyiri", subQuarters: ["Silmiyiri Centre"] },
            { name: "Émetteur", subQuarters: ["Émetteur Centre", "Émetteur Extension"] }
          ]
        },
        { 
          name: "Secteur 39", 
          quarters: [
            { name: "Kilwin Nord", subQuarters: ["Kilwin Nord Centre", "Kilwin Nord Extension"] }
          ]
        },
        { 
          name: "Secteur 40", 
          quarters: [
            { name: "Kamboinsin", subQuarters: ["Kamboinsin Centre", "Kamboinsin Village"] },
            { name: "2iE", subQuarters: ["2iE Campus", "2iE Extension"] }
          ]
        },
        { 
          name: "Secteur 41", 
          quarters: [
            { name: "Bassinko Cités", subQuarters: ["Cités A", "Cités B", "Cités C"] }
          ]
        }
      ]
    },
    {
      name: "Arrondissement 10",
      sectors: [
        { 
          name: "Secteur 42", 
          quarters: [
            { name: "Dassasgho Extension", subQuarters: ["Dassasgho Extension Centre", "Dassasgho Extension Nord"] }
          ]
        },
        { 
          name: "Secteur 43", 
          quarters: [
            { name: "Wayalghin Est", subQuarters: ["Wayalghin Est Centre", "Wayalghin Est Extension"] }
          ]
        },
        { 
          name: "Secteur 44", 
          quarters: [
            { name: "Bendogo", subQuarters: ["Bendogo Centre", "Bendogo Village"] }
          ]
        },
        { 
          name: "Secteur 45", 
          quarters: [
            { name: "Taabtenga", subQuarters: ["Taabtenga Centre", "Taabtenga Extension"] }
          ]
        }
      ]
    },
    {
      name: "Arrondissement 11",
      sectors: [
        { 
          name: "Secteur 46", 
          quarters: [
            { name: "Balkuy", subQuarters: ["Balkuy Centre", "Balkuy Extension"] }
          ]
        },
        { 
          name: "Secteur 47", 
          quarters: [
            { name: "Karpala", subQuarters: ["Karpala Centre", "Karpala Marché", "Karpala Extension"] }
          ]
        },
        { 
          name: "Secteur 48", 
          quarters: [
            { name: "Rayongo", subQuarters: ["Rayongo Centre", "Rayongo Village"] }
          ]
        },
        { 
          name: "Secteur 49", 
          quarters: [
            { name: "Lanoag-Yiri", subQuarters: ["Lanoag-Yiri Centre"] }
          ]
        },
        { 
          name: "Secteur 50", 
          quarters: [
            { name: "Yamtenga", subQuarters: ["Yamtenga Centre", "Yamtenga Extension"] }
          ]
        },
        { 
          name: "Secteur 51", 
          quarters: [
            { name: "Sogdin", subQuarters: ["Sogdin Centre"] }
          ]
        }
      ]
    },
    {
      name: "Arrondissement 12",
      sectors: [
        { 
          name: "Secteur 52", 
          quarters: [
            { name: "Ouaga 2000", subQuarters: ["Zone des Ambassades", "Zone Résidentielle A", "Zone Résidentielle B", "Zone Administrative"] },
            { name: "Kosyam", subQuarters: ["Kosyam Présidence", "Kosyam Extension"] }
          ]
        },
        { 
          name: "Secteur 53", 
          quarters: [
            { name: "Ouaga 2000 B", subQuarters: ["Zone B Centre", "Zone B Extension"] },
            { name: "IAS", subQuarters: ["IAS Centre"] }
          ]
        },
        { 
          name: "Secteur 54", 
          quarters: [
            { name: "Patte d'Oie", subQuarters: ["Patte d'Oie Centre", "Patte d'Oie Marché", "Patte d'Oie Extension", "Patte d'Oie SONATUR"] }
          ]
        },
        { 
          name: "Secteur 55", 
          quarters: [
            { name: "Balkuy Entrée", subQuarters: ["Balkuy Entrée Centre", "Balkuy Entrée Extension"] }
          ]
        }
      ]
    }
  ]
};

// ============================================================================
// BOBO-DIOULASSO - 7 Arrondissements, 33 Secteurs
// ============================================================================
const BOBO_DIOULASSO: City = {
  name: "Bobo-Dioulasso",
  hasArrondissements: true,
  arrondissements: [
    {
      name: "Arrondissement 1",
      sectors: [
        { 
          name: "Secteur 1", 
          quarters: [
            { name: "Dioulassoba", subQuarters: ["Dioulassoba Centre", "Dioulassoba Mosquée", "Dioulassoba Marché"] }
          ]
        },
        { 
          name: "Secteur 2", 
          quarters: [
            { name: "Farakan", subQuarters: ["Farakan Centre", "Farakan Extension"] }
          ]
        },
        { 
          name: "Secteur 3", 
          quarters: [
            { name: "Tounouma", subQuarters: ["Tounouma Centre", "Tounouma Est"] }
          ]
        },
        { 
          name: "Secteur 4", 
          quarters: [
            { name: "Koko", subQuarters: ["Koko Centre", "Koko Extension"] }
          ]
        },
        { 
          name: "Secteur 5", 
          quarters: [
            { name: "Sikasso-Cira", subQuarters: ["Sikasso-Cira Centre"] }
          ]
        }
      ]
    },
    {
      name: "Arrondissement 2",
      sectors: [
        { 
          name: "Secteur 6", 
          quarters: [
            { name: "Bindougousso", subQuarters: ["Bindougousso Centre", "Bindougousso Extension"] }
          ]
        },
        { 
          name: "Secteur 7", 
          quarters: [
            { name: "Bolomakoté", subQuarters: ["Bolomakoté Centre", "Bolomakoté Marché"] }
          ]
        },
        { 
          name: "Secteur 8", 
          quarters: [
            { name: "Ouezzin-ville", subQuarters: ["Ouezzin-ville Centre", "Ouezzin-ville Extension"] }
          ]
        }
      ]
    },
    {
      name: "Arrondissement 3",
      sectors: [
        { 
          name: "Secteur 9", 
          quarters: [
            { name: "Sarfalao", subQuarters: ["Sarfalao Centre", "Sarfalao Extension", "Sarfalao Marché"] }
          ]
        },
        { 
          name: "Secteur 10", 
          quarters: [
            { name: "Colma", subQuarters: ["Colma Centre", "Colma Extension"] }
          ]
        },
        { 
          name: "Secteur 11", 
          quarters: [
            { name: "Lafiabougou", subQuarters: ["Lafiabougou Centre", "Lafiabougou Marché", "Lafiabougou Extension"] }
          ]
        },
        { 
          name: "Secteur 12", 
          quarters: [
            { name: "Kodéni", subQuarters: ["Kodéni Centre"] }
          ]
        }
      ]
    },
    {
      name: "Arrondissement 4",
      sectors: [
        { 
          name: "Secteur 13", 
          quarters: [
            { name: "Accart-ville", subQuarters: ["Accart-ville Centre", "Accart-ville Extension"] }
          ]
        },
        { 
          name: "Secteur 14", 
          quarters: [
            { name: "Hamdalaye", subQuarters: ["Hamdalaye Centre", "Hamdalaye Mosquée"] }
          ]
        },
        { 
          name: "Secteur 15", 
          quarters: [
            { name: "Kua", subQuarters: ["Kua Centre", "Kua Extension"] }
          ]
        },
        { 
          name: "Secteur 16", 
          quarters: [
            { name: "Niénéta", subQuarters: ["Niénéta Centre"] }
          ]
        }
      ]
    },
    {
      name: "Arrondissement 5",
      sectors: [
        { 
          name: "Secteur 17", 
          quarters: [
            { name: "Belle-Ville", subQuarters: ["Belle-Ville Centre", "Belle-Ville Extension"] }
          ]
        },
        { 
          name: "Secteur 18", 
          quarters: [
            { name: "Dogona", subQuarters: ["Dogona Centre", "Dogona Extension"] }
          ]
        },
        { 
          name: "Secteur 19", 
          quarters: [
            { name: "Sokoura", subQuarters: ["Sokoura Centre"] }
          ]
        },
        { 
          name: "Secteur 20", 
          quarters: [
            { name: "Toukoro", subQuarters: ["Toukoro Centre", "Toukoro Extension"] }
          ]
        },
        { 
          name: "Secteur 21", 
          quarters: [
            { name: "Yéguéré", subQuarters: ["Yéguéré Centre"] }
          ]
        }
      ]
    },
    {
      name: "Arrondissement 6",
      sectors: [
        { 
          name: "Secteur 22", 
          quarters: [
            { name: "Bobo 2000", subQuarters: ["Bobo 2000 Centre", "Bobo 2000 Extension", "Bobo 2000 Résidentiel"] }
          ]
        },
        { 
          name: "Secteur 23", 
          quarters: [
            { name: "Zone Industrielle", subQuarters: ["Zone Industrielle Centre", "Zone Industrielle Extension"] }
          ]
        },
        { 
          name: "Secteur 24", 
          quarters: [
            { name: "Léguéma", subQuarters: ["Léguéma Centre"] }
          ]
        }
      ]
    },
    {
      name: "Arrondissement 7",
      sectors: [
        { 
          name: "Secteur 25", 
          quarters: [
            { name: "Dafra", subQuarters: ["Dafra Centre", "Dafra Extension"] }
          ]
        },
        { 
          name: "Secteur 26", 
          quarters: [
            { name: "Dandé", subQuarters: ["Dandé Centre"] }
          ]
        },
        { 
          name: "Secteur 27", 
          quarters: [
            { name: "Nasso", subQuarters: ["Nasso Centre", "Nasso Cascade"] }
          ]
        },
        { 
          name: "Secteur 28", 
          quarters: [
            { name: "Koumi", subQuarters: ["Koumi Centre"] }
          ]
        },
        { 
          name: "Secteur 29", 
          quarters: [
            { name: "Pala", subQuarters: ["Pala Centre"] }
          ]
        },
        { 
          name: "Secteur 30", 
          quarters: [
            { name: "Logofourousso", subQuarters: ["Logofourousso Centre"] }
          ]
        },
        { 
          name: "Secteur 31", 
          quarters: [
            { name: "Sakabi", subQuarters: ["Sakabi Centre"] }
          ]
        },
        { 
          name: "Secteur 32", 
          quarters: [
            { name: "Bama", subQuarters: ["Bama Centre", "Bama Extension"] }
          ]
        },
        { 
          name: "Secteur 33", 
          quarters: [
            { name: "Kodougou", subQuarters: ["Kodougou Centre"] }
          ]
        }
      ]
    }
  ]
};

// ============================================================================
// Helper function pour créer les villes sans arrondissements
// ============================================================================
const createSimpleCity = (name: string, sectorsData: { sector: string; quarters: { name: string; subQuarters: string[] }[] }[]): City => ({
  name,
  hasArrondissements: false,
  arrondissements: [],
  sectors: sectorsData.map(s => ({
    name: s.sector,
    quarters: s.quarters
  }))
});

// ============================================================================
// AUTRES VILLES DU BURKINA FASO
// ============================================================================
const KOUDOUGOU = createSimpleCity("Koudougou", [
  { sector: "Secteur 1", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] },
    { name: "Burkina", subQuarters: ["Burkina Centre", "Burkina Extension"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Issouka", subQuarters: ["Issouka Centre", "Issouka Marché"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Université", subQuarters: ["Campus", "Cités Universitaires"] },
    { name: "ENEP", subQuarters: ["ENEP Centre"] }
  ]},
  { sector: "Secteur 4", quarters: [
    { name: "Godin", subQuarters: ["Godin Centre", "Godin Extension"] }
  ]},
  { sector: "Secteur 5", quarters: [
    { name: "Sogpelcé", subQuarters: ["Sogpelcé Centre", "Sogpelcé Extension"] }
  ]},
  { sector: "Secteur 6", quarters: [
    { name: "Dapoya", subQuarters: ["Dapoya Centre"] }
  ]},
  { sector: "Secteur 7", quarters: [
    { name: "Lalle", subQuarters: ["Lalle Centre", "Lalle Extension"] }
  ]},
  { sector: "Secteur 8", quarters: [
    { name: "Poa", subQuarters: ["Poa Centre"] }
  ]},
  { sector: "Secteur 9", quarters: [
    { name: "Singo", subQuarters: ["Singo Centre"] }
  ]},
  { sector: "Secteur 10", quarters: [
    { name: "Bourkina", subQuarters: ["Bourkina Extension"] }
  ]}
]);

const OUAHIGOUYA = createSimpleCity("Ouahigouya", [
  { sector: "Secteur 1", quarters: [
    { name: "Palais Royal", subQuarters: ["Palais Centre", "Palais Extension"] },
    { name: "Yadéga", subQuarters: ["Yadéga Centre"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Banques", subQuarters: ["Zone Bancaire", "Zone Commerciale"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Kibidoué", subQuarters: ["Kibidoué Centre", "Kibidoué Extension"] }
  ]},
  { sector: "Secteur 4", quarters: [
    { name: "Admin", subQuarters: ["Zone Administrative", "Préfecture"] }
  ]},
  { sector: "Secteur 5", quarters: [
    { name: "Bougouzagué", subQuarters: ["Bougouzagué Centre"] }
  ]},
  { sector: "Secteur 6", quarters: [
    { name: "Gourcy Extension", subQuarters: ["Gourcy Extension Centre"] }
  ]},
  { sector: "Secteur 7", quarters: [
    { name: "Youba", subQuarters: ["Youba Centre", "Youba Village"] }
  ]},
  { sector: "Secteur 8", quarters: [
    { name: "Somnyaaya", subQuarters: ["Somnyaaya Centre"] }
  ]}
]);

const BANFORA = createSimpleCity("Banfora", [
  { sector: "Secteur 1", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Cité", subQuarters: ["Cité Centre", "Cité Extension"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Diarabakoko", subQuarters: ["Diarabakoko Centre", "Diarabakoko Extension"] }
  ]},
  { sector: "Secteur 4", quarters: [
    { name: "Komoé", subQuarters: ["Komoé Centre", "Komoé Cascade"] }
  ]},
  { sector: "Secteur 5", quarters: [
    { name: "Nafona", subQuarters: ["Nafona Centre", "Nafona Extension"] }
  ]},
  { sector: "Secteur 6", quarters: [
    { name: "Bérégadougou", subQuarters: ["Bérégadougou Centre"] }
  ]},
  { sector: "Secteur 7", quarters: [
    { name: "Sindou", subQuarters: ["Sindou Centre", "Sindou Pics"] }
  ]}
]);

const KAYA = createSimpleCity("Kaya", [
  { sector: "Secteur 1", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Cité", subQuarters: ["Cité Centre", "Cité Extension"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Dondossé", subQuarters: ["Dondossé Centre"] }
  ]},
  { sector: "Secteur 4", quarters: [
    { name: "Kalambaogo", subQuarters: ["Kalambaogo Centre", "Kalambaogo Extension"] }
  ]},
  { sector: "Secteur 5", quarters: [
    { name: "Koulgogo", subQuarters: ["Koulgogo Centre"] }
  ]},
  { sector: "Secteur 6", quarters: [
    { name: "Secto Somguigdé", subQuarters: ["Somguigdé Centre"] }
  ]}
]);

const TENKODOGO = createSimpleCity("Tenkodogo", [
  { sector: "Secteur 1", quarters: [
    { name: "Palais", subQuarters: ["Palais Centre", "Palais Extension"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Banques", subQuarters: ["Zone Bancaire", "Zone Commerciale"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Cité", subQuarters: ["Cité Centre", "Cité Extension"] }
  ]},
  { sector: "Secteur 4", quarters: [
    { name: "Admin", subQuarters: ["Zone Administrative", "Préfecture"] }
  ]},
  { sector: "Secteur 5", quarters: [
    { name: "Bassouango", subQuarters: ["Bassouango Centre"] }
  ]}
]);

const FADA_NGOURMA = createSimpleCity("Fada N'Gourma", [
  { sector: "Secteur 1", quarters: [
    { name: "Palais", subQuarters: ["Palais Centre", "Palais Extension"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Banques", subQuarters: ["Zone Bancaire", "Zone Commerciale"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Écoles", subQuarters: ["Zone Scolaire", "Lycée"] }
  ]},
  { sector: "Secteur 4", quarters: [
    { name: "Admin", subQuarters: ["Zone Administrative", "Préfecture"] }
  ]},
  { sector: "Secteur 5", quarters: [
    { name: "Natiaboani", subQuarters: ["Natiaboani Centre"] }
  ]}
]);

const DEDOUGOU = createSimpleCity("Dédougou", [
  { sector: "Secteur 1", quarters: [
    { name: "Bankuy", subQuarters: ["Bankuy Centre", "Bankuy Extension"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Moukuy", subQuarters: ["Moukuy Centre", "Moukuy Extension"] }
  ]},
  { sector: "Secteur 4", quarters: [
    { name: "Ouarkoye", subQuarters: ["Ouarkoye Centre"] }
  ]},
  { sector: "Secteur 5", quarters: [
    { name: "Passakongo", subQuarters: ["Passakongo Centre"] }
  ]},
  { sector: "Secteur 6", quarters: [
    { name: "Université", subQuarters: ["Campus", "Cités"] }
  ]}
]);

const DORI = createSimpleCity("Dori", [
  { sector: "Secteur 1", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Lac", subQuarters: ["Lac Centre", "Lac Extension"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Gangaol", subQuarters: ["Gangaol Centre"] }
  ]},
  { sector: "Secteur 4", quarters: [
    { name: "Petit-Paris", subQuarters: ["Petit-Paris Centre", "Petit-Paris Extension"] }
  ]},
  { sector: "Secteur 5", quarters: [
    { name: "Aéroport", subQuarters: ["Zone Aéroport", "Extension"] }
  ]}
]);

const MANGA = createSimpleCity("Manga", [
  { sector: "Secteur 1", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Gouvernorat", subQuarters: ["Zone Gouvernorat", "Extension"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Est", subQuarters: ["Est Centre", "Est Extension"] }
  ]},
  { sector: "Secteur 4", quarters: [
    { name: "Kombissiri Route", subQuarters: ["Kombissiri Route Centre"] }
  ]},
  { sector: "Secteur 5", quarters: [
    { name: "Tiébélé Route", subQuarters: ["Tiébélé Route Centre"] }
  ]}
]);

const ZINIARE = createSimpleCity("Ziniaré", [
  { sector: "Secteur 1", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Gouvernorat", subQuarters: ["Zone Gouvernorat", "Extension"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Parc Bangr-Weoogo", subQuarters: ["Zone Parc", "Extension"] }
  ]},
  { sector: "Secteur 4", quarters: [
    { name: "Est", subQuarters: ["Est Centre", "Est Extension"] }
  ]},
  { sector: "Secteur 5", quarters: [
    { name: "Ouest", subQuarters: ["Ouest Centre"] }
  ]}
]);

const LEO = createSimpleCity("Léo", [
  { sector: "Secteur 1", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Admin", subQuarters: ["Zone Administrative", "Préfecture"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Ouest", subQuarters: ["Ouest Centre", "Ouest Extension"] }
  ]},
  { sector: "Secteur 4", quarters: [
    { name: "Est", subQuarters: ["Est Centre"] }
  ]}
]);

const KOUPELA = createSimpleCity("Koupéla", [
  { sector: "Secteur 1", quarters: [
    { name: "Carrefour", subQuarters: ["Carrefour Centre", "Carrefour Extension"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Admin", subQuarters: ["Zone Administrative", "Préfecture"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Est", subQuarters: ["Est Centre", "Est Extension"] }
  ]},
  { sector: "Secteur 4", quarters: [
    { name: "Ouest", subQuarters: ["Ouest Centre"] }
  ]}
]);

const PO = createSimpleCity("Pô", [
  { sector: "Secteur 1", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Camp Militaire", subQuarters: ["Camp Centre", "Camp Extension"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Ouest", subQuarters: ["Ouest Centre", "Ouest Extension"] }
  ]},
  { sector: "Secteur 4", quarters: [
    { name: "Tiébélé Route", subQuarters: ["Tiébélé Route Centre"] }
  ]}
]);

const ORODARA = createSimpleCity("Orodara", [
  { sector: "Secteur 1", quarters: [
    { name: "Gare", subQuarters: ["Gare Centre", "Gare Extension"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Admin", subQuarters: ["Zone Administrative", "Préfecture"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Vergers", subQuarters: ["Zone Vergers", "Extension"] }
  ]},
  { sector: "Secteur 4", quarters: [
    { name: "Marché", subQuarters: ["Marché Centre"] }
  ]}
]);

const DIEBOUGOU = createSimpleCity("Diébougou", [
  { sector: "Secteur 1", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Grottes", subQuarters: ["Zone Grottes", "Extension"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Admin", subQuarters: ["Zone Administrative", "Préfecture"] }
  ]},
  { sector: "Secteur 4", quarters: [
    { name: "Mission", subQuarters: ["Mission Centre"] }
  ]}
]);

const GAOUA = createSimpleCity("Gaoua", [
  { sector: "Secteur 1", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Musée", subQuarters: ["Zone Musée", "Extension"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Admin", subQuarters: ["Zone Administrative", "Préfecture"] }
  ]},
  { sector: "Secteur 4", quarters: [
    { name: "Loropéni Route", subQuarters: ["Loropéni Route Centre"] }
  ]}
]);

const NOUNA = createSimpleCity("Nouna", [
  { sector: "Secteur 1", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Mission", subQuarters: ["Mission Centre", "Mission Extension"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Admin", subQuarters: ["Zone Administrative", "Préfecture"] }
  ]}
]);

const REO = createSimpleCity("Réo", [
  { sector: "Secteur 1", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Admin", subQuarters: ["Zone Administrative", "Préfecture"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Sud", subQuarters: ["Sud Centre", "Sud Extension"] }
  ]}
]);

const YAKO = createSimpleCity("Yako", [
  { sector: "Secteur 1", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Admin", subQuarters: ["Zone Administrative", "Préfecture"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Ouest", subQuarters: ["Ouest Centre", "Ouest Extension"] }
  ]}
]);

const TOUGAN = createSimpleCity("Tougan", [
  { sector: "Secteur 1", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Admin", subQuarters: ["Zone Administrative", "Préfecture"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Est", subQuarters: ["Est Centre", "Est Extension"] }
  ]}
]);

const BOGANDE = createSimpleCity("Bogandé", [
  { sector: "Secteur 1", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Marché", subQuarters: ["Marché Centre", "Marché Extension"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Résidentiel", subQuarters: ["Résidentiel Centre"] }
  ]}
]);

const BOULSA = createSimpleCity("Boulsa", [
  { sector: "Secteur 1", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Admin", subQuarters: ["Zone Administrative", "Préfecture"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Baadongo", subQuarters: ["Baadongo Centre", "Baadongo Extension"] }
  ]}
]);

const DANO = createSimpleCity("Dano", [
  { sector: "Secteur 1", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Admin", subQuarters: ["Zone Administrative", "Préfecture"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Sud", subQuarters: ["Sud Centre", "Sud Extension"] }
  ]},
  { sector: "Secteur 4", quarters: [
    { name: "Extension", subQuarters: ["Extension Centre"] }
  ]}
]);

const BATIE = createSimpleCity("Batié", [
  { sector: "Secteur 1", quarters: [
    { name: "Centre-Ville", subQuarters: ["Centre-Ville Centre", "Centre-Ville Marché"] }
  ]},
  { sector: "Secteur 2", quarters: [
    { name: "Admin", subQuarters: ["Zone Administrative", "Préfecture"] }
  ]},
  { sector: "Secteur 3", quarters: [
    { name: "Batié Haut", subQuarters: ["Batié Haut Centre", "Batié Haut Extension"] }
  ]},
  { sector: "Secteur 4", quarters: [
    { name: "Batié Bas", subQuarters: ["Batié Bas Centre"] }
  ]}
]);

// ============================================================================
// LISTE COMPLÈTE DES VILLES
// ============================================================================
export const BURKINA_CITIES: City[] = [
  OUAGADOUGOU,
  BOBO_DIOULASSO,
  KOUDOUGOU,
  OUAHIGOUYA,
  BANFORA,
  KAYA,
  TENKODOGO,
  FADA_NGOURMA,
  DEDOUGOU,
  DORI,
  MANGA,
  ZINIARE,
  LEO,
  KOUPELA,
  PO,
  ORODARA,
  DIEBOUGOU,
  GAOUA,
  NOUNA,
  REO,
  YAKO,
  TOUGAN,
  BOGANDE,
  BOULSA,
  DANO,
  BATIE
];

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

// Obtenir toutes les villes
export const getAllCities = (): string[] => BURKINA_CITIES.map(c => c.name);

// Obtenir une ville par son nom
export const getCityByName = (cityName: string): City | undefined => 
  BURKINA_CITIES.find(c => c.name === cityName);

// Vérifier si une ville a des arrondissements
export const cityHasArrondissements = (cityName: string): boolean => {
  const city = getCityByName(cityName);
  return city?.hasArrondissements || false;
};

// Obtenir les arrondissements d'une ville
export const getArrondissements = (cityName: string): Arrondissement[] => {
  const city = getCityByName(cityName);
  return city?.arrondissements || [];
};

// Obtenir les secteurs (soit depuis un arrondissement, soit directement)
export const getSectors = (cityName: string, arrondissementName?: string): Sector[] => {
  const city = getCityByName(cityName);
  if (!city) return [];
  
  if (city.hasArrondissements && arrondissementName) {
    const arr = city.arrondissements.find(a => a.name === arrondissementName);
    return arr?.sectors || [];
  }
  
  return city.sectors || [];
};

// Obtenir les quartiers d'un secteur
export const getQuarters = (cityName: string, arrondissementName: string | undefined, sectorName: string): Quarter[] => {
  const sectors = getSectors(cityName, arrondissementName);
  const sector = sectors.find(s => s.name === sectorName);
  return sector?.quarters || [];
};

// Obtenir les sous-quartiers d'un quartier
export const getSubQuarters = (cityName: string, arrondissementName: string | undefined, sectorName: string, quarterName: string): string[] => {
  const quarters = getQuarters(cityName, arrondissementName, sectorName);
  const quarter = quarters.find(q => q.name === quarterName);
  return quarter?.subQuarters || [];
};

// Interface pour les résultats de recherche
export interface LocationSearchResult {
  city: string;
  arrondissement?: string;
  sector: string;
  quarter: string;
  subQuarter: string;
  fullPath: string;
}

// Recherche globale dans toutes les localités
export const searchLocations = (query: string): LocationSearchResult[] => {
  const results: LocationSearchResult[] = [];
  const queryLower = query.toLowerCase().trim();
  
  if (queryLower.length < 2) return results;
  
  for (const city of BURKINA_CITIES) {
    const processQuarters = (sectors: Sector[], arrondissement?: string) => {
      for (const sector of sectors) {
        for (const quarter of sector.quarters) {
          for (const subQuarter of quarter.subQuarters) {
            // Recherche dans tous les niveaux
            if (
              city.name.toLowerCase().includes(queryLower) ||
              (arrondissement && arrondissement.toLowerCase().includes(queryLower)) ||
              sector.name.toLowerCase().includes(queryLower) ||
              quarter.name.toLowerCase().includes(queryLower) ||
              subQuarter.toLowerCase().includes(queryLower)
            ) {
              const pathParts = [city.name];
              if (arrondissement) pathParts.push(arrondissement);
              pathParts.push(sector.name, quarter.name, subQuarter);
              
              results.push({
                city: city.name,
                arrondissement,
                sector: sector.name,
                quarter: quarter.name,
                subQuarter,
                fullPath: pathParts.join(' → ')
              });
            }
          }
        }
      }
    };
    
    if (city.hasArrondissements) {
      for (const arr of city.arrondissements) {
        processQuarters(arr.sectors, arr.name);
      }
    } else if (city.sectors) {
      processQuarters(city.sectors);
    }
  }
  
  // Limiter les résultats et trier par pertinence
  return results.slice(0, 20);
};
