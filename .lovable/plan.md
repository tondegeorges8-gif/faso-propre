# Uniformiser les paiements Mobile Money

## Résultat attendu
- Utiliser les trois logos fournis : Orange Money, Moov Africa et Wave.
- Les présenter dans trois cartes de même taille, nettes sur téléphone, avec sélection visible et accessible.
- Réutiliser exactement le même sélecteur sur le paiement du panier, l’achat de publicité/boosts et les abonnements prestataire/premium.
- Harmoniser aussi le choix de réseau pour les retraits afin que les écrans transactionnels restent cohérents.

## Mise en œuvre
1. Stocker les trois images fournies comme médias de l’application et remplacer les anciennes images.
2. Refaire le sélecteur commun avec des cartes carrées blanches, bordure subtile, indicateur de sélection et tailles de logo uniformes.
3. Brancher ce sélecteur commun sur les écrans de paiement existants et le formulaire de retrait.
4. Conserver la logique actuelle : simulation/USSD/QR quand elle existe, sans connecter de nouvelle passerelle réelle.
5. Vérifier le rendu du paiement sur mobile, les états de sélection et l’absence d’erreurs.

## Détails techniques
- Les images resteront fidèles aux fichiers officiels fournis ; elles seront affichées dans un cadre uniforme plutôt que redessinées.
- Le composant commun évitera les différences entre panier, boosts et abonnements.
- Aucun traitement réel de paiement ne sera ajouté sans accès officiel aux API opérateurs.
