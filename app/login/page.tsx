import Link from "next/link";
import { AuthForm } from "../components/auth-form";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-title">
        <p className="eyebrow">Connexion</p>
        <h1 id="login-title">Ravi de te revoir.</h1>
        <p className="intro">Connecte-toi pour retrouver ton espace de pratique.</p>
        <AuthForm mode="login" />
        <p className="auth-switch">
          Pas encore de compte ? <Link href="/register">Créer un compte</Link>
        </p>
      </section>
    </main>
  );
}
