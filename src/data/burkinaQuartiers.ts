// Quartiers principaux par ville du Burkina Faso
export const QUARTIERS_BY_CITY: Record<string, string[]> = {
  Ouagadougou: [
    'Baskuy', 'Bogodogo', 'Boulmiougou', 'Nongr-Massom', 'Sig-Nonghin',
    'Dassasgho', 'Zogona', 'Gounghin', 'Tanghin', 'Karpala', 'Pissy',
    'Cissin', 'Kossodo', 'Somgandé', 'Ouaga 2000', 'Patte d\'Oie',
    'Tampouy', 'Zone du Bois', 'Wemtenga', 'Kalgondin', 'Saaba', 'Rimkieta',
  ],
  'Bobo-Dioulasso': [
    'Dafra', 'Dô', 'Konsa', 'Sarfalao', 'Accart-Ville', 'Bolomakoté',
    'Colma', 'Diarradougou', 'Farakan', 'Kua', 'Lafiabougou', 'Ouezzinville',
    'Secteur 22', 'Sikasso-Cira', 'Tounouma',
  ],
  Koudougou: ['Secteur 1', 'Secteur 2', 'Burkina', 'Palogo', 'Sogpelcé', 'Issouka', 'Dapoya'],
  Ouahigouya: ['Secteur 1', 'Bogoya', 'Goumbourou', 'Sissamba', 'Tangaye', 'Youba'],
  Banfora: ['Secteur 1', 'Bounouna', 'Diarabakoko', 'Tangora', 'Sikaman'],
  Kaya: ['Secteur 1', 'Boussouma', 'Napalgué', 'Sector Nord'],
  Tenkodogo: ['Secteur 1', 'Bittou', 'Lergho', 'Zabré'],
  "Fada N'Gourma": ['Secteur 1', 'Natiaboani', 'Tibga', 'Diabo'],
  Dédougou: ['Secteur 1', 'Bankuy', 'Souri'],
  Dori: ['Secteur 1', 'Petit Paris', 'Bambofa'],
  Gaoua: ['Secteur 1', 'Bouroum-Bouroum', 'Loropéni'],
  Ziniaré: ['Secteur 1', 'Nomgana', 'Loumbila'],
  Manga: ['Secteur 1', 'Nobéré', 'Gogo'],
};

export const getQuartiers = (ville?: string) =>
  ville && QUARTIERS_BY_CITY[ville] ? QUARTIERS_BY_CITY[ville] : [];
