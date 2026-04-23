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
