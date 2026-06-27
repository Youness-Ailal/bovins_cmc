# Hajar — Dashboard, Finances & Fournisseurs

**Ma partie :** la vue décisionnelle — le tableau de bord, les finances (coûts,
rentabilité) et les achats fournisseurs (qui génèrent les coûts).

🔗 App : https://bovitrack.netlify.app

## Pages que je présente

| Page | Lien | Ce que je montre |
|---|---|---|
| Tableau de bord | https://bovitrack.netlify.app/dashboard | KPIs, graphiques troupeau & coûts, filtre période |
| Finances | https://bovitrack.netlify.app/finances | Coûts, revenus, marges |
| Rentabilité animal | https://bovitrack.netlify.app/finances | Ouvrir un animal : coût vs valeur |
| Fournisseurs | https://bovitrack.netlify.app/fournisseurs | Liste des fournisseurs |
| Nouveau fournisseur | https://bovitrack.netlify.app/fournisseurs/nouveau | Création |
| Commandes d'achat | https://bovitrack.netlify.app/fournisseurs/commandes | Liste des commandes |
| Nouvelle commande | https://bovitrack.netlify.app/fournisseurs/commandes/nouvelle | Créer une commande |

## Code derrière (backend)
- `controllers/dashboard.controller.js` — KPIs + rentabilité (coûts filtrés par période)
- `controllers/finances.controller.js` — coûts, revenus, marges
- `controllers/fournisseur.controller.js` — fournisseurs + commandes d'achat
- Graphiques : `TroupeauBarChart`, `CoutsDonutChart`

## Ce que je dois dire (points clés)
1. Le **tableau de bord** : KPIs + graphiques (répartition du troupeau, coûts par période).
2. Les **coûts filtrés par période** (alimentation / vétérinaire / achat) et la
   **rentabilité par animal** (coût cumulé vs valeur, marge).
3. Les **commandes fournisseurs** sont la source des coûts d'achat (lien achats → finances).

## Ordre de démo
Dashboard (changer la période) → Finances → rentabilité d'un animal → Fournisseurs → une commande.
