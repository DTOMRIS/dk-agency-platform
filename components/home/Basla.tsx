export default function Basla() {
  const bullets = [
    '7-minute onboarding with guided baseline metrics',
    'Ready templates for launch, shift, and inventory reviews',
    'Owner/operator split modes to reduce dashboard noise',
  ];

  return (
    <section id="basla">
      <span className="home-kicker">Basla</span>
      <h2 className="home-title">Movcud axinlari pozmadan surerli baslangic.</h2>
      <p className="home-body">
        Keep current tools running while operators phase into unified planning. No hard cutover is required.
      </p>
      <div className="home-chip-row">
        {bullets.map((item) => (
          <span key={item} className="home-chip">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

