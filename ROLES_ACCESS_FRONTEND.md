# Accès par rôle — BOVITRACK

Ce document résume les rôles à présenter dans le module Authentification / Administration.

## Principe

L'application utilise maintenant **3 rôles seulement** :

- **Admin**
- **Responsable**
- **Vétérinaire**

Le rôle **Opérateur** a été supprimé.

Important : le contrôle d'accès par rôle est appliqué **côté frontend uniquement** pour l'affichage et la navigation des pages. Le backend garde uniquement l'authentification par token JWT.

## Règles d'accès aux pages

| Rôle | Pages accessibles | Objectif |
|---|---|---|
| Admin | Toutes les pages | Gestion complète de l'application, des utilisateurs, des paramètres et des données métier. |
| Responsable | Dashboard, Animaux, Parcelles, Stocks, Rations, Finances, Fournisseurs, Alertes | Gestion opérationnelle et économique de la ferme. |
| Vétérinaire | Dashboard, Animaux, Santé, Alertes, BoviAI | Suivi sanitaire, traitements, alertes et consultation du contexte animal. |

## Détail par module

| Module | Admin | Responsable | Vétérinaire |
|---|---:|---:|---:|
| Tableau de bord | Oui | Oui | Oui |
| Animaux | Oui | Oui | Oui |
| Parcelles | Oui | Oui | Non |
| Stocks | Oui | Oui | Non |
| Rations | Oui | Oui | Non |
| Santé | Oui | Non | Oui |
| Finances | Oui | Oui | Non |
| Fournisseurs | Oui | Oui | Non |
| Centre des alertes | Oui | Oui | Oui |
| BoviAI | Oui | Non | Oui |
| Administration | Oui | Non | Non |

## Comptes de démonstration conseillés

| Personne | Rôle conseillé | Pourquoi |
|---|---|---|
| Salma | Admin | Elle présente l'authentification, les utilisateurs, les rôles, les races et les paramètres. |
| Safouane | Responsable | Il présente les animaux, les parcelles, les pesées et les transferts. |
| Youness | Responsable | Il présente les stocks, les mouvements, les rations et les distributions. |
| Hajar | Responsable | Elle présente le dashboard, les finances, les fournisseurs et les commandes. |
| Mohamed | Vétérinaire | Il présente la santé, les traitements, les alertes et BoviAI. |

## Comportement dans l'interface

- Le menu latéral affiche uniquement les pages autorisées pour le rôle connecté.
- Si un utilisateur essaie d'ouvrir une page non autorisée directement par URL, il est redirigé vers `/dashboard`.
- Les boutons d'action à l'intérieur des pages ne sont plus filtrés par rôle : le filtrage se fait au niveau des pages.

## Routes principales

### Admin

```txt
/dashboard
/animaux
/parcelles
/stocks
/rations
/sante
/finances
/fournisseurs
/performance
/boviai
/administration
```

### Responsable

```txt
/dashboard
/animaux
/parcelles
/stocks
/rations
/finances
/fournisseurs
/performance
```

### Vétérinaire

```txt
/dashboard
/animaux
/sante
/performance
/boviai
```
