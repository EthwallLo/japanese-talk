"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseConfigError } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isRegister = mode === "register";

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    if (!supabase) {
      setIsLoading(false);
      setError(supabaseConfigError);
      return;
    }

    const response = isRegister
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setIsLoading(false);

    if (response.error) {
      setError(response.error.message);
      return;
    }

    if (!isRegister || response.data.session) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }

    setMessage(
      "Compte créé. Vérifie tes emails si la confirmation est activée."
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Email</span>
        <input
          required
          autoComplete="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="toi@example.com"
        />
      </label>

      <label className="field">
        <span>Mot de passe</span>
        <input
          required
          autoComplete={isRegister ? "new-password" : "current-password"}
          minLength={6}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimum 6 caractères"
        />
      </label>

      <button
        className="button button-primary auth-submit"
        disabled={isLoading || !supabase}
        type="submit"
      >
        {isLoading ? "Patiente..." : isRegister ? "Créer mon compte" : "Me connecter"}
      </button>

      {supabaseConfigError ? <p className="form-error">{supabaseConfigError}</p> : null}
      {message ? <p className="form-message">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
    </form>
  );
}
