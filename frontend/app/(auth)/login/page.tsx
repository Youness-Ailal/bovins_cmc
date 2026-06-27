"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import InputField from "@/components/ui/InputField";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Echec de la connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-[400px] flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-dm-sans text-[32px] font-bold text-label">
          Connexion
        </h1>
        <p className="font-inter text-[15px] leading-relaxed text-subtle">
          Accedez a votre espace de gestion
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
          <label htmlFor="password" className="font-inter text-sm font-medium text-label">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            placeholder="Mot de passe"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 w-full rounded border border-border bg-input px-[14px] font-inter text-sm text-label placeholder:text-placeholder transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error && (
          <p className="rounded-[6px] bg-danger/10 px-3 py-2 font-inter text-[13px] text-danger">{error}</p>
        )}

        <div className="flex flex-col gap-5 pt-1">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
          <p className="text-center font-inter text-[13px] text-subtle">
            Demo : youness@bovitrack.ma / password123
          </p>
        </div>
      </form>
    </div>
  );
}
