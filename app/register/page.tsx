import Link from "next/link";
import { AuthForm } from "../components/auth-form";

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="register-title">
        <p className="eyebrow">Inscription</p>
        <h1 id="register-title">Crée ton espace.</h1>
        <p className="intro">Quelques secondes et tu peux commencer à organiser ta pratique.</p>
        <AuthForm mode="register" />
        <p className="auth-switch">
          Déjà un compte ? <Link href="/login">Se connecter</Link>
        </p>
      </section>
    </main>
  );
}
