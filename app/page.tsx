export default function Home() {
  return (
    <main className="page">
      <section className="hero" aria-labelledby="home-title">
        <p className="eyebrow">Japanese Talk</p>
        <h1 id="home-title">Pratique le japonais, simplement.</h1>
        <p className="intro">
          Un espace pour progresser en conversation, revoir tes phrases et garder le fil.
        </p>
        <div className="actions" aria-label="Actions utilisateur">
          <a className="button button-primary" href="/login">
            Connexion
          </a>
          <a className="button button-secondary" href="/register">
            Inscription
          </a>
        </div>
      </section>
    </main>
  );
}
