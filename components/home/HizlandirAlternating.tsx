import Link from 'next/link';

interface HizlandirAlternatingProps {
  onKazanClick: () => void;
}

export default function HizlandirAlternating({ onKazanClick }: HizlandirAlternatingProps) {
  return (
    <section id="hizlandir">
      <span className="home-kicker">Hizlandir</span>
      <h2 className="home-title">Alternating modules for growth execution.</h2>
      <div className="alt-grid">
        <article className="alt-card">
          <h3>Module A: Revenue rhythm</h3>
          <p className="home-body">Schedule campaigns with staffing capacity and prep cost guardrails.</p>
        </article>
        <article className="alt-card">
          <h3>Module B: Distribution rhythm</h3>
          <p className="home-body">Push updates to newsroom, RSS and channel hooks from one editorial queue.</p>
        </article>
      </div>

      <div className="home-card" style={{ marginTop: '0.9rem' }}>
        <h3>KAZAN AI quick entry</h3>
        <p className="home-body">Estimate gross margin impact before execution. This is intentionally lightweight.</p>
        <Link href="/kazan-ai" className="home-btn home-btn-secondary" onClick={onKazanClick}>
          Open KAZAN AI estimator
        </Link>
      </div>
    </section>
  );
}
