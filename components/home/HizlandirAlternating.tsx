import Link from 'next/link';

interface HizlandirAlternatingProps {
  onKazanClick: () => void;
}

export default function HizlandirAlternating({ onKazanClick }: HizlandirAlternatingProps) {
  return (
    <section id="hizlandir" className="dk-section dk-section-alt">
      <div className="dk-container">
        <span className="home-kicker">Hizlandir</span>
        <h2 className="home-title">Gelir, xerc ve dagitim qatlarini sinxron idare edin.</h2>

        <div className="dk-alt-row">
          <article className="alt-card">
            <h3>Panel A: Emeliyyat ritmi</h3>
            <p className="home-body">Shift, prep ve kampaniya vaxtlarini real margin datasina gore duzun.</p>
          </article>
          <aside className="dk-panel-mock">
            <strong>PanelMock</strong>
            <div>
              <span>Lunch demand</span>
              <b>+18%</b>
            </div>
            <div>
              <span>Prep load</span>
              <b>74%</b>
            </div>
            <div>
              <span>Waste risk</span>
              <b>low</b>
            </div>
          </aside>
        </div>

        <div className="dk-alt-row dk-alt-row-reverse">
          <article className="alt-card">
            <h3>Panel B: Dagitim ritmi</h3>
            <p className="home-body">Xeberler, RSS ve kanallara cixislari tek redaksiya panelinden idare edin.</p>
          </article>
          <aside className="dk-panel-mock">
            <strong>PanelMock</strong>
            <div>
              <span>RSS queue</span>
              <b>5 item</b>
            </div>
            <div>
              <span>Telegram sync</span>
              <b>ready</b>
            </div>
            <div>
              <span>Digest score</span>
              <b>89/100</b>
            </div>
          </aside>
        </div>

        <div className="home-card" style={{ marginTop: '1.2rem' }}>
          <h3>KAZAN AI giris noqtesi</h3>
          <p className="home-body">Deyerli UI yuku olmadan, qerar qabaqi P&amp;L impact hesablamasi.</p>
          <Link href="/kazan-ai" className="home-btn home-btn-secondary" onClick={onKazanClick}>
            KAZAN AI estimator ac
          </Link>
        </div>
      </div>
    </section>
  );
}
