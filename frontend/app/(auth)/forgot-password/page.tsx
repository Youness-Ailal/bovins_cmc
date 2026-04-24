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
