export default function StageCards() {
  const cards = [
    {
      title: 'Merhele 1: Diagnose',
      body: 'Read margin leaks, labor drift and campaign attribution in one view.',
    },
    {
      title: 'Merhele 2: Simulate',
      body: 'Run KAZAN AI scenarios before changing menu, staffing or media spend.',
    },
    {
      title: 'Merhele 3: Execute',
      body: 'Push to listings, newsletter and newsroom channels with measurable impact.',
    },
  ];

  return (
    <section id="stages">
      <span className="home-kicker">Marhele Blueprint</span>
      <h2 className="home-title">Alternativ hekayelendirme, vahid emeliyyat dili.</h2>
      <div className="home-cards">
        {cards.map((card) => (
          <article key={card.title} className="home-card">
            <h3>{card.title}</h3>
            <p className="home-body">{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

