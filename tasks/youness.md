# Youness — Stocks & Rations

**Ma partie :** la gestion des stocks (aliments, médicaments) et les rations
distribuées au troupeau. Logique : stock → ration → distribution → consommation.

🔗 App : https://bovitrack.netlify.app

## Pages que je présente

| Page | Lien | Ce que je montre |
|---|---|---|
| Liste stocks | https://bovitrack.netlify.app/stocks | Articles, quantités, seuils d'alerte |
| Nouvel article | https://bovitrack.netlify.app/stocks/nouveau | Création d'un article |
| Fiche article | https://bovitrack.netlify.app/stocks | Ouvrir une fiche + édition |
| Mouvement de stock | https://bovitrack.netlify.app/stocks/mouvement | Entrée / sortie / ajustement |
| Historique stock | https://bovitrack.netlify.app/stocks/historique | Tous les mouvements |
| Liste rations | https://bovitrack.netlify.app/rations | Rations + ingrédients |
| Nouvelle ration | https://bovitrack.netlify.app/rations/nouvelle | Composer une ration |
| Distribution | https://bovitrack.netlify.app/rations/distribution | Distribuer à une parcelle/lot |
| Historique rations | https://bovitrack.netlify.app/rations/historique | Distributions passées |

## Code derrière (backend)
- `controllers/stock.controller.js` — articles + mouvements de stock
- `controllers/ration.controller.js` — rations + distributions
- Modèles : `StockArticle`, `StockMouvement`, `Ration`, `Distribution`

## Ce que je dois dire (points clés)
1. Le lien **ration → distribution → consommation de stock** (les quantités baissent).
2. Les **seuils d'alerte** : quand un article passe sous son seuil, une alerte est
   déclenchée (reprise par la partie de Mohamed en temps réel).
3. Le **coût estimé** d'une distribution alimente les coûts d'alimentation du dashboard.

## Ordre de démo
Liste stocks (montrer un seuil bas) → Mouvement de stock → Rations → Distribution → Historique.
