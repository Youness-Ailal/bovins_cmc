"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/button";
import InputField from "@/components/ui/InputField";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
          Connexion
        </h1>
        <p className="font-inter text-[15px] text-subtle leading-relaxed">
          Accédez à votre espace de gestion
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

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="font-inter text-sm font-medium text-label">
              Mot de passe
            </label>
            <Link
              href="/forgot-password"
              className="font-inter text-[13px] font-medium text-primary hover:text-primary-hover transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 w-full rounded border border-border px-[14px] font-inter text-sm text-label bg-input placeholder:text-placeholder transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex flex-col gap-5 pt-1">
          <Button type="submit" className="w-full">
            Se connecter
          </Button>
          <p className="font-inter text-[13px] text-subtle text-center">
            Pas encore de compte ? Contactez votre administrateur
          </p>
        </div>
      </form>
    </div>
  );
}
