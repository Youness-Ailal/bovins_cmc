# Tâches de Hajar

Tu as **2 pages** à compléter :
- `frontend/app/(auth)/forgot-password/page.tsx` — Mot de passe oublié
- `frontend/app/(auth)/reset-password/page.tsx` — Réinitialisation du mot de passe

---

## Étape 1 — Récupérer le projet

```bash
git clone https://github.com/Youness-Ailal/bovins_cmc.git
cd bovins_cmc
```

---

## Étape 2 — Créer ta branche

```bash
git checkout -b hajar
```

---

## Étape 3 — Installer les dépendances

```bash
cd frontend
npm install
npm run dev
```

Ouvre http://localhost:3000 dans ton navigateur.

---

## Étape 4 — Compléter tes pages

### Page 1 — `frontend/app/(auth)/forgot-password/page.tsx`

Ouvre ce fichier et **remplace tout le contenu** par le code ci-dessous :

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/button";
import InputField from "@/components/ui/InputField";

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <div className="w-full max-w-[400px] flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1
          className="font-dm-sans text-[32px] font-bold text-label"
          style={{ letterSpacing: "-0.5px" }}
        >
          Mot de passe oublié
        </h1>
        <p className="font-inter text-[15px] text-subtle leading-relaxed">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <InputField
          label="Adresse email"
          id="email"
          type="email"
          placeholder="nom@exemple.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="flex flex-col gap-5 pt-1">
          <Button type="submit" className="w-full">
            Envoyer le lien
          </Button>
          <div className="flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 font-inter text-[13px] font-medium text-primary hover:text-primary-hover transition-colors"
            >
              <ArrowLeftIcon />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
```

---

### Page 2 — `frontend/app/(auth)/reset-password/page.tsx`

Ouvre ce fichier et **remplace tout le contenu** par le code ci-dessous :

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/button";
import InputField from "@/components/ui/InputField";

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <div className="w-full max-w-[400px] flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1
          className="font-dm-sans text-[32px] font-bold text-label"
          style={{ letterSpacing: "-0.5px" }}
        >
          Nouveau mot de passe
        </h1>
        <p className="font-inter text-[15px] text-subtle leading-relaxed">
          Créez un nouveau mot de passe sécurisé
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <InputField
          label="Nouveau mot de passe"
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <InputField
          label="Confirmer le mot de passe"
          id="confirm-password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          helperText="Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial."
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <div className="flex flex-col gap-5 pt-1">
          <Button type="submit" className="w-full">
            Réinitialiser le mot de passe
          </Button>
          <div className="flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 font-inter text-[13px] font-medium text-primary hover:text-primary-hover transition-colors"
            >
              <ArrowLeftIcon />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
```

---

## Étape 5 — Sauvegarder et envoyer

```bash
git add frontend/app/\(auth\)/forgot-password/page.tsx
git add frontend/app/\(auth\)/reset-password/page.tsx
git commit -m "feat: complete auth pages - Hajar"
git push origin hajar
```

---

## Étape 6 — Créer une Pull Request

1. Va sur https://github.com/Youness-Ailal/bovins_cmc
2. Clique sur **"Compare & pull request"**
3. Titre : `feat: auth pages - Hajar`
4. Clique **"Create pull request"**
