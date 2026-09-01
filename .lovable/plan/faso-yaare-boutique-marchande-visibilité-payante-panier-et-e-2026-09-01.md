# Faso Yaare : boutique marchande, visibilité payante, panier et espace pub

## 1. Ma boutique (marchand)
- Nouvelle page `/ma-boutique` : infos de la boutique du compte connecté + liste de tous ses produits et annonces, avec édition/suppression et bouton "Booster".
- Bouton "Voir ma boutique" affiché dans Faso Yaare et dans le profil quand l'utilisateur possède une boutique.
- Les données viennent de la base liées au compte, donc tout reste intact après déconnexion/reconnexion.
- Badge de statut sur chaque produit : "En cours de diffusion" (pub active) ou "Visibilité limitée".

## 2. Visibilité restreinte vs publicité
- Chaque produit et chaque annonce Vente/Troc reçoit un niveau de visibilité : `limited` par défaut, `boosted` après une pub payante validée.
- Flux public : les produits `boosted` sont affichés à tous et en premier ; les produits `limited` ne sont montrés qu'à une petite fraction des visiteurs (échantillon stable côté serveur), plus toujours visibles pour leur propriétaire et dans la boutique officielle.
- Quand un abonnement pub devient actif, le produit/boutique ciblé passe automatiquement en `boosted` ; il repasse en `limited` à l'expiration.

## 3. Boutique officielle côté client
- Page publique `/boutique/:id` : bannière, infos, contact, et tous les produits publiés du marchand.
- Sur la fiche produit et les cartes : clic sur l'image = vue détaillée grand format (visionneuse plein écran) ; bouton "Visiter la boutique" vers `/boutique/:id`.

## 4. Vente / Troquer
- Même logique appliquée aux annonces d'occasion : persistance par compte, visibilité limitée puis boostée, vue grand format, page profil vendeur listant toutes ses annonces.

## 5. Messagerie : double contact
- Sur les fiches produit, annonce et boutique, deux boutons explicites : "Discuter sur WhatsApp" (lien wa.me pré-rempli avec le produit) et "Discuter dans la messagerie" (chat interne existant).

## 6. Espace Pub
- Page `/espace-pub` : historique des campagnes (cible, montant, durée, statut actif/expiré, date de fin) et tableau de bord simple avec visites de la boutique, vues produits, clics WhatsApp et portée des pubs en cours.
- Suivi des vues/clics enregistré à l'affichage et au clic (compteurs en base).

## 7. Panier
- Panier global : ajout de produits de plusieurs marchands, quantités, total par marchand et total général.
- Validation groupée créant une commande par marchand, avec notification au marchand via la messagerie interne + option WhatsApp.
- Icône panier dans la navigation avec badge rouge du nombre d'articles.

## 8. Logos de paiement
- Remplacement des logos Orange Money, Wave et Moov par les trois visuels officiels fournis.

## Détails techniques
- Base : ajouter `visibility` (`limited`/`boosted`) et compteurs `views_count`/`clicks_count` sur `articles` et `annonces_occasion` ; table `boutique_visits` (ou compteurs agrégés) pour les statistiques ; tables `orders` et `order_items` pour le panier ; trigger mettant à jour la visibilité quand `ad_subscriptions.status` devient `active`/expiré. GRANT + RLS sur chaque nouvelle table (lecture publique des produits boostés, écriture réservée au propriétaire ; commandes visibles par l'acheteur et le marchand).
- Fonction SECURITY DEFINER pour le flux public afin d'appliquer l'échantillonnage des produits `limited` sans exposer de données sensibles.
- Front : nouveau contexte `CartContext` (persisté en base pour l'utilisateur connecté), pages `MaBoutique`, `BoutiqueDetail`, `EspacePub`, `Panier`, routes ajoutées dans `App.tsx`, badge panier dans `BottomNavigation`.
- Logos importés comme assets CDN et branchés dans `PaymentOperators.tsx`.
