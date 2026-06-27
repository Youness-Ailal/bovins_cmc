# Youness — Stocks & Rations

**Ma partie :** gestion du stock, composition des rations et distribution aux animaux.

## Pages à présenter

- `/stocks` — liste des articles, seuils, alertes
- `/stocks/nouveau` — création article
- `/stocks/[id]` — fiche article
- `/stocks/mouvement` — entrée, sortie, ajustement
- `/stocks/historique` — historique des mouvements
- `/rations` — liste des rations
- `/rations/nouvelle` — composer une ration
- `/rations/distribution` — distribuer une ration
- `/rations/historique` — historique des distributions

## Code frontend à citer

- `app/(dashboard)/stocks`
- `app/(dashboard)/rations`
- `components/ui/DataTable.tsx`
- `components/ui/ProgressBar.tsx`
- `lib/exportCsv.ts`

## Code backend à citer

- `controllers/stock.controller.js`
- `controllers/ration.controller.js`
- `models/StockArticle.js`
- `models/StockMouvement.js`
- `models/Ration.js`
- `models/Distribution.js`

## Points simples à dire

1. Un article de stock a une quantité, un seuil et un prix.
2. Les mouvements modifient la quantité : entrée, sortie, ajustement.
3. Si le stock passe sous le seuil, une alerte est créée.
4. Une ration est composée d'ingrédients.
5. La distribution consomme le stock et calcule un coût estimé.

## Démo rapide

Stocks → mouvement → rations → distribution → historique.
