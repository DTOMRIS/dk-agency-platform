export default function StatsBar() {
  const stats = [
    '6.7M monthly feed impressions',
    '41% higher newsletter click depth',
    'RSS-to-Telegram latency under 90 sec',
    'Full mobile parity for all sections',
  ];

  return (
    <section id="stats">
      <span className="home-kicker">Stats</span>
      <div className="home-chip-row" aria-label="performance stats">
        {stats.map((stat) => (
          <span key={stat} className="home-chip">
            {stat}
          </span>
        ))}
      </div>
    </section>
  );
}
