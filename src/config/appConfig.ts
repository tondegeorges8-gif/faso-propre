// src/config/appConfig.ts

export const APP_CONFIG = {
  appName: "Faso Propre",
  version: "1.0.0",
  description: "Application civique pour la propreté urbaine et les services citoyens.",

  // Liste des onglets et sections principales (chemins alignés sur les routes réelles)
  sections: [
    {
      name: "Accueil",
      path: "/",
      description: "Tableau de bord principal et vue d'ensemble."
    },
    {
      name: "Signalement",
      path: "/new-report",
      description: "Permet aux citoyens de signaler un problème urbain avec géolocalisation intégrée."
    },
    {
      name: "Faso Yaar",
      path: "/faso-yaar",
      description: "Le marché local et commercial de l'application."
    },
    {
      name: "Panier",
      path: "/panier",
      description: "Panier d'achat et commandes groupées."
    },
    {
      name: "Profil",
      path: "/profile",
      description: "Profil utilisateur, fidélité et paramètres."
    },
    // Ajoute tes futurs onglets/sections simplement ici en respectant le format :
    // { name: "Nom", path: "/chemin", description: "Ce que ça fait" }
  ]
};
